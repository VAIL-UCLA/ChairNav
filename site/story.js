(async function(){
'use strict';
const $=s=>document.querySelector(s);
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && new URLSearchParams(window.location?.search||'').get('motion')!=='full';
document.body.classList.toggle('reduce-motion',Boolean(reduced));
const [D,alignment]=await Promise.all(['./data.json','./showcase-pairs.json'].map(async u=>{const r=await fetch(u);if(!r.ok)throw new Error('Missing preview data');return r.json()}));
const S=D.story,controllers=[];
const projectionDetails=$('#projection-details');
const pi=stage=>`<span class="policy">π<sub>${stage}</sub></span>`;
const video=(asset,poster,label,controlled=false)=>`<video class="story-video" ${controlled?'tabindex="0"':'controls'} muted playsinline preload="none" src="${asset.url}" ${poster?`poster="${poster.url}"`:''} aria-label="${label}"></video>`;
const clip=(key,label)=>video(S[key].video,S[key].poster,label);
$('#hero-video').innerHTML=clip('results','Autonomous wheelchair navigation outdoors');
$('.hero-media').style.setProperty('--hero-poster',`url("${S.results.poster.url}")`);
$('#full-film').href=S.full.video.url;$('#full-film').target='_blank';$('#full-film').rel='noopener';
$('#paper-overview').src=S.overview.url;$('#overview-link').href=S.overview.url;
const hotSpots=[['pre','Pre-training',0,29.3],['mid','Mid-training',30,18],['post','Post-training',48.8,28.4]];
$('#overview-hotspots').innerHTML=hotSpots.map(([key,label,x,w])=>`<button type="button" class="overview-hotspot hotspot-${key}" data-open-stage="${key}" aria-label="Explore ${label}" aria-haspopup="dialog" style="--spot-x:${x}%;--spot-w:${w}%;--image-w:${10000/w}%;--image-x:${-100*x/w}%"><span class="spot-image" aria-hidden="true"><img src="${S.overview.url}" alt=""></span><span class="spot-label">${label} <span aria-hidden="true">↗</span></span></button>`).join('');
const stages=[
 ['pre','Pre-training','Adapt delivery robot data.','Align camera views and motion targets.'],
 ['mid','Mid-training','Learn from human driving.','From human demonstrations to wheelchair driving.'],
 ['post','Post-training','Learn from rider corrections.','Turn takeovers into preference supervision.']
];
$('#method-story').innerHTML=stages.map(([key,label,title,description])=>`<article class="method-stage stage-${key}" id="stage-${key}" role="tabpanel" aria-labelledby="${key}-tab" hidden><div class="stage-copy"><p class="eyebrow">${label}</p><h3>${title}</h3><p>${description}</p><div class="stage-output">${key==='pre'?'Base policy':pi(key==='mid'?'pre':'mid')}<span aria-hidden="true">→</span>${pi(key)}</div></div><div class="stage-media">${clip(key,title)}</div>${key==='pre'?'<div class="stage-detail-slot" id="pre-detail-slot"></div>':''}</article>`).join('');
$('#pre-detail-slot').appendChild(projectionDetails);
const cases=[
 {id:'G03',title:'Passing a gatepost.',description:'MID: rider correction. POST: autonomous passage.',note:'Matched by route position, not time. Approach, lighting, and bin placement differ between the two drives.'},
 {id:'G02',title:'Following a hedge.',description:'Both drives include rider corrections.',note:'Matched by route position. MID and POST predictions on the same input differ only slightly through most of this window.'}
];
function runPanel(row,controlled=false){
 const stage=row.model.includes('mid')?'mid':'post';
 const poster=row.stills.find(s=>s.label==='onset'||s.label==='ref_sameS')||row.stills[0];
 return `<div class="run-panel" data-run="${row.key}"><div class="run-label">${pi(stage)}<span class="${controlled?'state-badge':''}">${controlled?'Recorded run':'Prediction + rider input'}</span></div>${video(row.band||row.clean,poster,`${stage} recording${controlled?'; activate to play or pause both recordings':''}`,controlled)}</div>`;
}
$('#comparison-cases').innerHTML=cases.map(c=>{
 const g=D.groups.find(g=>g.id===c.id),rows=[...g.rows].sort((a,b)=>Number(!a.model.includes('mid'))-Number(!b.model.includes('mid')));
 return `<article class="comparison-case" data-group="${c.id}"><div class="case-heading"><h3>${c.title}</h3><p>${c.description}</p></div><div class="paired-runs">${rows.map(r=>runPanel(r,true)).join('')}</div><div class="pair-controls" role="group" aria-label="Playback for ${c.title}"><button class="pair-play">Play both</button><button class="pair-restart" aria-label="Replay both recordings">Replay</button><button class="pair-reference">Key moment</button><input class="pair-scrubber" type="range" min="0" max="${alignment[c.id].duration}" step="0.033333" value="0" aria-label="Shared playback position for ${c.title}"><output class="pair-clock" title="1× playback. Zero marks MID intervention onset and the matched POST route position.">−6.0 s</output><p class="pair-error" hidden role="status"></p></div><details class="case-detail"><summary>Comparison details</summary><p class="caption">${c.note}</p><p class="caption">1× playback. Zero marks the MID intervention and the matched POST location.</p><a href="${g.original_overlay.url}" target="_blank" rel="noopener"><img src="${g.original_overlay.url}" loading="lazy" alt="Three policies evaluated on one shared observation at this scene"></a><p class="caption">Offline predictions on one shared observation.</p></details></article>`;
}).join('');
$('#long-video').innerHTML=clip('long','Long-horizon navigation with route and control status');
$('#long-video video').dataset.start='0.8';
$('#diversity-video').innerHTML=clip('diversity','Navigation across multiple outdoor settings');
$('#route-figures').innerHTML=[D.plots.c_gps_state_0908_pair,D.plots.c_gps_state_0920_pair].map(x=>`<figure><a href="${x.url}" target="_blank" rel="noopener"><img src="${x.url}" loading="lazy" alt="MID and POST recorded routes and control states"></a><figcaption>${x.name.includes('0920')?'September 20 · outdoor route':'September 8 · evaluation route'}</figcaption></figure>`).join('');
const challenges=[
 {id:'G05',title:'Beside a sidewalk column.',text:'POST needs a correction; MID passes this location.',badge:'Rider intervention'},
 {id:'G11',title:'Beside a bicycle dock.',text:'Rider-reported collision; impact time unverified.',badge:'Close approach'}
];
$('#challenge-cases').innerHTML=challenges.map(c=>{const g=D.groups.find(x=>x.id===c.id),row=g.rows.find(r=>r.model.includes('post'));return `<article class="challenge-case"><div class="challenge-top"><span>${c.badge}</span>${pi('post')}</div>${video(row.band||row.clean,row.stills[2]||row.stills[0],c.title)}<h3>${c.title}</h3><p>${c.text}</p><details class="case-detail"><summary>See the MID recording at this location</summary>${runPanel(g.rows.find(r=>r.model.includes('mid')))}</details></article>`}).join('');
const videos=[...document.querySelectorAll('video')];
function pauseOthers(keep=[]){controllers.forEach(c=>{if(!c.videos.some(v=>keep.includes(v)))c.pause()});videos.forEach(v=>{if(!keep.includes(v))v.pause()})}
function ready(v){
 if(v.readyState>=1)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const cleanup=()=>{clearTimeout(timer);v.removeEventListener('loadedmetadata',success);v.removeEventListener('error',fail)},success=()=>{cleanup();resolve()},fail=()=>{cleanup();reject(new Error('Video unavailable'))};
  const timer=setTimeout(fail,15000);v.addEventListener('loadedmetadata',success,{once:true});v.addEventListener('error',fail,{once:true});v.preload='auto';v.load();
 });
}
function seekVideo(v,time){
 const target=Math.max(0,Math.min(time,Number.isFinite(v.duration)?v.duration-.04:time));
 if(Math.abs(v.currentTime-target)<.015&&!v.seeking)return Promise.resolve();
 return new Promise((resolve,reject)=>{const cleanup=()=>{clearTimeout(timer);v.removeEventListener('seeked',done);v.removeEventListener('error',fail)},done=()=>{cleanup();resolve()},fail=()=>{cleanup();reject(new Error('Seek failed'))};const timer=setTimeout(fail,10000);v.addEventListener('seeked',done,{once:true});v.addEventListener('error',fail,{once:true});v.currentTime=target;});
}
function attachPair(el,config){
 const vs=[...el.querySelectorAll('.paired-runs video')],tracks=vs.map(v=>config.rows.find(r=>r.key===v.closest('.run-panel').dataset.run));
 const playButton=el.querySelector('.pair-play'),slider=el.querySelector('.pair-scrubber'),clock=el.querySelector('.pair-clock'),error=el.querySelector('.pair-error');
 let time=0,running=false,busy=false,raf=0,generation=0,positioned=false,prepared=false;
 function paint(){
  slider.value=String(time);const relative=time-config.reference;clock.textContent=`${relative<0?'−':'+'}${Math.abs(relative).toFixed(1)} s`;
  vs.forEach((v,i)=>{const ct=time+tracks[i].offset;let state='Recorded run';if(positioned)for(const s of tracks[i].states){if(s.t>ct)break;state=s.state}const badge=v.closest('.run-panel').querySelector('.state-badge');badge.textContent=state;badge.dataset.state=state;});
 }
 function pause(){generation++;running=false;busy=false;cancelAnimationFrame(raf);vs.forEach(v=>v.pause());playButton.disabled=false;playButton.textContent='Play both';}
 async function move(next){
  pause();time=Math.max(0,Math.min(config.duration,Number(next)));paint();const token=generation;error.hidden=true;
  try{await Promise.all(vs.map(ready));if(token!==generation)return;await Promise.all(vs.map((v,i)=>seekVideo(v,time+tracks[i].offset)));if(token===generation){positioned=true;paint();}}catch(e){if(token===generation){error.textContent='This recording could not load. Please refresh and try again.';error.hidden=false;}}
 }
 function tick(){
  if(!running)return;
  time=Math.max(0,Math.min(config.duration,vs[0].currentTime-tracks[0].offset));
  if(time>=config.duration-.04){time=config.duration;pause();paint();return;}
  // Equal playback speed; only a constant, source-verified route-reference offset.
  const target=time+tracks[1].offset;if(!vs[1].seeking&&Math.abs(vs[1].currentTime-target)>.16)vs[1].currentTime=target;
  paint();raf=requestAnimationFrame(tick);
 }
 async function play(){
  if(running||busy){pause();return;}pauseOthers(vs);busy=true;playButton.disabled=true;playButton.textContent='Loading…';error.hidden=true;const token=++generation;
  try{
   if(time>=config.duration-.06)time=0;
   await Promise.all(vs.map(ready));if(token!==generation)return;
   await Promise.all(vs.map((v,i)=>seekVideo(v,time+tracks[i].offset)));if(token!==generation)return;
   await Promise.all(vs.map(v=>v.play()));if(token!==generation){vs.forEach(v=>v.pause());return;}
   positioned=true;busy=false;running=true;playButton.disabled=false;playButton.textContent='Pause both';raf=requestAnimationFrame(tick);
  }catch(e){if(token===generation){pause();error.textContent='Playback could not start. Please try again.';error.hidden=false;}}
 }
 playButton.onclick=play;el.querySelector('.pair-restart').onclick=async()=>{await move(0);if(error.hidden)await play()};el.querySelector('.pair-reference').onclick=()=>move(config.reference);
 slider.oninput=()=>move(slider.value);
 vs.forEach(v=>{v.muted=true;v.onclick=play;v.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play()}});v.addEventListener('ended',()=>{pause();paint()});v.addEventListener('error',()=>{pause();error.textContent='A recording is unavailable. Please refresh and try again.';error.hidden=false;});});
 paint();const controller={videos:vs,pause,move,play,prepare(){if(!prepared){prepared=true;move(0)}}};controllers.push(controller);return controller;
}
document.querySelectorAll('.comparison-case').forEach(el=>attachPair(el,alignment[el.dataset.group]));
videos.forEach(v=>{
 v.muted=true;
 if(!v.closest('.paired-runs'))v.addEventListener('play',()=>pauseOthers(activeGroup?.videos.includes(v)?activeGroup.videos:[v]));
});
document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>{if(!el.open)el.querySelectorAll('video').forEach(v=>v.pause());scheduleScenes();}));
const hero=$('#hero-video video');
hero.addEventListener('timeupdate',()=>{if(hero.currentTime>=4.1)$('#title').classList.add('title-visible');});
hero.addEventListener('error',()=>$('#title').classList.add('title-visible'));
setTimeout(()=>$('#title').classList.add('title-visible'),5000);
// Only the overview and results belong to the scrolling narrative.
function scene(node,extra=''){
 const shell=document.createElement('div');shell.className=`scene-shell snap-panel ${extra}`;
 node.before(shell);shell.appendChild(node);node.classList.add('scene-surface');return shell;
}
scene($('#platform'),'platform-shell');scene($('#method'),'method-shell');scene($('#long-horizon'),'results-shell');
document.querySelectorAll('.section-heading,.stage-copy,.case-heading,.media-caption,.method-overview figcaption').forEach(el=>el.classList.add('scene-text'));
document.body.classList.add('scroll-ready');

// A collapsed menu keeps the film prominent. All links remain keyboard accessible when open.
const topbar=$('.topbar'),nav=$('#site-navigation'),navToggle=$('#nav-toggle');
function setNav(open){topbar.classList.toggle('is-collapsed',!open);nav.inert=!open;navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');$('#nav-toggle-label').textContent=open?'Close':'Menu';}
navToggle.onclick=()=>setNav(topbar.classList.contains('is-collapsed'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setNav(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!topbar.classList.contains('is-collapsed')){setNav(false);navToggle.focus();}});

const groups=videos.map(v=>controllers.find(c=>c.videos.includes(v))||{videos:[v]});
const playbackGroups=[...new Set(groups)],visibleGroups=new Map();let activeGroup=null,playGeneration=0;
function reveal(v){v.closest('.scene-shell')?.classList.add('has-entered');}
function failPlayback(v){reveal(v);if(v===hero)$('#hero-start').hidden=false;}
async function startGroup(group){
 activeGroup=group;const token=++playGeneration;pauseOthers(group?.videos||[]);
 if(!group)return;
 if(group.play){await group.play();return;}
 await Promise.all(group.videos.map(async v=>{
 try{await ready(v);if(token!==playGeneration||document.hidden)return;
  if(v===hero&&(v.currentTime<1.8||v.ended))await seekVideo(v,1.8);
  else if(v.ended||v.currentTime<Number(v.dataset.start||0))await seekVideo(v,Number(v.dataset.start||0));
  if(token!==playGeneration||document.hidden)return;
  await v.play();if(token!==playGeneration)v.pause();
 }catch(e){if(token===playGeneration)failPlayback(v);}
 }));
}
async function toggle(v){
 if(!v.paused){v.pause();return;}
 pauseOthers([v]);try{await ready(v);if(v===hero&&v.currentTime<1.8)await seekVideo(v,1.8);await v.play();}catch(e){failPlayback(v);}
}
async function fullScreen(v){try{if(v.requestFullscreen)await v.requestFullscreen();else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();}catch(e){/* Browser retains inline playback. */}}
videos.forEach(v=>{
 v.addEventListener('play',()=>{reveal(v);if(v===hero)$('#hero-start').hidden=true;});
 if(v.closest('.paired-runs'))return;
 v.controls=false;
 if(v===hero){
  const b=$('#hero-toggle'),paint=()=>{b.textContent=v.paused?'Play':'Pause';b.setAttribute('aria-label',`${v.paused?'Play':'Pause'} opening video`)};
  b.onclick=()=>toggle(v);$('#hero-start').onclick=()=>toggle(v);['play','pause','ended'].forEach(e=>v.addEventListener(e,paint));paint();
  v.addEventListener('ended',async()=>{if(activeGroup?.videos.includes(v)&&!document.hidden){try{await seekVideo(v,1.8);if(activeGroup?.videos.includes(v))await v.play();}catch(e){failPlayback(v);}}});return;
 }
 const hardware=v.id==='hardware-video',bar=hardware?$('.tour-actions'):document.createElement('div');bar.classList.add('minimal-player-controls');
 const play=document.createElement('button');play.textContent='Play';play.onclick=()=>toggle(v);
 const replay=hardware?$('#replay-tour'):document.createElement('button');replay.textContent='Replay';
 if(!hardware)replay.onclick=async()=>{pauseOthers([v]);try{await ready(v);await seekVideo(v,Number(v.dataset.start||0));await v.play();}catch(e){failPlayback(v);}};
 const fullscreen=document.createElement('button');fullscreen.textContent='Full screen';fullscreen.onclick=()=>fullScreen(v);
 bar.prepend(play);bar.append(replay,fullscreen);if(!hardware)v.after(bar);
 const paint=()=>{play.textContent=v.paused?'Play':'Pause';play.setAttribute('aria-label',`${v.paused?'Play':'Pause'}: ${v.getAttribute('aria-label')}`)};
 ['play','pause','ended'].forEach(e=>v.addEventListener(e,paint));paint();
});

const deck=$('#story-deck'),panels=[...deck.querySelectorAll('.snap-panel')];
// Oversized panels (mobile hardware and expanded maps) keep their contents reachable.
const panelSizeObserver=new ResizeObserver(()=>{panels.forEach(p=>p.classList.toggle('is-tall',p.getBoundingClientRect().height>deck.clientHeight+2));scheduleScenes();});
panelSizeObserver.observe(deck);panels.forEach(p=>panelSizeObserver.observe(p));
const nextButton=document.createElement('button');nextButton.id='next-panel';nextButton.type='button';nextButton.setAttribute('aria-label','Next section');nextButton.title='Next section';nextButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';document.body.appendChild(nextButton);
nextButton.onclick=()=>goToPanel(panels[Math.min(panels.length-1,panels.indexOf(nearestPanel())+1)]);
let scrollFrame=0,currentPanel=null,navigationTarget=null,lastNavY=0;
function panelTop(panel){return panel.getBoundingClientRect().top-deck.getBoundingClientRect().top+deck.scrollTop;}
function nearestPanel(){const center=deck.getBoundingClientRect().top+deck.clientHeight/2;let best=panels[0],distance=Infinity;panels.forEach(p=>{const r=p.getBoundingClientRect(),d=center<r.top?r.top-center:center>r.bottom?center-r.bottom:0;if(d<distance){distance=d;best=p;}});return best;}
function goToPanel(panel){
 if(!panel)return;setNav(false);navigationTarget=panel;
 deck.scrollTo({top:panelTop(panel),behavior:reduced?'instant':'smooth'});
 scheduleScenes();
}
// Native wheel/touch scrolling stays continuous, with CSS proximity snapping on release.
deck.addEventListener('wheel',()=>{navigationTarget=null;},{passive:true});
deck.addEventListener('touchstart',()=>{navigationTarget=null;},{passive:true});
document.addEventListener('keydown',event=>{
 if(document.querySelector('dialog[open]')||event.target.closest('input,button,a,summary,video,[contenteditable="true"]'))return;
 const moves={ArrowDown:1,PageDown:1,' ':event.shiftKey?-1:1,ArrowUp:-1,PageUp:-1};
 if(!(event.key in moves)&&!['Home','End'].includes(event.key))return;
 const panel=nearestPanel(),direction=moves[event.key];
 if(direction && panel.scrollHeight>panel.clientHeight+2 && (direction>0?panel.scrollTop+panel.clientHeight<panel.scrollHeight-2:panel.scrollTop>2)){
  event.preventDefault();panel.scrollBy({top:direction*panel.clientHeight*.75,behavior:reduced?'instant':'smooth'});return;
 }
 event.preventDefault();goToPanel(event.key==='Home'?panels[0]:event.key==='End'?panels.at(-1):panels[Math.max(0,Math.min(panels.length-1,panels.indexOf(panel)+direction))]);
});
function targetPanel(hash){const target=document.getElementById(hash.replace(/^#/,''));return target?.closest('.snap-panel')||target?.querySelector('.snap-panel');}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 const hash=link.getAttribute('href');if(/^#stage-(pre|mid|post)$/.test(hash)){event.preventDefault();setStage(hash.slice(7),link);return;}const panel=targetPanel(hash);if(panel){event.preventDefault();goToPanel(panel);}
}));
// Details open above the page and keep the visitor's place at the overview.
const methodDialog=$('#method-dialog'),evidenceDialog=$('#evidence-dialog');let returnFocus=null;
function openDialog(dialog,trigger){
 if(!dialog.open){returnFocus=trigger||document.activeElement;setNav(false);dialog.showModal();document.body.classList.add('detail-open');}
}
function setStage(key,trigger){
 if(!['pre','mid','post'].includes(key))return;
 ++playGeneration;pauseOthers();activeGroup=null;
 methodDialog.dataset.stage=key;
 methodDialog.querySelectorAll('.method-stage').forEach(el=>el.hidden=el.id!==`stage-${key}`);
 methodDialog.querySelectorAll('[data-open-stage]').forEach(el=>{el.setAttribute('aria-selected',String(el.dataset.openStage===key));el.tabIndex=el.dataset.openStage===key?0:-1;});
 if(key!=='pre')projectionDetails.open=false;
 openDialog(methodDialog,trigger);methodDialog.scrollTop=0;scheduleScenes();
}
document.querySelectorAll('[data-open-stage]').forEach(el=>el.addEventListener('click',()=>setStage(el.dataset.openStage,el)));
const overview=$('#overview-interactive'),cursor=$('#overview-cursor');
function focusSpot(el){overview.dataset.active=el?.dataset.openStage||'';}
overview.querySelectorAll('.overview-hotspot').forEach(el=>{
 el.addEventListener('pointerenter',()=>focusSpot(el));el.addEventListener('focus',()=>focusSpot(el));
 el.addEventListener('pointermove',event=>{const r=overview.getBoundingClientRect();cursor.style.setProperty('--cursor-x',`${Math.min(event.clientX-r.left+16,r.width-155)}px`);cursor.style.setProperty('--cursor-y',`${Math.min(event.clientY-r.top+18,r.height-42)}px`);});
 el.addEventListener('pointerleave',()=>focusSpot(null));el.addEventListener('blur',()=>focusSpot(null));
});
document.querySelectorAll('[data-open-evidence]').forEach(el=>el.onclick=()=>{
 const id=el.dataset.openEvidence;++playGeneration;pauseOthers();activeGroup=null;
 evidenceDialog.querySelectorAll('.story-section').forEach(section=>section.hidden=section.id!==id);
 openDialog(evidenceDialog,el);evidenceDialog.scrollTop=0;scheduleScenes();
});
for(const dialog of [methodDialog,evidenceDialog]){
 dialog.querySelectorAll('[data-close-dialog]').forEach(el=>el.onclick=()=>dialog.close());
 dialog.addEventListener('close',()=>{++playGeneration;pauseOthers();activeGroup=null;projectionDetails.open=false;document.body.classList.remove('detail-open');returnFocus?.focus({preventScroll:true});scheduleScenes();});
 dialog.addEventListener('scroll',scheduleScenes,{passive:true});
}
function setResultView(key){
 ++playGeneration;pauseOthers();activeGroup=null;
 document.querySelectorAll('[data-result-view]').forEach(el=>{el.setAttribute('aria-selected',String(el.dataset.resultView===key));el.tabIndex=el.dataset.resultView===key?0:-1;});
 $('#route-view').hidden=key!=='route';$('#settings-view').hidden=key!=='settings';scheduleScenes();
}
document.querySelectorAll('[data-result-view]').forEach(el=>el.onclick=()=>setResultView(el.dataset.resultView));
// Arrow keys switch tabs without affecting page scrolling.
for(const list of document.querySelectorAll('[role="tablist"]'))list.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const tabs=[...list.querySelectorAll('[role="tab"]')],i=tabs.indexOf(document.activeElement);if(i<0)return;
 e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;tabs[next].focus();tabs[next].click();
});
function visibleVideo(v,viewport){
 if(v.closest('[hidden]')||v.closest('details:not([open])'))return false;
 const r=v.getBoundingClientRect();return r.height>0&&Math.min(r.bottom,viewport.bottom)-Math.max(r.top,viewport.top)>Math.min(r.height,viewport.height)*.45;
}
function visibleGroup(container,viewport){
 const candidates=playbackGroups.filter(g=>g.videos.some(v=>container.contains(v)&&visibleVideo(v,viewport)));
 // Matched runs keep their shared clock; independent visible examples play together.
 const pair=candidates.find(g=>g.play);if(pair)return pair;
 const visible=candidates.flatMap(g=>g.videos).filter(v=>visibleVideo(v,viewport));if(!visible.length)return null;
 const key=visible.map(v=>videos.indexOf(v)).join(',');
 if(!visibleGroups.has(key))visibleGroups.set(key,{videos:visible});return visibleGroups.get(key);
}
function updateScenes(){
 scrollFrame=0;
 const dialog=document.querySelector('dialog[open]');
 if(dialog){
  const viewport=dialog.getBoundingClientRect();const group=visibleGroup(dialog,viewport);
  if(!document.hidden&&group!==activeGroup)startGroup(group);nextButton.hidden=true;return;
 }
 const h=deck.clientHeight;if(!h)return;
 const nextPanel=nearestPanel(),rect=nextPanel.getBoundingClientRect(),deckRect=deck.getBoundingClientRect();
 panels.forEach(panel=>{panel.classList.toggle('is-current',panel===nextPanel);const r=panel.getBoundingClientRect();if(r.top<deckRect.bottom-h*.15&&r.bottom>deckRect.top+h*.15)panel.classList.add('has-entered');});
 let nextGroup=null;
 const playbackSettled=!navigationTarget||Math.abs(rect.top-deckRect.top)<2;
 if(playbackSettled&&(!navigationTarget||navigationTarget===nextPanel)){
  navigationTarget=null;nextGroup=visibleGroup(nextPanel,deckRect);
 }
 if(!document.hidden&&nextGroup!==activeGroup)startGroup(nextGroup);
 currentPanel=nextPanel;
 nextButton.hidden=nextPanel===panels.at(-1);
 const y=deck.scrollTop,delta=y-lastNavY;if(Math.abs(delta)>14){if(!nav.contains(document.activeElement))setNav(false);lastNavY=y;}
}
function scheduleScenes(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScenes);}
deck.addEventListener('scroll',scheduleScenes,{passive:true});window.addEventListener('resize',scheduleScenes);
document.addEventListener('visibilitychange',()=>{if(document.hidden){++playGeneration;pauseOthers();activeGroup=null;}else scheduleScenes();});
document.querySelectorAll('img').forEach(img=>img.addEventListener('load',scheduleScenes));
// Load only the destination panel's videos, not every panel passed during a menu jump.
if(window.location?.hash){const hash=window.location.hash,panel=targetPanel(hash);if(panel)deck.scrollTop=panelTop(panel);else if(/^#stage-(pre|mid|post)$/.test(hash)){deck.scrollTop=panelTop(targetPanel('#method'));setStage(hash.slice(7));}}
scheduleScenes();
})().catch(error=>{console.error(error);const hero=document.querySelector('#hero-video');if(hero)hero.textContent='The recordings could not load. Please refresh and try again.'});
