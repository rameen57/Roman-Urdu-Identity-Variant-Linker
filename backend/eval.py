import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from phonetics import phonetic_key, clean_tokens, token_key  # noqa: E402
from difflib import SequenceMatcher

PAIRS_FILE = os.path.join(os.path.dirname(__file__), 'eval', 'pairs.json')

PAIRS = [
    # same person
    ('REC-014', 'REC-097', True), ('REC-014', 'REC-205', True), ('REC-014', 'REC-219', True),
    ('REC-332', 'REC-341', True), ('REC-410', 'REC-418', True),
    # different / hard negatives
    ('REC-014', 'REC-131', False), ('REC-600', 'REC-601', False), ('REC-097', 'REC-131', False),
    ('REC-332', 'REC-410', False), ('REC-501', 'REC-131', False),
    # near misses
    ('REC-501', 'REC-509', False),
]


def score(name_a, name_b):
    ta, tb = clean_tokens(name_a), clean_tokens(name_b)
    ka, kb = phonetic_key(name_a), phonetic_key(name_b)
    phon = SequenceMatcher(None, ka, kb).ratio()
    lex = SequenceMatcher(None, ' '.join(ta), ' '.join(tb)).ratio()
    te = len(ta) == len(tb) and all(token_key(x) == token_key(y) for x, y in zip(ta, tb))
    combined = 0.6 * phon + 0.4 * lex
    return combined, te


def band(combined, te, supporting=True):
    if combined >= 0.92 and te and supporting:
        return 'Likely same'
    if combined >= 0.75 or not te:
        return 'Possible'
    return 'Unlikely'


def main():
    try:
        sys.path.insert(0, os.path.dirname(__file__))
        with open(os.path.join(os.path.dirname(__file__), 'data', 'records.json'), 'r', encoding='utf-8') as f:
            RECORDS = json.load(f)
    except Exception:
        RECORDS = {}

    tp = fp = fn = tn = 0
    exact_tp = exact_fp = exact_fn = exact_tn = 0
    rows = []
    for a_id, b_id, label in PAIRS:
        ra, rb = RECORDS.get(a_id), RECORDS.get(b_id)
        if not ra or not rb:
            continue
        combined, te = score(ra['name'], rb['name'])
        pred = band(combined, te) == 'Likely same'
        exact_pred = ra['name'].lower() == rb['name'].lower()
        if pred and label: tp += 1
        if pred and not label: fp += 1
        if not pred and label: fn += 1
        if not pred and not label: tn += 1
        if exact_pred and label: exact_tp += 1
        if exact_pred and not label: exact_fp += 1
        if not exact_pred and label: exact_fn += 1
        if not exact_pred and not label: exact_tn += 1
        rows.append((a_id, b_id, ra['name'], rb['name'], round(combined, 2), te, pred, label))

    print('=== Our tools ===')
    print(f'TP={tp} FP={fp} FN={fn} TN={tn}')
    prec = tp / max(1, tp + fp); rec = tp / max(1, tp + fn)
    print(f'Precision={prec:.2f} Recall={rec:.2f}')
    print('=== Exact string baseline ===')
    print(f'TP={exact_tp} FP={exact_fp} FN={exact_fn} TN={exact_tn}')
    ep = exact_tp / max(1, exact_tp + exact_fp); er = exact_tp / max(1, exact_tp + exact_fn)
    print(f'Precision={ep:.2f} Recall={er:.2f}')
    print()
    print('Disclaimer: small, hand-made, fictional test set measured on our own data. NOT a benchmark. No general accuracy claims.')
    print('Rows:')
    for r in rows:
        print(r)


if __name__ == '__main__':
    main()
