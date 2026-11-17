from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re

ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
library=json.loads((DIST/'library.json').read_text(encoding='utf8'))
assert len(library)==19
assert len({item['id'] for item in library})==19
assert sorted(item['episode'] for item in library if item['episode'])==list(range(1,14))

def asset(path):
    resolved=(DIST/path).resolve()
    assert resolved.is_relative_to(DIST.resolve()),path
    assert resolved.is_file() and resolved.stat().st_size>0,path

for film in library:
    asset(film['video'])
    asset(film['poster'])
    assert film['duration']>0
    assert (DIST/film['video']).stat().st_size<25*1024*1024

class References(HTMLParser):
    def handle_starttag(self,tag,attributes):
        for key,value in attributes:
            if key in ('src','href','data-image') and value and not value.startswith(('#','https:','http:','data:')):
                asset(value)

References().feed((DIST/'index.html').read_text(encoding='utf8'))
deployed_hashes={hashlib.sha256((DIST/film['video']).read_bytes()).hexdigest() for film in library}
for video in ROOT.parent.glob('*.mp4'):
    assert hashlib.sha256(video.read_bytes()).hexdigest() in deployed_hashes,'Unlisted root video '+video.name

for file in DIST.rglob('*'):
    if not file.is_file():
        continue
    assert file.suffix.lower() in ('.mp4','.jpg','.png','.svg','.html','.css','.js','.json'),file
    assert not file.name.startswith('.'),file
    if file.suffix in ('.html','.css','.js','.json','.svg'):
        text=file.read_text(encoding='utf8')
        assert not re.search(r'\b(?:sk[-_][A-Za-z0-9_-]{24,}|github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{24,})\b',text),file
print('PASS — 19 unique films, all 13 episodes, every root-video variant accounted for, asset links and deploy-file checks.')
