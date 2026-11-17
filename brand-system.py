"""Original Agent Ozone vector identity. No external icon library."""
from pathlib import Path
import re

root=Path(__file__).parent
dist=root/'dist'
brand=dist/'brand'
brand.mkdir(exist_ok=True)
icons={
 'ozone': '<path d="M10 3h12l7 7v12l-7 7H10l-7-7V10Z"/><path d="m11 11 5 5-5 5m8 0h4"/><path d="M3 12v8m26-8v8" stroke="#6590ff"/><circle cx="27" cy="5" r="2.5" fill="#ef8c46" stroke="none"/>',
 'play': '<path d="M7 4H4v16h3m10-16h3v16h-3M9 7l7 5-7 5Z"/>',
 'external': '<path d="M13 4h7v7m0-7L10 14M8 5H4v15h15v-4"/>',
 'lamp': '<path d="m7 4-4 8h14l-4-8ZM10 12v7m-5 2h10m5-7 2 1m-3-5h3M9 2h2"/>',
 'search': '<path d="M16 16l5 5M5 3H3v14h14v-2M7 6l4 4-4 4m6-1h2"/><path d="M17 3v6h-4"/>',
 'down': '<path d="M12 3v15m-6-6 6 6 6-6M5 21h14"/>',
 'next': '<path d="M3 12h16m-6-6 6 6-6 6M21 5v14"/>',
 'previous': '<path d="M21 12H5m6-6-6 6 6 6M3 5v14"/>',
 'close': '<path d="M7 3H3v18h4m10-18h4v18h-4M8 8l8 8m0-8-8 8"/>',
 'instagram': '<path d="M7 3h10l4 4v10l-4 4H7l-4-4V7Z"/><circle cx="12" cy="12" r="4"/><path d="M17 6h1v1h-1Z"/>',
 'code': '<path d="m8 5-5 7 5 7m8-14 5 7-5 7m-3-17-2 20"/>',
 'frame': '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8Z"/>',
}

def svg(name,cls='ui-icon'):
    view='0 0 32 32' if name=='ozone' else '0 0 24 24'
    return f'<svg class="{cls}" viewBox="{view}" aria-hidden="true" focusable="false"><use href="#icon-{name}"/></svg>'

symbols=''.join(f'<symbol id="icon-{name}" viewBox="0 0 {32 if name=="ozone" else 24} {32 if name=="ozone" else 24}">{paths}</symbol>' for name,paths in icons.items())
sprite=f'<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{symbols}</svg>'
(brand/'icons.svg').write_text(sprite,encoding='utf8')
for name,paths in icons.items():
    size=32 if name=='ozone' else 24
    content=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" fill="none" stroke="#f3e6cc" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{paths}</svg>'
    (brand/(name+'.svg')).write_text(content,encoding='utf8')
logo=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#141516"/><g transform="translate(4 4) scale(1.75)" fill="none" stroke="#f3e6cc" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{icons["ozone"]}</g></svg>'
(dist/'favicon.svg').write_text(logo,encoding='utf8')
(brand/'agent-ozone-logo.svg').write_text(logo,encoding='utf8')
html=(dist/'index.html').read_text(encoding='utf8')
html=re.sub(r'  <link rel="preload" href="fonts/fraunces[^\n]+\n','',html)
if 'id="brand-symbols"' not in html:
    html=html.replace('<body>','<body>\n  '+sprite.replace('<svg xmlns=', '<svg id="brand-symbols" class="brand-symbols" aria-hidden="true" xmlns='))
html=html.replace('<span class="brand-mark" aria-hidden="true">&gt;_</span>', '<span class="brand-mark" aria-hidden="true">'+svg('ozone','ozone-mark')+'</span>')
html=html.replace('<span aria-hidden="true">✳</span> Desk lamp',svg('lamp')+' Desk lamp')
html=html.replace('<span class="tiny-star">✳</span>', '<span class="tiny-star">'+svg('code')+'</span>')
html=html.replace('<span class="big-star">✳</span>', '<span class="big-star">'+svg('ozone','ozone-mark')+'</span>')
html=html.replace('<span class="floating-star star-one" aria-hidden="true">✳</span>', '<span class="floating-star star-one" aria-hidden="true">'+svg('frame')+'</span>')
html=html.replace('<span>✳</span></span><span class="coffee-caption">', '<span>'+svg('ozone','ozone-mark')+'</span></span><span class="coffee-caption">')
html=html.replace('<span class="play-icon">▶</span>',svg('play'))
html=html.replace('<span aria-hidden="true">⌕</span>',svg('search'))
html=html.replace('✳',svg('code'))
html=html.replace('↗',svg('external')).replace('↓',svg('down'))
html=html.replace('← Previous film',svg('previous')+' Previous film').replace('Next film →','Next film '+svg('next'))
html=html.replace('aria-label="Close video">×','aria-label="Close video">'+svg('close')).replace('aria-label="Close image">×','aria-label="Close image">'+svg('close'))
html=re.sub(r'(<a[^>]+href="https://www.instagram.com/[^>]+>)(?!<svg)',lambda m:m[1]+svg('instagram'),html)
html=html.replace('leave your worries at the door. ↙','// leave your worries here')
html=html.replace('<span>agent<span class="brand-second">ozone.</span></span>','<span>agent<span class="brand-second">ozone<span class="brand-cursor">_</span></span></span>')
html=html.replace('THE LIGHTS ARE STILL ON','CODEX AT WORK / STORIES AT HOME')
html=html.replace('<span class="world-word">worlds.<svg viewBox="0 0 390 22" aria-hidden="true"><path d="M5 15Q170-7 383 10M23 19Q190 2 365 16"/></svg></span>','<span class="world-word">worlds<span class="heading-cursor">_</span></span>')
(dist/'index.html').write_text(html,encoding='utf8')
print('Generated original logo, favicon and 12 matching SVG icons; replaced generic UI glyphs.')
