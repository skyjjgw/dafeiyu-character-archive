"""Verify/extract the complete private character archive using Python's standard library."""
import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import tarfile

BLOCK = 1024 * 1024

class PartsReader(io.RawIOBase):
    def __init__(self, paths):
        self.paths = iter(paths)
        self.current = None
    def readable(self): return True
    def readinto(self, buf):
        while True:
            if self.current is None:
                try: self.current = next(self.paths).open('rb')
                except StopIteration: return 0
            n = self.current.readinto(buf)
            if n: return n
            self.current.close()
            self.current = None
    def close(self):
        if self.current is not None: self.current.close()
        super().close()

def check_parts(folder, manifest):
    for part in manifest['parts']:
        path = folder / part['name']
        if path.stat().st_size != part['size']:
            raise ValueError('Part size mismatch: ' + path.name)
        with path.open('rb') as stream:
            digest = hashlib.file_digest(stream, 'sha256').hexdigest()
        if digest != part['sha256']:
            raise ValueError('Part SHA256 mismatch: ' + path.name)
        print('PART_OK ' + path.name, flush=True)

def process(folder, manifest, destination=None):
    expected = {f['path']: f for f in manifest['files']}
    seen = set()
    total = 0
    paths = [folder / p['name'] for p in manifest['parts']]
    with PartsReader(paths) as raw, io.BufferedReader(raw, BLOCK) as joined:
        with gzip.GzipFile(fileobj=joined, mode='rb') as compressed:
            with tarfile.open(fileobj=compressed, mode='r|', bufsize=BLOCK) as archive:
                for member in archive:
                    name = member.name.rstrip('/')
                    rel = PurePosixPath(name)
                    if rel.is_absolute() or '..' in rel.parts or ':' in name:
                        raise ValueError('Unsafe archive path: ' + name)
                    if member.isdir():
                        if destination: (destination / name).mkdir(parents=True, exist_ok=True)
                        continue
                    if not member.isfile() or name not in expected or name in seen:
                        raise ValueError('Unexpected/duplicate archive member: ' + name)
                    record = expected[name]
                    if member.size != record['size']:
                        raise ValueError('Archived size mismatch: ' + name)
                    h = hashlib.sha256()
                    extracted = 0
                    output = None
                    if destination:
                        target = destination / name
                        target.parent.mkdir(parents=True, exist_ok=True)
                        output = target.open('xb')
                    try:
                        stream = archive.extractfile(member)
                        while chunk := stream.read(BLOCK):
                            h.update(chunk)
                            extracted += len(chunk)
                            if output: output.write(chunk)
                    finally:
                        if output: output.close()
                    if extracted != record['size'] or h.hexdigest() != record['sha256']:
                        raise ValueError('Restored file SHA256 mismatch: ' + name)
                    if destination:
                        os.utime(destination / name, ns=(record['mtime_ns'], record['mtime_ns']))
                    seen.add(name)
                    total += extracted
                    if len(seen) % 2000 == 0: print(f'FILES_OK {len(seen)}', flush=True)
                # Read the remaining trailer to force gzip CRC/end-of-stream validation.
                while compressed.read(BLOCK): pass
    if seen != set(expected):
        raise ValueError('Missing archived files: ' + str(len(set(expected) - seen)))
    return {'verifiedFiles':len(seen), 'verifiedBytes':total, 'allFileHashesMatch':True,
            'gzipTrailerChecked':True, 'extracted':bool(destination)}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--parts', type=Path, required=True)
    parser.add_argument('--extract-to', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text(encoding='utf-8'))
    destination = args.extract_to
    if destination:
        if destination.exists() and any(destination.iterdir()):
            raise ValueError('Extraction destination must be new/empty.')
        destination.mkdir(parents=True, exist_ok=True)
    check_parts(args.parts, manifest)
    result = process(args.parts, manifest, destination)
    result['partHashesMatch'] = True
    if args.report: args.report.write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result), flush=True)

if __name__ == '__main__': main()
