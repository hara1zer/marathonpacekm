"""Check exact four-hour split arithmetic and primary search-intent layout.

Developer-only regression test. Uses rational distance and total-time inputs,
rounding cumulative elapsed time once for each checkpoint.
"""
from fractions import Fraction
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
FOUR = (ROOT / "4-00-marathon-pace-km/index.html").read_text()
SUB_FOUR = (ROOT / "sub-4-marathon-pace-km/index.html").read_text()
HOME = (ROOT / "index.html").read_text()
DISTANCE = Fraction("42.195")


def clock(value):
    value = Fraction(value)
    seconds = (2 * value.numerator + value.denominator) // (2 * value.denominator)
    return f"{seconds // 3600}:{seconds // 60 % 60:02}:{seconds % 60:02}"


def section(page, identifier, tag="section"):
    match = re.search(rf'<{tag}\b[^>]*id="{re.escape(identifier)}"[^>]*>.*?</{tag}>', page, re.S)
    assert match, ("section missing", identifier)
    return match.group(0)


detail = section(FOUR, "splits1kDetails", "details")
rows = re.findall(r'<tr><td>(\d+) km</td><td>(\d+:\d\d:\d\d)</td></tr>', detail)
assert [int(km) for km, _ in rows] == list(range(1, 43)), ("complete 1–42 km table", rows)
for km, shown in rows:
    expected = clock(Fraction(4 * 60 * 60 * int(km), 1) / DISTANCE)
    assert shown == expected, (km, shown, expected)
assert '<td>Finish (42.195)</td><td>4:00:00</td>' in detail

checks = section(FOUR, "key-splits")
for distance, expected in [(5, "0:28:26"), (10, "0:56:53"),
                           (21.0975, "2:00:00"), (30, "2:50:38"),
                           (40, "3:47:31"), (42.195, "4:00:00")]:
    assert clock(Fraction(14400) * Fraction(str(distance)) / DISTANCE) == expected, (distance, expected)
    assert expected in checks, (distance, expected, "missing key checkpoint")

# The four-hour even-pace reference and the strict sub-four boundary
# must remain different pages with different search-facing titles.
assert '<title>4-Hour Marathon Pace: 5:41/km &amp; Full Split Chart</title>' in FOUR
assert '<title>Sub-4 Marathon Pace: Splits, Strategy &amp; Pace Band</title>' in SUB_FOUR
assert '3:59:59' in section(SUB_FOUR, "goal-fit")
assert clock(Fraction(14399, 2)) == "2:00:00"  # exact halfway of 3:59:59
for page in [FOUR, SUB_FOUR]:
    assert page.index('id="key-splits"') < page.index('id="experience-note"')
assert '<title>Marathon Pace Chart per KM: Finish Times &amp; Splits</title>' in HOME
assert '<a class="tool-card" href="/marathon-fueling-calculator/"><h3>Marathon fueling calculator</h3>' in HOME

print("SEO goal checks: all 42 exact kilometre splits, finish, key markers, rounding boundary and page intent passed.")
