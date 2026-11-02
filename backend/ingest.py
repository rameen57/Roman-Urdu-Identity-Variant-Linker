import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from phonetics import phonetic_key  # noqa: E402

BASE_DIR = os.path.dirname(__file__)
DOCS_DIR = os.path.join(BASE_DIR, 'data', 'docs')
OUT_FILE = os.path.join(BASE_DIR, 'data', 'rag_index.json')


def chunk_text(text, size=400, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + size])
        start += size - overlap
    return [c for c in chunks if c.strip()]


def main():
    index = []
    if not os.path.isdir(DOCS_DIR):
        print('No docs dir found.')
        return
    for fname in sorted(os.listdir(DOCS_DIR)):
        if not fname.endswith('.md'):
            continue
        path = os.path.join(DOCS_DIR, fname)
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
        doc_id = fname.replace('.md', '')
        title = doc_id.replace('_', ' ')
        for i, chunk in enumerate(chunk_text(text)):
            index.append({
                'id': f'{doc_id}-{i}',
                'doc_id': doc_id,
                'title': title,
                'text': chunk,
                'phonetic_key': phonetic_key(chunk),
            })
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)
    print(f'Ingested {len(index)} chunks from {len([f for f in os.listdir(DOCS_DIR) if f.endswith(".md")])} documents -> {OUT_FILE}')


if __name__ == '__main__':
    main()
