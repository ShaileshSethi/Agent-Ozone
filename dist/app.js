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
  play.textContent='▶';
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
  $('#light-switch').setAttribute('aria-label',warm?'Switch to blue studio lighting':'Switch to warm studio lighting');
});
const thoughts=[
  ['press play.','overthink later.'],
  ['You’ve scheduled','being spontaneous.'],
  ['One more film?','I’ll wait.'],
  ['You were parked.']
];
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
