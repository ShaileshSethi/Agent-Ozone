from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parent.parent
SITE=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'tools/python'))
import imageio_ffmpeg

VIDEOS=[
('day-13','Day-13-The-Launch-Day-Plan-Remotion-v1.mp4','The launch-day plan','GTA VI',13,'A perfect plan. One very inconvenient traffic cone.'),
('day-12','Day-12-GTA-VI-Launch-Briefing-Remotion-v1.mp4','The Vice City briefing','GTA VI',12,'The boy, Codex, and a room ready for launch night.'),
('day-11','Day-11-Leave-the-Pause-In-Remotion-v1.mp4','Leave the pause in','Midnight life',11,'A little look at the code, voices and quiet moments behind the films.'),
('day-10','Day-10-The-Real-Jumpscare-Remotion-v1.mp4','The real jumpscare','Midnight life',10,'A tiny ghost costume. A Halloween night in MASH LAB.'),
('day-09','Day-09-The-Refresh-Button-Remotion-v1.mp4','The refresh button','Midnight life',9,'Another late-night conversation with a familiar blue friend.'),
('day-08','Day-08-OzoneWalk-Will-Anyone-Try-It-Remotion-v1.mp4','Will anyone try it?','Midnight life',8,'Putting Ozonewalk into the world, one uncertain step at a time.'),
('day-07','Day-07-Ozonewalk-Still-Building-Remotion-v1.mp4','Still building','Midnight life',7,'Finding users, fixing bugs and coming back tomorrow.'),
('day-06','Day-06-The-Rehearsal-v1.mp4','The rehearsal','Midnight life',6,'Rain outside. Coffee inside. A conversation rehearsed too many times.'),
('day-05','Day-05-My-Plans-Count-Too-v1.mp4','My plans count too','Midnight life',5,'Making room for your time, and coffee with a friend.'),
('day-04','Day-04-Tomorrow-Me-v1.mp4','Tomorrow me','Midnight life',4,'A huge life overhaul becomes one small step.'),
('day-03','Day-03-Everyones-Ahead-v2.mp4',"Everyone’s ahead",'Midnight life',3,'Views, comparison and the feeling that everyone got a head start.'),
('day-02','One-Last-Tab-Midnight-v2.mp4','One last tab','Midnight life',2,'The familiar room. The familiar promise of one more minute.'),
('day-01','Perfecting-the-Start-Remotion-v1.mp4','Perfecting the start','Midnight life',1,'The first film. Trying to get everything right before beginning.'),
('football','El_Clasico_Tactical_Explainer_60s.mp4','A minute of El Clásico','Experiments',None,'A different kind of story, told through a tactical animation.'),
('ahead-first','Day-03-Everyones-Ahead-v1.mp4',"Everyone’s ahead · first cut",'Experiments',None,'An earlier version from the animation workbench.'),
('winter','Perfecting-the-Start-Winter-v1.mp4','Perfecting the start · winter','Experiments',None,'The winter-outfit experiment from the early series.'),
('start-three','Perfecting-the-Start-v1.mp4','Perfecting the start · early render','Experiments',None,'An early version of the first story.'),
('pilot-two','reel-pilot/Everyday-ChatGPT-pilot-v2.mp4','Everyday ChatGPT · pilot 02','Experiments',None,'One of the first tests of the boy and Codex.'),
('pilot-one','reel-pilot/Everyday-ChatGPT-pilot-v1.mp4','Everyday ChatGPT · pilot 01','Experiments',None,'Where this little animated universe began.'),
]

def run(args):
    result=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-nostdin','-hide_banner','-threads','1',*args],
                          capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW|subprocess.IDLE_PRIORITY_CLASS)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors='replace')[-1200:])
    return result

records=[]
seen=set()
for name,filename,title,category,episode,description in VIDEOS:
    source=ROOT/filename
    if not source.is_file():
        raise FileNotFoundError(filename)
    digest=hashlib.sha256(source.read_bytes()).hexdigest()
    if digest in seen:
        continue
    seen.add(digest)
    target=SITE/'dist/media/videos'/f'{name}.mp4'
    if not target.exists() or target.stat().st_size!=source.stat().st_size:
        shutil.copy2(source,target)
    result=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-i',str(source)],capture_output=True,
                          creationflags=subprocess.CREATE_NO_WINDOW)
    match=re.search(rb'Duration: (\d+):(\d+):(\d+\.\d+)',result.stderr)
    if not match:
        raise ValueError('Missing duration '+filename)
    hours,minutes,seconds=map(float,match.groups())
    duration=hours*3600+minutes*60+seconds
    poster=SITE/'dist/media/posters'/f'{name}.jpg'
    if not poster.exists():
        run(['-y','-ss',str(min(2.0,duration*.2)),'-i',str(source),'-frames:v','1',
             '-vf','scale=540:-2','-q:v','3',str(poster)])
    records.append(dict(id=name,title=title,category=category,episode=episode,description=description,
        video=f'media/videos/{name}.mp4',poster=f'media/posters/{name}.jpg',duration=round(duration,2),
        label=f'{int(duration)//60}:{int(duration)%60:02d}'))

art={
    'hero-room.jpg':'day-13-remotion/public/frames/f1030.jpg',
    'codex.jpg':'day-12-remotion/public/frames/f0205.jpg',
    'boy.jpg':'day-13-remotion/public/frames/f0000.jpg',
    'fantasy.jpg':'day-13-remotion/public/frames/f0446.jpg',
    'character-sheet.png':'assets/gta-vi-day13/boy-vice-city-character-sheet-v1.png',
    'room-sheet.png':'assets/gta-vi-day13/midnight-room-signature-sheet-v2.png',
    'storyboard.png':'assets/gta-vi-day13/storyboard-v1.png',
    'room-evolution.png':'assets/gta-vi-day13/vice-city-room-environment-sheet-v1.png',
}
for name,filename in art.items():
    shutil.copy2(ROOT/filename,SITE/'dist/media/art'/name)
run(['-y','-ss','8','-i',str(ROOT/'Day-06-The-Rehearsal-v1.mp4'),'-frames:v','1',
     '-vf','scale=720:-2','-q:v','3',str(SITE/'dist/media/art/cafe.jpg')])
(SITE/'dist/library.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
print(f'Prepared {len(records)} films, {len(art)+1} artwork assets.')
print(f'Video total {sum(p.stat().st_size for p in (SITE/"dist/media/videos").glob("*.mp4"))/1024/1024:.1f} MiB.')
