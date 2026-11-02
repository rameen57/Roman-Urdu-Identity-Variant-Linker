ABBREV = {
    'muhd': 'muhammad', 'mohd': 'muhammad', 'md': 'muhammad',
    'mohammad': 'muhammad', 'mohammed': 'muhammad',
    'muhammed': 'muhammad', 'mohamed': 'muhammad', 'muhamad': 'muhammad',
}

# Order matters: digraphs first, then vowel and consonant variants.
RULES = [
    ('ph', 'f'), ('kh', 'x'), ('gh', 'g'), ('sh', 's'), ('ch', 'c'),
    ('th', 't'), ('aa', 'a'), ('ee', 'i'), ('ii', 'i'), ('oo', 'u'),
    ('uu', 'u'), ('ei', 'ai'), ('ey', 'ai'), ('ay', 'ai'), ('ou', 'u'),
    ('q', 'k'), ('w', 'v'), ('z', 'j'),
]


def clean_tokens(name: str):
    import re
    name = re.sub(r'[^a-z ]', ' ', name.lower())
    return [ABBREV.get(t, t) for t in name.split()]


def token_key(tok: str) -> str:
    import re
    for a, b in RULES:
        tok = tok.replace(a, b)
    tok = re.sub(r'(.)\1+', r'\1', tok)          # collapse double letters
    return tok[0] + re.sub(r'[aeiouyh]', '', tok[1:])   # keep first letter, drop vowels


def phonetic_key(name: str) -> str:
    return ' '.join(token_key(t) for t in clean_tokens(name))
EOF