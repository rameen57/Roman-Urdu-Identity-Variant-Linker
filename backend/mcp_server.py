import json
import math
import os
import re
from difflib import SequenceMatcher

from mcp.server.fastmcp import FastMCP

from phonetics import ABBREV, RULES, clean_tokens, phonetic_key

mcp = FastMCP(
    name='Identity Variant Linker',
    host='127.0.0.1',
    port=8765,
    stateless_http=True,
    json_response=True,
)

GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
RECORDS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'records.json')
LINKS_DIR = os.path.join(os.path.dirname(__file__), 'data')
LINKS_FILE = os.path.join(LINKS_DIR, 'ltm.json')

try:
    with open(RECORDS_FILE, 'r', encoding='utf-8') as f:
        RECORDS = json.load(f)
except Exception:
    RECORDS = {}

_geo_cache = {}


def haversine_km(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(a))


def geocode_city(city, country_code='PK'):
    key = (city.strip().lower(), country_code)
    if key in _geo_cache:
        return _geo_cache[key]
    try:
        import httpx
        r = httpx.get(
            GEO_URL,
            timeout=10,
            params={'name': city, 'count': 5, 'language': 'en', 'format': 'json', 'countryCode': country_code},
        )
        r.raise_for_status()
        results = [x for x in r.json().get('results', []) if x.get('country_code') == country_code]
    except Exception as e:
        return {'error': 'Geocoding API unreachable: ' + str(e)}
    if not results:
        return {'error': 'No geocoding match for: ' + city}
    top = results[0]
    out = {
        'query': city,
        'matched_name': top['name'],
        'admin1': top.get('admin1'),
        'latitude': top['latitude'],
        'longitude': top['longitude'],
        'country': top.get('country'),
    }
    _geo_cache[key] = out
    return out


@mcp.tool()
def phonetic_key(name: str) -> dict:
    """Normalise a Roman-Urdu name into a phonetic key."""
    return {'name': name, 'key': phonetic_key(name)}


@mcp.tool()
def name_similarity(name_a: str, name_b: str) -> dict:
    """Compare two Roman-Urdu names. Returns phonetic, spelling and combined scores."""
    ta, tb = clean_tokens(name_a), clean_tokens(name_b)
    ka, kb = phonetic_key(name_a), phonetic_key(name_b)
    if not ta or not tb:
        return {'error': 'Both names must contain letters.'}
    phon = SequenceMatcher(None, ka, kb).ratio()
    lex = SequenceMatcher(None, ' '.join(ta), ' '.join(tb)).ratio()
    tokens_equal = (
        len(ta) == len(tb)
        and all(token_key(x) == token_key(y) for x, y in zip(ta, tb))
    )
    return {
        'key_a': ka,
        'key_b': kb,
        'phonetic_score': round(phon, 2),
        'spelling_score': round(lex, 2),
        'combined_score': round(0.6 * phon + 0.4 * lex, 2),
        'all_tokens_phonetically_equal': tokens_equal,
    }


@mcp.tool()
def compare_records(record_a: dict, record_b: dict) -> dict:
    """Compare two records field by field and return per-field evidence plus a band."""
    name_sim = name_similarity(record_a.get('name', ''), record_b.get('name', ''))
    if 'error' in name_sim:
        return name_sim

    fa = record_a.get('father_name', '')
    fb = record_b.get('father_name', '')
    father_sim = SequenceMatcher(None, phonetic_key(fa), phonetic_key(fb)).ratio() if fa and fb else 0.0

    ya, yb = record_a.get('birth_year'), record_b.get('birth_year')
    year_diff = abs(ya - yb) if ya is not None and yb is not None else None
    year_agree = year_diff is not None and year_diff <= 1

    city_a = record_a.get('city', '')
    city_b = record_b.get('city', '')
    city_res = compare_cities(city_a, city_b)
    city_same = city_res.get('verdict') == 'same place' if 'verdict' in city_res else False

    combined = name_sim['combined_score']
    tokens_equal = name_sim['all_tokens_phonetically_equal']

    supporting = father_sim >= 0.85 or year_agree or city_same

    if combined >= 0.92 and tokens_equal and supporting:
        band = 'Likely same'
    elif combined >= 0.75 or not tokens_equal:
        band = 'Possible'
    else:
        band = 'Unlikely'

    if year_diff is not None and year_diff > 1:
        band = 'Hard conflict'

    return {
        'name_similarity': name_sim,
        'father_name_similarity': round(father_sim, 2),
        'birth_year_diff': year_diff,
        'birth_year_agree': year_agree,
        'city_comparison': city_res,
        'city_same_place': city_same,
        'combined_score': combined,
        'all_tokens_phonetically_equal': tokens_equal,
        'band': band,
    }


@mcp.tool()
def validate_fictional_id(id_value: str) -> dict:
    """Check a fictional ID of the form FRO-DD-NNNNNN-C."""
    parts = id_value.strip().upper().split('-')
    if len(parts) != 4 or parts[0] != 'FRO':
        return {'valid': False, 'reason': 'Format must be FRO-DD-NNNNNN-C.'}
    dd, serial, check = parts[1], parts[2], parts[3]
    if not (dd.isdigit() and len(dd) == 2 and serial.isdigit()
            and len(serial) == 6 and check.isdigit() and len(check) == 1):
        return {'valid': False, 'reason': 'Wrong field lengths or non-digits.'}
    expected = sum(int(d) for d in dd + serial) % 9
    if int(check) != expected:
        return {'valid': False, 'reason': 'Check digit should be ' + str(expected) + '.'}
    return {'valid': True, 'reason': 'Format and check digit are correct.'}


@mcp.tool()
def resolve_city(city: str) -> dict:
    """Look up a Pakistani city with the Open-Meteo geocoding API."""
    return geocode_city(city)


@mcp.tool()
def compare_cities(city_a: str, city_b: str) -> dict:
    """Decide if two city spellings are the same place, using the geocoding API."""
    a, b = geocode_city(city_a), geocode_city(city_b)
    if 'error' in a or 'error' in b:
        score = SequenceMatcher(None, phonetic_key(city_a), phonetic_key(city_b)).ratio()
        return {
            'method': 'phonetic fallback',
            'similarity': round(score, 2),
            'note': a.get('error') or b.get('error'),
            'verdict': 'same place' if score >= 0.85 else 'different places',
        }
    km = haversine_km(a['latitude'], a['longitude'], b['latitude'], b['longitude'])
    verdict = 'same place' if km <= 5 else 'nearby' if km <= 50 else 'different places'
    return {
        'method': 'geocoding API',
        'matched_a': a['matched_name'],
        'matched_b': b['matched_name'],
        'distance_km': round(km, 1),
        'verdict': verdict,
    }


@mcp.tool()
def search_candidates(name: str) -> dict:
    """Find local registry records whose name sounds similar."""
    key = phonetic_key(name)
    hits = []
    for rid, rec in RECORDS.items():
        score = SequenceMatcher(None, key, phonetic_key(rec['name'])).ratio()
        if score >= 0.8:
            hits.append({'record_id': rid, 'key_score': round(score, 2), **rec})
    return {'candidates': sorted(hits, key=lambda h: -h['key_score'])}


def _load_links():
    if os.path.exists(LINKS_FILE):
        with open(LINKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def _save_links(links):
    os.makedirs(LINKS_DIR, exist_ok=True)
    with open(LINKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(links, f, indent=2)


@mcp.tool()
def save_link(record_a: str, record_b: str, relation: str, score: float, evidence: str) -> dict:
    """Save an officer-confirmed decision. Call ONLY after the officer confirms."""
    if relation not in ('confirmed_same', 'rejected_same'):
        return {'error': "relation must be 'confirmed_same' or 'rejected_same'"}
    links = _load_links()
    links.append({
        'record_a': record_a,
        'record_b': record_b,
        'relation': relation,
        'score': score,
        'evidence': evidence,
        'confirmed_by': 'officer',
        'date': __import__('datetime').datetime.utcnow().date().isoformat(),
    })
    _save_links(links)
    return {'saved': True, 'total_links': len(links)}


@mcp.tool()
def get_links(record_id: str) -> dict:
    """Past confirmed or rejected links for a record (long-term memory)."""
    return {'links': [l for l in _load_links() if record_id in (l['record_a'], l['record_b'])]}


@mcp.resource('policy://matching-thresholds')
def matching_thresholds() -> str:
    return (
        'Likely same: combined >= 0.92 and all tokens phonetically equal and at least one supporting field agrees. '
        'Possible: combined 0.75 to 0.92, or tokens differ. '
        'Unlikely: combined < 0.75. '
        'Hard conflict: birth years differ by more than 1 -> reject.'
    )


@mcp.prompt()
def review_candidate_match(name_a: str, name_b: str) -> str:
    return (
        'Review whether ' + name_a + ' and ' + name_b + ' may be the same person. '
        'Use the tools, cite the policy, list evidence for and against, '
        'and ask the officer to confirm before any link is saved.'
    )


if __name__ == '__main__':
    mcp.run(transport='streamable-http')
EOF