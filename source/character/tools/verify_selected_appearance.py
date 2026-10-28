"""Verify the user's selected appearance files; this is not a visual quality gate."""
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
BASELINE = ROOT / 'production/appearance-baseline-20261027'
MANIFEST_SHA = '88206f1ec23d25bf8439933747cb2c31c4dc8f38fa973e1c3c369022e8786c0d'


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


class PanelDocument(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.frames = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'iframe' and data.get('id') == 'panel':
            self.frames.append(data.get('srcdoc', ''))


def verify():
    checks = []

    def check(path, expected, kind):
        actual = digest(path) if path.is_file() else None
        checks.append(dict(file=str(path), kind=kind, expected=expected,
                           actual=actual, passed=actual == expected))

    manifest_path = BASELINE / 'manifest.json'
    check(manifest_path, MANIFEST_SHA, 'locked_manifest')
    manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    check(BASELINE / manifest['frozenPreview']['file'],
          manifest['frozenPreview']['sha256'], 'frozen_preview')
    for group in ('sources', 'assets'):
        for item in manifest[group]:
            check(Path(item['file']), item['sha256'], 'current_' + group)
            check(BASELINE / item['snapshot'], item['sha256'], 'frozen_' + group)

    # The HUD may evolve independently. This comparison is reported, not used
    # to certify either appearance or the correctness of future UI changes.
    documents = []
    for path in (BASELINE / 'character-preview.html',
                 ROOT.parent / 'dafeiyu-dsh-panel/qa/character-preview.html'):
        parser = PanelDocument()
        parser.feed(path.read_text(encoding='utf-8-sig'))
        documents.append(parser.frames)
    return {
        'schema': 'dafeiyu.selected-appearance.integrity.v1',
        'checkedAtUTC': datetime.now(timezone.utc).isoformat(),
        'chosenURL': manifest['chosenURL'],
        'scope': 'Source integrity only. No final appearance, all-angle, motion or physics acceptance is implied.',
        'checks': checks,
        'previewPanelDocumentIdentical': len(documents[0]) == 1 and documents[0] == documents[1],
        'sourceIntegrityPassed': all(item['passed'] for item in checks),
        'finalQualityPassed': False,
    }


if __name__ == '__main__':
    result = verify()
    output = ROOT / 'metadata/selected-appearance-integrity.json'
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    failed = [item['file'] for item in result['checks'] if not item['passed']]
    print(json.dumps(dict(sourceIntegrityPassed=result['sourceIntegrityPassed'],
                          checkedFiles=len(result['checks']), mismatches=failed,
                          previewPanelDocumentIdentical=result['previewPanelDocumentIdentical'],
                          finalQualityPassed=False), ensure_ascii=False))
    raise SystemExit(0 if result['sourceIntegrityPassed'] else 1)
