"""
build_wiki.py — Inlines locations.js and wiki_data.js into wiki_single_page.html
and writes a self-contained wiki_output.html you can open in any browser and copy-paste.

Usage: python build_wiki.py
"""

import re, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('wiki_single_page.html', encoding='utf-8') as f:
    html = f.read()

with open('locations.js', encoding='utf-8') as f:
    locations_js = f.read()

with open('wiki_data.js', encoding='utf-8') as f:
    wiki_data_js = f.read()

# Replace <script src="locations.js"> with inlined version
html = re.sub(
    r'<script src="locations\.js"></script>',
    '<script>\n' + locations_js + '\n</script>',
    html
)

# Replace <script src="wiki_data.js"> with inlined version
html = re.sub(
    r'<script src="wiki_data\.js"></script>',
    '<script>\n' + wiki_data_js + '\n</script>',
    html
)

with open('wiki_output.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Done. Open wiki_output.html in your browser, then copy-paste into Reddit.')
