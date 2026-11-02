# Roman-Urdu Transliteration Rules

Roman Urdu has no fixed orthography, so the same sound is written many ways. Common variant families include:
- aa / a (e.g., Khaan / Khan)
- ee / i (e.g., Alee / Ali)
- kh / x (used internally by the phonetic normaliser)
- gh / g
- sh / s
- ch / c
- th / t
- ou / u
- q / k, w / v, z / j

Double letters collapse to a single letter (e.g., Hussnain -> Husnain). Vowels after the first letter are dropped when building a phonetic key. These rules are deterministic and are applied by the phonetic_key MCP tool. All comparisons must use this tool, not human guesswork.
