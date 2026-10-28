"""Apply a small post-snapshot supplement after restoring the base archive."""
import argparse,hashlib,json,zipfile
from pathlib import Path,PurePosixPath

def digest(p):
    with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--manifest',type=Path,required=True);ap.add_argument('--zip',type=Path,required=True)
    ap.add_argument('--extract-to',type=Path);args=ap.parse_args()
    manifest=json.loads(args.manifest.read_text(encoding='utf-8'))
    if digest(args.zip)!=manifest['archive']['sha256']:raise ValueError('Supplement archive SHA256 mismatch.')
    with zipfile.ZipFile(args.zip) as archive:
        if set(archive.namelist())!={f['path'] for f in manifest['files']}:raise ValueError('Unexpected supplement entries.')
        for f in manifest['files']:
            rel=PurePosixPath(f['path'])
            if rel.is_absolute() or '..' in rel.parts or ':' in f['path']:raise ValueError('Unsafe supplement path.')
            data=archive.read(f['path'])
            if len(data)!=f['size'] or hashlib.sha256(data).hexdigest()!=f['sha256']:raise ValueError('Supplement file SHA256 mismatch.')
            if args.extract_to:
                target=args.extract_to/f['path'];target.parent.mkdir(parents=True,exist_ok=True)
                if target.exists():
                    current=digest(target)
                    if current==f['sha256']:continue
                    if current!=f.get('previousSHA256'):raise ValueError('Refusing to overwrite edited/new file: '+f['path'])
                target.write_bytes(data)
    print(json.dumps({'supplementFiles':len(manifest['files']),'allFileHashesMatch':True,'extracted':bool(args.extract_to)}))
if __name__=='__main__':main()
