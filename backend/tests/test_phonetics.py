import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from phonetics import phonetic_key, clean_tokens, token_key  # noqa: E402


def test_phonetic_equal_variants():
    assert phonetic_key('Muhammad Ali Khan') == phonetic_key('Mohammed Alee Khaan')
    assert phonetic_key('Muhd. Ali Khan') == phonetic_key('Muhammad Ali Khan')
    assert phonetic_key('Hussain Raza') == phonetic_key('Husain Reza')


def test_phonetic_different():
    assert phonetic_key('Muhammad Ali Khan') != phonetic_key('Muhammad Ahmed Khan')


def test_validate_id():
    from mcp_server import validate_fictional_id  # noqa: E402
    # 1+4+0+0+0+1+4+2 = 12 -> 12 % 9 = 3
    assert validate_fictional_id('FRO-14-000142-3')['valid'] is True
    assert validate_fictional_id('FRO-14-000142-4')['valid'] is False
    assert validate_fictional_id('BAD')['valid'] is False


def test_decision_band_likely():
    from mcp_server import compare_records  # noqa: E402
    ra = {'name': 'Muhammad Ali Khan', 'father_name': 'Abdul Rahman Khan', 'birth_year': 1988, 'city': 'Lahore'}
    rb = {'name': 'Mohammed Alee Khaan', 'father_name': 'Abdul Rehman Khan', 'birth_year': 1988, 'city': 'Lahor'}
    res = compare_records(ra, rb)
    assert res['band'] == 'Likely same'


def test_decision_band_hard_conflict():
    from mcp_server import compare_records  # noqa: E402
    ra = {'name': 'Ali Khan', 'father_name': 'Tariq Khan', 'birth_year': 1995, 'city': 'Lahore'}
    rb = {'name': 'Ahmed Khan', 'father_name': 'Tariq Khan', 'birth_year': 1996, 'city': 'Lahore'}
    res = compare_records(ra, rb)
    assert res['band'] == 'Hard conflict'

EOF