(async function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const D=(await (await fetch('./data.json')).json()).showcase;
let followHardware=true,zh=false,part='platform',mode='train',p=0,duration=16,playing=false,previousTime=0,lastPaint=0,geometry=null,images={},orbit=0,loadToken=0,frameId=0;
const t=(en,cn)=>zh?cn:en, canvas=$('#projection-canvas'),ctx=canvas.getContext('2d'),video=$('#hardware-video');
const facts={platform:[['Base','底盘','Permobil M3'],['Computer','计算设备','AGX Orin']],battery:[['Supply','供电','Independent / 独立'],['Powers','供电对象','Onboard computer / 车载计算']],jetson:[['Policy','策略推理','10 Hz'],['Trajectory follower','轨迹跟踪','50 Hz']],can:[['Adapter','适配器','1 × dual CAN'],['CH1','通道 1','Joystick / 摇杆'],['CH2','通道 2','Drive bus / 驱动']],phone:[['Connectivity','网络','Hotspot / 热点'],['Position','位置','GPS logging / GPS 记录']],joystick:[['Input','输入','Rider control / 人工控制'],['Interface','接口','R-net']],zed:[['Observations','观察','RGB-D · 30 Hz'],['Motion estimate','运动估计','Visual–inertial odometry']],rnet:[['Controller','控制器','OEM R-net'],['Output','输出','Motor drive / 电机驱动']],motors:[['Actuation','执行','Wheel motors / 轮毂电机']]};
const extraParts={rnet:{title:'R-net controller',zh:'R-net 控制器',brief:'Receives the drive command and controls the motors.',brief_zh:'接收驱动命令并控制电机。'},motors:{title:'Wheel motors',zh:'轮毂电机',brief:'Execute the drive command through the wheelchair’s original motor controller.',brief_zh:'通过轮椅原有控制器执行驱动命令。'}};
const stageStarts=[0,.15,.37,.50,.84,.95];
const steps={train:[['Source image','源域图像'],['Lift with depth','按深度展开'],['Wheelchair view','轮椅视锥'],['Visible region','可见区域'],['Visibility mask','可见性蒙版'],['Masked image','带蒙版图像']],deploy:[['RGB + replay depth','RGB 与回放深度'],['Lift with depth','按深度展开'],['Model viewpoint','模型视角'],['Project into view','投影到目标视角'],['Resolve image','得到重投影图像'],['Replay output','回放输出']]};
const explanations={train:[
 ['Start with a delivery robot image.','从配送机器人的图像开始。','A delivery robot image provides the source-domain observation.','沿用之前动画中的源域观察。'],
 ['Depth gives each pixel a 3D position.','深度把像素展开为三维点。','Back-project pixels through the source camera intrinsics. The observer moves aside to reveal the scene geometry.','按源相机内参反投影；观察镜头转向侧面，展示场景几何。'],
 ['Add the wheelchair viewpoint.','加入轮椅的视角。','The second frustum uses the calibrated relative camera pose. Moving the observer does not move either camera.','第二个视锥使用标定的相机相对位姿；旋转观察镜头不会改变这两个相机的位置。'],
 ['Identify what the wheelchair can observe.','标出轮椅可以看到的区域。','The visibility test accounts for the image boundary and depth ordering. Gold highlights the retained points.','根据图像边界和深度顺序检查可见性，金色标出保留的点。'],
 ['Return to the source image.','回到源图像坐标。','Each visibility decision maps back to its original pixel position.','将可见性结果对应回原始像素位置。'],
 ['Keep the visible information.','保留可见的信息。','Apply the mask to the delivery robot image for training. Unobserved pixels are black.','将蒙版应用于配送机器人图像，用于训练；不可见区域置黑。']],
 deploy:[
 ['Start from a wheelchair observation.','从轮椅观察开始。','This example uses recorded RGB with depth reconstructed by replaying the same SVO frame.','此示例使用记录的 RGB，以及同一 SVO 帧回放获得的深度。'],
 ['Lift the wheelchair pixels into 3D.','将轮椅图像像素展开为三维点。','RGB supplies the colour; replay depth supplies the position.','RGB 提供颜色，回放深度提供三维位置。'],
 ['Add the model’s virtual viewpoint.','加入模型的虚拟视角。','Transform the points using the recorded camera transform, then project them into the model view.','使用交付包中的相机变换，将点投影到模型视角。'],
 ['Reproject the available observations.','重投影可用的观察。','Some parts of the target image have no corresponding observations and remain unknown.','目标图像中有些区域没有对应观察，因此仍然未知。'],
 ['Resolve the projected image.','得到重投影图像。','The supplied replay output includes the projection and small-hole post-processing.','这里接入的回放输出已包含投影与小孔洞后处理。'],
 ['Use the adapted viewpoint.','使用适配后的视角。','The animation ends with the replay output. The actual recorded model input is shown separately below.','动画结束于回放输出；下方另列实际记录的模型输入，便于比较。']]};

function hardwareSVG(){
 const node=(id,x,y,w,h,title,sub='')=>`<g class="hw-node" data-part="${id}" tabindex="0" role="button" aria-label="${title}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11"/><text x="${x+w/2}" y="${y+(sub?24:h/2+6)}" text-anchor="middle">${title}</text>${sub?`<text class="sub" x="${x+w/2}" y="${y+43}" text-anchor="middle">${sub}</text>`:''}</g>`;
 const wire=(d,power=false)=>`<path class="hw-wire ${power?'hw-power':''}" d="${d}"/>${power?'':`<path class="hw-motion" d="${d}"/>`}`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 630" role="group" aria-label="Wheelchair hardware connections"><title>One dual-channel USB–CAN adapter connects joystick and drive bus to Jetson</title><g>${wire('M210 76 V205')}${wire('M133 139 H158 V205')}${wire('M285 139 H263 V205',true)}${wire('M200 270 V337')}${wire('M220 337 V270')}${wire('M73 458 V375 H105')}${wire('M315 375 H337 V458')}${wire('M337 516 V570')}<text x="231" y="312" fill="#8394a3" font-size="12" font-family="Arial">USB</text><path class="hw-cut" d="M143 490 H265"/><path class="hw-cut-x" d="M194 480 L212 500 M212 480 L194 500"/><text x="203" y="533" fill="#aa7b7c" text-anchor="middle" font-size="10" font-family="Arial">${t('Original direct link','原有直连线路')}</text></g>
 ${node('zed',130,22,160,54,'ZED 2i','RGB-D')}${node('phone',7,109,126,59,'Pixel 8 Pro',t('Network · GPS','网络 · GPS'))}${node('battery',285,109,127,59,t('Battery','电源'),t('Compute power','计算设备供电'))}${node('jetson',128,205,164,65,'Jetson AGX Orin',t('Policy · follower','策略 · 跟踪器'))}
 <g class="hw-node" data-part="can" tabindex="0" role="button" aria-label="Dual-channel USB–CAN"><rect x="105" y="337" width="210" height="77" rx="11"/><text x="210" y="361" text-anchor="middle">Dual-channel CAN</text><rect class="port" x="115" y="373" width="87" height="28" rx="5"/><rect class="port" x="218" y="373" width="87" height="28" rx="5"/><text class="sub" x="158" y="392" text-anchor="middle">CH1 · ${t('Joystick','摇杆')}</text><text class="sub" x="262" y="392" text-anchor="middle">CH2 · ${t('Drive','驱动')}</text></g>
 ${node('joystick',3,458,140,58,t('Joystick','摇杆'),t('Rider input','人工输入'))}${node('rnet',265,458,150,58,'R-net',t('Motor controller','电机控制器'))}${node('motors',265,570,150,48,t('Wheel motors','轮毂电机'))}</svg>`;
}
function selectPart(id,seek=false){
 part=id;const item=D.hardware.parts.find(v=>v.id===id)||extraParts[id];if(!item)return;
 if(seek&&item.start!==undefined){video.currentTime=item.start;followHardware=true;}
 if(seek&&item.start===undefined)followHardware=false;
 $('#part-index').textContent=t('COMPONENT','硬件部件');$('#part-title').textContent=zh?item.zh:item.title;$('#part-description').textContent=zh?item.brief_zh:item.brief;
 $('#part-facts').innerHTML=(facts[id]||[]).map(([en,cn,value])=>`<div class="part-fact"><span>${t(en,cn)}</span><strong>${value.includes(' / ')?value.split(' / ')[zh?1:0]:value}</strong></div>`).join('');
 $$('[data-part]').forEach(el=>{el.classList.toggle('active',el.dataset.part===id);el.setAttribute('aria-pressed',el.dataset.part===id?'true':'false')});
}
function hardwareUI(){
 $('#hardware-diagram').innerHTML=hardwareSVG();
 $$('[data-part]').forEach(el=>{el.addEventListener('click',()=>selectPart(el.dataset.part,true));el.addEventListener('keydown',e=>{if(el.tagName.toLowerCase()==='g'&&['Enter',' '].includes(e.key)){e.preventDefault();selectPart(el.dataset.part,true)}})});selectPart(part);
}
video.src=D.hardware.web.url;video.poster=D.hardware.poster.url;video.muted=true;

video.addEventListener('error',()=>{$('#hardware-error').hidden=false});
video.addEventListener('timeupdate',()=>{if(!followHardware)return;const item=[...D.hardware.parts].reverse().find(v=>v.start<=video.currentTime);if(item&&item.id!==part)selectPart(item.id)});
// Finish on the opening view without looping; re-entry or Play starts the tour again.
video.addEventListener('ended',()=>{video.pause();followHardware=true;video.currentTime=0;selectPart('platform')});
$('#replay-tour').onclick=()=>{video.currentTime=0;followHardware=true;selectPart('platform');video.play().catch(()=>{})};
video.addEventListener('play',()=>{followHardware=true});

function currentStep(){let result=0;stageStarts.forEach((v,i)=>{if(p>=v)result=i});return result}
function draw(){if(geometry)window.ChairNavProjection.render(ctx,geometry,images,p,{zh,orbit});const i=currentStep();$('#step-number').textContent=`0${i+1} / 06`;$('#step-title').textContent=steps[mode][i][zh?1:0];$('#explain-title').textContent=explanations[mode][i][zh?1:0];$('#explain-body').textContent=explanations[mode][i][zh?3:2];$('#projection-clock').textContent=`${(p*duration).toFixed(1)} / ${duration} s`;$('#projection-time').value=String(p);$$('[data-step]').forEach(el=>el.classList.toggle('active',Number(el.dataset.step)===i))}
function pause(){playing=false;cancelAnimationFrame(frameId);$('#projection-play').textContent=t('▶ Play','▶ 播放')}
function frame(now){if(!playing)return;if(!previousTime)previousTime=now;p=Math.min(1,p+(now-previousTime)/1000/duration);previousTime=now;if(now-lastPaint>30||p===1){draw();lastPaint=now}if(p>=1){pause();return}frameId=requestAnimationFrame(frame)}
function play(){if(!geometry||playing)return;if(p>=1)p=0;playing=true;previousTime=0;$('#projection-play').textContent=t('Ⅱ Pause','Ⅱ 暂停');frameId=requestAnimationFrame(frame)}
function imageLoad(asset){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(asset.name));img.src=asset.url})}
async function setMode(next){pause();manualProjectionPause=false;mode=next;p=0;orbit=0;geometry=null;const token=++loadToken;$('#projection-loading').hidden=false;modeUI();try{const a=D[mode];const [data,entries]=await Promise.all([(await fetch(a.geometry.url)).json(),Promise.all(Object.entries(a).filter(([k])=>k!=='geometry'&&k!=='live').map(async([k,v])=>[k,await imageLoad(v)]))]);if(token!==loadToken)return;geometry=data;images=Object.fromEntries(entries);$('#projection-loading').hidden=true;draw();syncProjectionPlayback(true)}catch(error){if(token!==loadToken)return;$('#projection-loading').textContent=t('This animation could not load. Please refresh and try again.','素材暂不可用，请确认外接硬盘已连接。');console.error(error)}}
function modeUI(){
 $$('[data-mode]').forEach(el=>{el.classList.toggle('active',el.dataset.mode===mode);el.setAttribute('aria-pressed',String(el.dataset.mode===mode))});
 $('#geometry-label').textContent=mode==='train'?'C10395 · frame 32':'W0828 · tick 23572';$('#explain-stage').textContent=mode==='train'?t('TRAINING','训练'):t('DEPLOYMENT · REPLAY','部署 · 回放');
 $('#source-camera-label').textContent=mode==='train'?t('Delivery robot camera','配送机器人相机'):t('Virtual model viewpoint','虚拟模型视角');
 $('#projection-provenance').textContent=mode==='train'?t('Source RGB, estimated depth, and relative camera calibration.','既有源图像、估计深度与标定位姿；可见性结果复现之前动画。'):t('Replay-derived depth; representative intrinsics and rectified RGB fit. The recorded live input is a separate reference.','深度来自回放；使用代表性内参与 RGB 校正拟合。实际记录的模型输入另列。');
 $('#projection-steps').innerHTML=steps[mode].map((v,i)=>`<button data-step="${i}"><span>0${i+1}</span>${v[zh?1:0]}</button>`).join('');$$('[data-step]').forEach(el=>el.onclick=()=>{manualProjectionPause=true;pause();p=stageStarts[Number(el.dataset.step)];orbit=0;draw()});
 const a=D[mode], panels=mode==='train'?[[a.input,t('Source image','源图像'),t('Delivery robot RGB','配送机器人 RGB')],[a.mask,t('Visibility mask','可见性蒙版'),t('In source-image coordinates','对应源图像坐标')],[a.output,t('Masked source image','带蒙版源图像'),t('Adapted observation for training','用于训练的适配观察')]]:[[a.input,t('Wheelchair RGB','轮椅 RGB'),t('Rectified image fit','校正拟合图像')],[a.depth,t('Replay depth','回放深度'),t('Recomputed from the same SVO frame','同一 SVO 帧重新计算')],[a.output,t('Replay reprojection','回放重投影'),t('Includes small-hole post-processing','包含小孔洞后处理')],[a.live,t('Recorded model input','实际记录的模型输入'),t('Reference from the live run','实车记录参考')]];
 $('#projection-results').classList.toggle('four',mode==='deploy');$('#projection-results').innerHTML=panels.map(([asset,label,note])=>`<figure><a class="result-image" href="${asset.url}" target="_blank"><img src="${asset.url}" alt="${label}" loading="lazy"></a><figcaption>${label}<small>${note}</small></figcaption></figure>`).join('');
 $('#result-note').textContent=mode==='train'?t('The mask retains visible pixels at their original positions; this is not a rendered wheelchair-view RGB image.','蒙版保留原位置上的可见像素；该结果不是重新渲染的轮椅视角 RGB 图像。'):t('Replay and runtime depth settings differ, so the replay output is not expected to be pixel-identical to the recorded model input.','回放与运行时的深度设置不同，因此回放输出与实际记录的模型输入不应视为逐像素相同。');

}
$('#projection-play').onclick=()=>{manualProjectionPause=playing;playing?pause():play()};$('#projection-reset').onclick=()=>{manualProjectionPause=false;pause();p=0;orbit=0;draw();syncProjectionPlayback(true)};
$('#projection-time').oninput=e=>{manualProjectionPause=true;pause();p=Number(e.target.value);orbit=0;draw()};
$$('[data-mode]').forEach(el=>el.onclick=()=>setMode(el.dataset.mode));

let dragX=null;canvas.addEventListener('pointerdown',e=>{if(p<.25||p>.80)return;manualProjectionPause=true;pause();dragX=e.clientX;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(dragX===null)return;orbit+=(e.clientX-dragX)*.005;dragX=e.clientX;draw()});canvas.addEventListener('pointerup',()=>dragX=null);canvas.addEventListener('pointercancel',()=>dragX=null);
hardwareUI();
const details=$('#projection-details'),projectionDialog=details.closest('dialog');let loaded=false,projectionVisible=false,manualProjectionPause=false,projectionVisibilityFrame=0;
function syncProjectionPlayback(force=false){
 const r=canvas.getBoundingClientRect(),viewport=projectionDialog?.getBoundingClientRect()||{top:0,bottom:innerHeight,height:innerHeight};
 const top=viewport.top+(projectionDialog?.querySelector('.dialog-bar')?.offsetHeight||0);
 const visible=!document.hidden&&details.open&&(!projectionDialog||projectionDialog.open)&&!canvas.closest('[hidden]')&&r.height>0&&Math.min(r.bottom,viewport.bottom)-Math.max(r.top,top)>Math.min(r.height,viewport.bottom-top)*.35;
 const entered=visible&&!projectionVisible;projectionVisible=visible;
 if(!visible)pause();else if((entered||force)&&!manualProjectionPause)play();
}
function scheduleProjectionVisibility(){if(!projectionVisibilityFrame)projectionVisibilityFrame=requestAnimationFrame(()=>{projectionVisibilityFrame=0;syncProjectionPlayback()})}
details.addEventListener('toggle',()=>{
 if(details.open){manualProjectionPause=false;if(!loaded){loaded=true;setMode(mode)}else syncProjectionPlayback(true)}else syncProjectionPlayback();
});
projectionDialog?.addEventListener('scroll',scheduleProjectionVisibility,{passive:true});
projectionDialog?.addEventListener('close',()=>syncProjectionPlayback());
window.addEventListener('scroll',scheduleProjectionVisibility,{passive:true});window.addEventListener('resize',scheduleProjectionVisibility);
new IntersectionObserver(scheduleProjectionVisibility,{threshold:[0,.35,.7,1]}).observe(canvas);
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();syncProjectionPlayback()});
if(details.open){loaded=true;await setMode(mode)}
})().catch(error=>{console.error(error);const el=document.querySelector('#projection-loading');if(el)el.textContent='Unable to load this section. Please refresh and try again.'});
