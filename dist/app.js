'use strict';

const $=selector=>document.querySelector(selector);
let films=[];
let filter='All films';
let limit=8;
let currentFilm=null;
let videoOpener=null;
let artOpener=null;
const cinema=$('#cinema');
const player=$('#film-player');
const artDialog=$('#art-dialog');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showToast(message){
  const toast=$('#toast');
  toast.textContent=message;
  toast.hidden=false;
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>{toast.hidden=true;},4000);
}

function matchingFilms(){
  const search=$('#film-search').value.trim().toLocaleLowerCase();
  return films.filter(film=>(filter==='All films'||film.category===filter)&&
    (!search||[film.title,film.description,film.category,film.episode?'day '+film.episode:'']
      .join(' ').toLocaleLowerCase().includes(search)));
}

function filmCard(film,index){
  const article=document.createElement('article');
  article.className='film-card';
  const button=document.createElement('button');
  button.className='film-poster';
  button.type='button';
  button.dataset.play=film.id;
  button.setAttribute('aria-label','Play '+film.title+', '+film.label);
  const image=document.createElement('img');
  image.src=film.poster;
  image.alt='';
  image.loading=index<4?'eager':'lazy';
  image.width=540;
  image.height=960;
  const episode=document.createElement('span');
  episode.className='film-episode';
  episode.textContent=film.episode?'DAY '+String(film.episode).padStart(2,'0'):'FROM THE WORKBENCH';
  const duration=document.createElement('span');
  duration.className='film-duration';
  duration.textContent=film.label;
  const play=document.createElement('span');
  play.className='film-play';
  const playSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  playSvg.setAttribute('viewBox','0 0 24 24');
  playSvg.classList.add('ui-icon');
  const playUse=document.createElementNS('http://www.w3.org/2000/svg','use');
  playUse.setAttribute('href','#icon-play');
  playSvg.append(playUse);
  play.append(playSvg);
  play.setAttribute('aria-hidden','true');
  button.append(image,episode,duration,play);
  const title=document.createElement('h3');
  title.textContent=film.title;
  const subtitle=document.createElement('p');
  subtitle.textContent=film.category;
  article.append(button,title,subtitle);
  return article;
}

function renderLibrary(){
  const matching=matchingFilms();
  const shown=matching.slice(0,limit);
  const grid=$('#film-grid');
  grid.replaceChildren(...shown.map(filmCard));
  if(!shown.length){
    const empty=document.createElement('div');
    empty.className='empty-state';
    const title=document.createElement('strong');
    title.textContent='That story is still in his head.';
    const text=document.createElement('span');
    text.textContent='Try another title, or choose All films.';
    empty.append(title,text);
    grid.append(empty);
  }
  $('#film-total').textContent=String(films.length);
  $('#results-note').textContent=matching.length?
    shown.length+' of '+matching.length+' films · pick a little world to step into':'No matching films';
  $('#load-more').hidden=shown.length>=matching.length;
  document.querySelectorAll('[data-filter]').forEach(button=>{
    const active=button.dataset.filter===filter;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

function playFilm(id,opener){
  const film=films.find(item=>item.id===id);
  if(!film){
    showToast('The film library is still loading. Try again in a moment.');
    return;
  }
  if(opener)videoOpener=opener;
  currentFilm=film;
  player.pause();
  player.src=film.video;
  player.poster=film.poster;
  player.setAttribute('aria-label',film.title);
  $('#cinema-tag').textContent=(film.episode?'DAY '+String(film.episode).padStart(2,'0')+' · ':'')+
    film.category.toUpperCase()+' · '+film.label;
  $('#cinema-title').textContent=film.title;
  $('#cinema-description').textContent=film.description;
  $('#video-error').hidden=true;
  $('#video-direct').href=film.video;
  if(!cinema.open){
    cinema.showModal();
    document.body.classList.add('modal-open');
  }
  player.load();
  player.play().catch(()=>{
    // Native controls remain available when the browser requires a second tap.
  });
}

function closeCinema(){
  if(cinema.open)cinema.close();
}
cinema.addEventListener('close',()=>{
  player.pause();
  player.removeAttribute('src');
  player.load();
  currentFilm=null;
  document.body.classList.remove('modal-open');
  videoOpener?.focus({preventScroll:true});
});
$('#close-cinema').addEventListener('click',closeCinema);
cinema.addEventListener('click',event=>{
  if(event.target===cinema)closeCinema();
});
player.addEventListener('error',()=>{
  if(cinema.open&&player.hasAttribute('src'))$('#video-error').hidden=false;
});
function adjacentFilm(direction){
  if(!currentFilm)return;
  const index=films.findIndex(film=>film.id===currentFilm.id);
  playFilm(films[(index+direction+films.length)%films.length].id);
}
$('#previous-film').addEventListener('click',()=>adjacentFilm(-1));
$('#next-film').addEventListener('click',()=>adjacentFilm(1));

document.addEventListener('click',event=>{
  const play=event.target.closest('[data-play]');
  if(play){
    playFilm(play.dataset.play,play);
    return;
  }
  const image=event.target.closest('[data-image]');
  if(image){
    artOpener=image;
    $('#art-title').textContent=image.dataset.imageTitle;
    $('#art-image').src=image.dataset.image;
    $('#art-image').alt=image.dataset.imageTitle;
    artDialog.showModal();
    document.body.classList.add('modal-open');
  }
});
$('#close-art').addEventListener('click',()=>artDialog.close());
artDialog.addEventListener('click',event=>{
  if(event.target===artDialog)artDialog.close();
});
artDialog.addEventListener('close',()=>{
  document.body.classList.remove('modal-open');
  artOpener?.focus({preventScroll:true});
});

document.querySelectorAll('[data-filter]').forEach(button=>{
  button.addEventListener('click',()=>{
    filter=button.dataset.filter;
    limit=8;
    renderLibrary();
  });
});
$('#film-search').addEventListener('input',()=>{
  limit=8;
  renderLibrary();
});
$('#load-more').addEventListener('click',()=>{
  limit+=8;
  renderLibrary();
});

$('#light-switch').addEventListener('click',()=>{
  const warm=document.body.classList.toggle('warm');
  $('#light-switch').setAttribute('aria-pressed',String(warm));
  $('#light-switch').setAttribute('aria-label',warm?'Dim the desk lamp':'Turn up the desk lamp');
});
const thoughts=[
  ['press play.','overthink later.'],
  ['You’ve scheduled','being spontaneous.'],
  ['One more film?','I’ll wait.'],
  ['You were parked.']
];
const deskThoughts=[
  'You can start small. I’ll be right here.',
  'Someone else being ahead doesn’t mean you’re behind.',
  'Rest is allowed. The next frame can wait.',
  'A tiny thing, finished, can become something big.',
  'You don’t have to be impressive to belong here.'
];
let deskThought=0;
$('#next-thought').addEventListener('click',()=>{
  deskThought=(deskThought+1)%deskThoughts.length;
  $('#desk-thought').textContent=deskThoughts[deskThought];
});
let coffeeBreaks=0;
$('#coffee-button').addEventListener('click',()=>{
  coffeeBreaks++;
  showToast(coffeeBreaks===1?'Codex: There you are. Take a breath. The tabs can wait.':'Codex: Still here. No productivity required.');
  $('#coffee-button .coffee-caption').replaceChildren(
    document.createTextNode('stay a minute.'),
    Object.assign(document.createElement('small'),{textContent:'you’ve got good company'})
  );
});
let thought=0;
$('#mascot-button').addEventListener('click',()=>{
  thought=(thought+1)%thoughts.length;
  $('#mascot-bubble').replaceChildren(...thoughts[thought].flatMap((line,index)=>
    index?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));
});

function updateTime(){
  $('#year').textContent=String(new Date().getFullYear());
  const time=new Intl.DateTimeFormat('en-GB',{
    timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false
  }).format(new Date());
  $('#studio-time').textContent='STUDIO TIME · '+time+' IST';
}
updateTime();
setInterval(updateTime,60000);

if(!reducedMotion&&'IntersectionObserver' in window){
  document.documentElement.classList.add('js-reveal');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
}

fetch('library.json').then(response=>{
  if(!response.ok)throw Error('Library request failed');
  return response.json();
}).then(data=>{
  if(!Array.isArray(data)||!data.length)throw Error('Empty library');
  films=data;
  renderLibrary();
}).catch(()=>{
  $('#results-note').textContent='The library couldn’t load. Refresh to try again.';
  $('#load-more').hidden=true;
});

// An ambient sky stays local to the page and pauses in background tabs.
const sky=$('#night-sky');
const skyContext=sky.getContext('2d');
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerPreference=window.matchMedia('(pointer: fine)');
const pointerLight=$('#pointer-light');
let skyWidth=0;
let skyHeight=0;
let stars=[];
let skyFrame=null;
let previousSkyTime=0;
const pointer={x:-1000,y:-1000};

function sizeSky(){
  skyWidth=window.innerWidth;
  skyHeight=window.innerHeight;
  const scale=Math.min(window.devicePixelRatio||1,1.5);
  sky.width=Math.round(skyWidth*scale);
  sky.height=Math.round(skyHeight*scale);
  skyContext.setTransform(scale,0,0,scale,0,0);
  const count=skyWidth<600?30:70;
  stars=Array.from({length:count},()=>({
    x:Math.random(),y:Math.random(),size:.6+Math.random()*1.2,
    phase:Math.random()*Math.PI*2,speed:.15+Math.random()*.45
  }));
  drawSky(0);
}

function drawSky(time){
  skyContext.clearRect(0,0,skyWidth,skyHeight);
  const seconds=motionPreference.matches?0:time/1000;
  let connections=0;
  for(const star of stars){
    const x=(star.x*skyWidth+seconds*star.speed*2)%skyWidth;
    const y=(star.y*skyHeight+Math.sin(seconds*.07+star.phase)*12+skyHeight)%skyHeight;
    const alpha=.2+.45*(.5+.5*Math.sin(seconds*.75+star.phase));
    skyContext.fillStyle='rgba(231,197,144,'+(alpha*.65)+')';
    skyContext.beginPath();
    skyContext.arc(x,y,star.size,0,Math.PI*2);
    skyContext.fill();
    const distance=Math.hypot(x-pointer.x,y-pointer.y);
    if(!motionPreference.matches&&distance<150&&connections<7){
      skyContext.strokeStyle='rgba(233,166,94,'+((1-distance/150)*.12)+')';
      skyContext.lineWidth=.7;
      skyContext.beginPath();
      skyContext.moveTo(pointer.x,pointer.y);
      skyContext.lineTo(x,y);
      skyContext.stroke();
      connections++;
    }
  }
  const sweep=(seconds+3)%12;
  if(!motionPreference.matches&&sweep<1.4){
    const progress=sweep/1.4;
    const x=skyWidth*(.12+progress*.65),y=skyHeight*(.08+progress*.30);
    const trail=skyContext.createLinearGradient(x-100,y-45,x,y);
    trail.addColorStop(0,'rgba(236,194,128,0)');
    trail.addColorStop(1,'rgba(246,216,169,'+(Math.sin(progress*Math.PI)*.35)+')');
    skyContext.strokeStyle=trail;
    skyContext.lineWidth=1.2;
    skyContext.beginPath();
    skyContext.moveTo(x-100,y-45);
    skyContext.lineTo(x,y);
    skyContext.stroke();
  }
}

function animateSky(time){
  if(time-previousSkyTime>32){
    drawSky(time);
    previousSkyTime=time;
  }
  skyFrame=requestAnimationFrame(animateSky);
}

function updateSkyMotion(){
  if(skyFrame!==null)cancelAnimationFrame(skyFrame);
  skyFrame=null;
  if(!document.hidden&&!motionPreference.matches)skyFrame=requestAnimationFrame(animateSky);
  else drawSky(0);
}
if(skyContext){
  sizeSky();
  updateSkyMotion();
  window.addEventListener('resize',sizeSky,{passive:true});
  document.addEventListener('visibilitychange',updateSkyMotion);
  motionPreference.addEventListener('change',updateSkyMotion);
  window.addEventListener('pointermove',event=>{
    if(!pointerPreference.matches||motionPreference.matches)return;
    pointer.x=event.clientX;
    pointer.y=event.clientY;
    pointerLight.style.opacity='1';
    pointerLight.style.transform='translate('+(event.clientX-240)+'px,'+(event.clientY-240)+'px)';
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{
    pointer.x=-1000;
    pointer.y=-1000;
    pointerLight.style.opacity='0';
  });
}
