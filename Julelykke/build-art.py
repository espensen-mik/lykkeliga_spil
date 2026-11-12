#!/usr/bin/env python3
"""Fletter husene fra lykkeby.svg, julemanden fra santa.svg og bilerne fra
"Car Cartoon Collection.svg" samt scooter-julemanden fra santa_scooter.svg ind i
public/julelykke/index.html (mellem ART-, SANTA-, CARS- og SCOOTER-markørerne).

Kør igen, hvis en af filerne bliver ændret:  python3 build-art.py
"""
import random
import re
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).parent
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
random.seed(24)

root = ET.parse(HERE / 'lykkeby.svg').getroot()
layer = [g for g in root if g.get('id') == 'Layer_1'][0]
town = list(layer)[1]                     # [jord, gruppe]
inner = list(town)[1]                     # [huse+røg, gran, gran]
houses_and_smoke, pine1, pine2 = list(inner)
houses, smoke = list(houses_and_smoke)
house = list(houses)                      # 0 orange, 1 rust, 2 tårn, 3 turkis, 4 brun, 5 gul

# Mørke ruder, der skal kunne tænde om aftenen (indeks blandt husets efterkommere)
PANES = {0: [5, 6, 24], 1: [6, 12, 19, 27], 2: [7, 11], 3: [17, 42, 51, 52], 4: [6, 10, 19], 5: [15, 23, 31]}
for i, idxs in PANES.items():
    desc = list(house[i].iter())[1:]
    for k in idxs:
        e = desc[k]
        assert 'st4' in (e.get('class') or ''), (i, k, e.tag, e.get('class'))
        e.set('class', e.get('class') + ' pane')
        e.set('style', f'transition-delay:{random.random():.2f}s')

# Vinduer og gardiner, der allerede lyser i tegningen – de skal blive ved med at lyse om aftenen
GLOW = {0: [25, 33], 1: [7, 28], 2: [15, 27, 31], 3: [19, 20, 49], 4: [5, 14, 18, 23], 5: [27, 35]}
for i, idxs in GLOW.items():
    desc = list(house[i].iter())[1:]
    for k in idxs:
        e = desc[k]
        assert e.get('class') in ('st0', 'st2'), (i, k, e.tag, e.get('class'))
        e.set('class', e.get('class') + ' glow')

puffs = [p for p in smoke if float(re.findall(r'[\d.]+', p.get('d'))[0]) > 0][:6]
for n, p in enumerate(puffs):
    p.set('class', p.get('class') + ' artpuff')
    p.set('style', f'animation-delay:-{(n * 5.3) % 14:.1f}s')
pine1.set('id', 'artPine')

def ser(e):
    s = ET.tostring(e, encoding='unicode')
    s = s.replace(f' xmlns="{NS}"', '')
    return re.sub(r'>\s+<', '><', s)

S = 0.4
tL = f'translate(8.4,-1052) scale({S})'
tR = f'translate(469.4,-1052) scale({S})'
left = ''.join(ser(house[i]) for i in (3, 4, 5)) + ser(pine1) + ser(pine2)
right = ''.join(ser(house[i]) for i in (0, 1, 2))
pl = ''.join(ser(p) for p in puffs if float(re.findall(r'[\d.]+', p.get('d'))[0]) < 2000)
pr = ''.join(ser(p) for p in puffs if float(re.findall(r'[\d.]+', p.get('d'))[0]) >= 2000)
art = (
    f'\n    <g id="artTown">\n'
    f'      <g transform="{tL}"><g id="artL">{left}</g><g>{pl}</g></g>\n'
    f'      <g transform="{tR}"><g id="artR">{right}</g><g>{pr}</g></g>\n'
    f'    </g>\n    '
)
page = HERE.parent / 'public' / 'julelykke' / 'index.html'
html = page.read_text(encoding='utf-8')
a, b = '<!-- ART:START -->', '<!-- ART:END -->'
i, j = html.index(a) + len(a), html.index(b)
html = html[:i] + art + html[j:]

# --- Julemanden: klasserne omdøbes (st -> sa), så de ikke rammer husenes farver
raw = (HERE / 'santa.svg').read_text(encoding='utf-8')
css = ''.join(f'.sa{n}{{{body.strip()}}}' for n, body in re.findall(r'\.st(\d+)\s*\{([^}]*)\}', raw))
css = re.sub(r'\s+', ' ', css)
sroot = ET.fromstring(raw)
for e in sroot.iter():
    if e.get('class'):
        e.set('class', re.sub(r'\bst(\d+)\b', r'sa\1', e.get('class')))
body = ''.join(ser(g) for g in sroot if g.tag == f'{{{NS}}}g')
# Optogets midte ligger i (2500, 1875); det flyver mod venstre i originalen
santa = (f'\n      <style>{css}</style>\n'
         f'      <g id="santaProto"><g transform="translate(-2500,-1875)">{body}</g></g>\n      ')
a, b = '<!-- SANTA:START -->', '<!-- SANTA:END -->'
i, j = html.index(a) + len(a), html.index(b)
html = html[:i] + santa + html[j:]

# --- Biler: Illustrator-filen renses for Adobes private data, og hver bil får sit eget id
raw = (HERE / 'Car Cartoon Collection.svg').read_text(encoding='utf-8')
raw = re.sub(r'<!DOCTYPE.*?\]>', '', raw, flags=re.S)
raw = re.sub(r'&ns_(\w+);', r'http://ns.adobe.com/\1/', raw)
croot = ET.fromstring(raw)
switch = [e for e in croot if e.tag == f'{{{NS}}}switch'][0]
top = [e for e in switch if e.tag == f'{{{NS}}}g'][0]
car_groups = [e for e in top if e.tag == f'{{{NS}}}g']
assert len(car_groups) == 6, len(car_groups)
# Bilerne farves om til byens palet. Den sorte streg bliver en mørk tone af bilens egen farve.
COMMON = {'#D1D1D1': '#e9cd9f', '#B8E5FA': '#fff4e2', '#FFFFFF': '#fff4e2', '#726A5E': '#1d3130',
          '#B2B6C1': '#d9bc86', '#99897A': '#733f2c', '#ED4C4C': '#ec693d'}
PER_CAR = [
    {'#F68058': '#ec693d', '#E45E45': '#b14f2e', '#FFC466': '#ecb814', '#42250D': '#7a2f18'},   # jeep
    {'#8095CC': '#d9bc86', '#5771A0': '#b89a63', '#42250D': '#6b5330'},                        # lille bil
    {'#ED4C4C': '#b14f2e', '#CC3E3E': '#8f3d22', '#42250D': '#5e2413'},                        # ladvogn
    {'#AECA63': '#ecb814', '#8DB756': '#c99a0c', '#42250D': '#7a5c00'},                        # stationcar
    {'#5771A0': '#733f2c', '#42250D': '#3f2016'},                                              # varevogn
    {'#FFC466': '#00a388', '#DCA028': '#008a74', '#42250D': '#00574a'},                        # minibil
]
cars = ''
for n, g in enumerate(car_groups):
    colours = {**COMMON, **PER_CAR[n]}
    for e in g.iter():
        for k in [k for k in e.attrib if k.startswith('{')]:
            del e.attrib[k]
        f = (e.get('fill') or '').upper()
        if f in colours:
            e.set('fill', colours[f])
    g.set('id', f'car{n}')
    cars += ser(g)
cars = '\n      ' + cars + '\n      '
a, b = '<!-- CARS:START -->', '<!-- CARS:END -->'
i, j = html.index(a) + len(a), html.index(b)
html = html[:i] + cars + html[j:]

# --- Julemanden på scooter: tre løse gaver + selve scooteren (klasser omdøbes st -> sc)
raw = (HERE / 'santa_scooter.svg').read_text(encoding='utf-8')
css = ''.join(f'.sc{n}{{{body.strip()}}}' for n, body in re.findall(r'\.st(\d+)\s*\{([^}]*)\}', raw))
css = re.sub(r'\s+', ' ', css)
sroot = ET.fromstring(raw)
for e in sroot.iter():
    if e.get('class'):
        e.set('class', re.sub(r'\bst(\d+)\b', r'sc\1', e.get('class')))
groups = [g for g in sroot if g.tag == f'{{{NS}}}g']
assert len(groups) == 4, len(groups)
for name, g in zip(('gift0', 'gift1', 'gift2', 'scooter'), groups):
    g.set('id', name)
scooter = f'\n      <style>{css}</style>\n      ' + ''.join(ser(g) for g in groups) + '\n      '
a, b = '<!-- SCOOTER:START -->', '<!-- SCOOTER:END -->'
i, j = html.index(a) + len(a), html.index(b)
html = html[:i] + scooter + html[j:]

page.write_text(html, encoding='utf-8')
print(f'Flettede {len(art) // 1024} KB huse, {len(santa) // 1024} KB julemand, {len(cars) // 1024} KB biler og {len(scooter) // 1024} KB scooter ind i index.html')
