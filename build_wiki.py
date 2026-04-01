"""
build_wiki.py — Inlines locations.js and wiki_data.js into wiki_single_page.html
and writes a self-contained wiki_output.html you can open in any browser and copy-paste.

Auto-changelog: reads <!-- CHANGELOG_WATERMARK: loc_N --> from wiki_single_page.html,
finds any locations with ID > N, and injects 🆕 bullet(s) into the changelog section
of wiki_output.html grouped by month. After a successful build the watermark in
wiki_single_page.html is updated to the current highest ID so the next run stays clean.

Usage: python build_wiki.py
"""

import re, sys, io, json
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ── Load source files ──────────────────────────────────────────────────────────

with open('wiki_single_page.html', encoding='utf-8') as f:
    template = f.read()

with open('locations.js', encoding='utf-8') as f:
    locations_js = f.read()

with open('wiki_data.js', encoding='utf-8') as f:
    wiki_data_js = f.read()

# ── Parse locations.js into a Python list ────────────────────────────────────

def parse_locations(js_text):
    """Strip the JS wrapper and parse the JSON array."""
    # Remove leading comments and the variable assignment
    js_text = re.sub(r'^//.*$', '', js_text, flags=re.MULTILINE)
    js_text = re.sub(r'window\.COFFEE_LOCATIONS\s*=\s*', '', js_text).strip()
    js_text = js_text.rstrip(';').strip()
    return json.loads(js_text)

try:
    all_locations = parse_locations(locations_js)
except Exception as e:
    print(f'Warning: could not parse locations.js for changelog generation: {e}')
    all_locations = []

# ── Read watermark ─────────────────────────────────────────────────────────────

watermark_match = re.search(r'<!--\s*CHANGELOG_WATERMARK:\s*(loc_(\d+))\s*-->', template)
watermark_id  = watermark_match.group(1) if watermark_match else None
watermark_num = int(watermark_match.group(2)) if watermark_match else 0

# ── Find new locations (ID > watermark) ───────────────────────────────────────

def loc_num(loc):
    m = re.match(r'loc_(\d+)', loc.get('id', ''))
    return int(m.group(1)) if m else 0

def slugify(name):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', name.lower()))

def location_label(loc):
    info  = loc.get('basicInfo', {})
    name  = info.get('name', '?')
    slug  = slugify(name)
    url   = f'https://sandiegocoffee.co/locations/{slug}'
    online = info.get('onlineOnly', False)
    ltype  = info.get('type', '')
    details = loc.get('coffeeDetails', {})
    nbr   = details.get('neighborhood') or info.get('address', {}).get('neighborhood') or info.get('address', {}).get('city', '')

    if online:
        kind = 'Online Roaster'
    elif ltype == 'roaster':
        kind = f'Roaster — {nbr}' if nbr else 'Roaster'
    else:
        kind = f'Multi-Roaster Café — {nbr}' if nbr else 'Multi-Roaster Café'

    return f'<a href="{url}">{name}</a> ({kind})'

def loc_month_key(loc):
    """Return (year, month) int tuple from lastSynced or lastUpdated timestamp."""
    gd = loc.get('googleData', {})
    raw = gd.get('lastSynced') or loc.get('lastUpdated', '')
    try:
        dt = datetime.fromisoformat(raw.replace('Z', '+00:00'))
        return (dt.year, dt.month)
    except Exception:
        now = datetime.now(timezone.utc)
        return (now.year, now.month)

MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December']

new_locs = [l for l in all_locations if loc_num(l) > watermark_num]

# Group new locations by (year, month)
from collections import defaultdict
by_month = defaultdict(list)
for loc in new_locs:
    by_month[loc_month_key(loc)].append(loc)

# ── Build changelog HTML to inject ────────────────────────────────────────────

def build_injections():
    """Return list of (year, month, html_li_string) tuples."""
    items = []
    for (year, month), locs in sorted(by_month.items()):
        labels = ', '.join(location_label(l) for l in locs)
        count  = len(locs)
        noun   = 'location' if count == 1 else 'locations'
        li     = f'<li>🆕 Added {count} new {noun}: {labels}.</li>'
        items.append((year, month, li))
    return items

injections = build_injections()

def apply_injections(source, injections):
    """Inject changelog <li> entries into an HTML string. Returns updated string."""
    for (year, month, li) in injections:
        month_name = MONTH_NAMES[month]
        pattern = rf'(<h4>{month_name} {year}</h4>\s*<ul>)'
        if re.search(pattern, source):
            source = re.sub(pattern, rf'\1\n  {li}', source, count=1)
        else:
            year_pattern = rf'(<h3>{year}</h3>)'
            new_section = f'\\1\n\n<h4>{month_name} {year}</h4>\n\n<ul>\n  {li}\n</ul>\n'
            if re.search(year_pattern, source):
                source = re.sub(year_pattern, new_section, source, count=1)
            else:
                fallback_pattern = r'(<h3>How to Read This Log</h3>)'
                new_year_section = (
                    f'<h3>{year}</h3>\n\n<h4>{month_name} {year}</h4>\n\n'
                    f'<ul>\n  {li}\n</ul>\n\n<hr>\n\n\\1'
                )
                source = re.sub(fallback_pattern, new_year_section, source, count=1)
    return source

# ── Compute stats from locations data ────────────────────────────────────────

def ordinal(n):
    if 11 <= n % 100 <= 13:
        return f'{n}th'
    return f'{n}{["th","st","nd","rd","th"][min(n % 10, 4)]}'

now = datetime.now()
today_str = f'{MONTH_NAMES[now.month]} {ordinal(now.day)}, {now.year}'

total      = len(all_locations)
roasters   = len({l['basicInfo']['name'] for l in all_locations if l['basicInfo'].get('type') == 'roaster'})
cafes      = len({l['basicInfo']['name'] for l in all_locations if l['basicInfo'].get('type') == 'cafe'})
online     = len({l['basicInfo']['name'] for l in all_locations if l['basicInfo'].get('onlineOnly')})
nbrs       = len({(l.get('coffeeDetails') or {}).get('neighborhood') or l['basicInfo'].get('address', {}).get('neighborhood', '')
                  for l in all_locations
                  if not l['basicInfo'].get('onlineOnly')} - {''})

new_subtitle = (
    f'Last updated: {MONTH_NAMES[now.month]} {now.day}, {now.year} — '
    f'{total} locations · {roasters} roasters · {cafes} multi-roaster cafés · '
    f'{online} online-only roasters · {nbrs} neighborhoods'
)

new_faq_stats = (
    f'As of {MONTH_NAMES[now.month]} {now.year}: '
    f'<strong>{roasters} roasters</strong>, plus '
    f'<strong>{cafes} multi-roaster cafés</strong> and '
    f'<strong>{online} online-only roasters</strong>, totaling '
    f'<strong>{total} tracked locations</strong> across '
    f'<strong>{nbrs} neighborhoods</strong>.'
)

def update_stats(source):
    # Stats subtitle (appears in both the <p> tag and the JS textContent)
    source = re.sub(
        r'Last updated:.*?neighborhoods',
        new_subtitle,
        source
    )
    # Map link count
    source = re.sub(
        r'Interactive Map — All \d+ Locations',
        f'Interactive Map — All {total} Locations',
        source
    )
    # FAQ stats paragraph
    source = re.sub(
        r'(?<=id="faq-stats">).*?(?=</p>)',
        new_faq_stats,
        source,
        flags=re.DOTALL
    )
    return source

# ── Persist new entries + updated watermark into wiki_single_page.html ────────

# Always update stats in wiki_single_page.html on every run
updated_template = update_stats(template)

if new_locs:
    new_max = max(loc_num(l) for l in all_locations)
    new_watermark = f'loc_{new_max}'
    updated_template = apply_injections(updated_template, injections)
    updated_template = re.sub(
        r'<!--\s*CHANGELOG_WATERMARK:\s*loc_\d+\s*-->',
        f'<!-- CHANGELOG_WATERMARK: {new_watermark} -->',
        updated_template
    )
    print(f'Watermark updated: {watermark_id} → {new_watermark}')
    print(f'Auto-added {len(new_locs)} new location(s) to changelog:')
    for loc in new_locs:
        print(f"  • {loc['basicInfo']['name']} ({loc['id']})")
else:
    print('No new locations since last wiki build.')

with open('wiki_single_page.html', 'w', encoding='utf-8') as f:
    f.write(updated_template)

template_for_output = updated_template

# ── Inline JS and write wiki_output.html ──────────────────────────────────────

html = template_for_output

html = re.sub(
    r'<script src="locations\.js"></script>',
    '<script>\n' + locations_js + '\n</script>',
    html
)

html = re.sub(
    r'<script src="wiki_data\.js"></script>',
    '<script>\n' + wiki_data_js + '\n</script>',
    html
)

with open('wiki_output.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Done. Open wiki_output.html in your browser, then copy-paste into Reddit.')
