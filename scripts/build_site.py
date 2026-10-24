"""Gera o portal estático para GitHub Pages sem dependências externas."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'docs'


def build():
    records = json.loads((ROOT / 'exercicios/catalogo.json').read_text(encoding='utf-8'))
    assert len({item['arquivo'] for item in records}) == len(records)
    for item in records:
        source = (ROOT / item['arquivo']).resolve()
        if not source.is_relative_to(ROOT):
            raise ValueError('Arquivo fora do projeto')
        item['codigo'] = source.read_text(encoding='utf-8')
    OUTPUT.mkdir(exist_ok=True)
    for name in ('index.html', 'styles.css', 'app.js'):
        shutil.copyfile(ROOT / 'site' / name, OUTPUT / name)
    (OUTPUT / 'exercicios.json').write_text(json.dumps(records, ensure_ascii=False), encoding='utf-8')
    (OUTPUT / '.nojekyll').touch()
    print(f'Portal gerado em docs/: {len(records)} exercícios.')


if __name__ == '__main__':
    build()
