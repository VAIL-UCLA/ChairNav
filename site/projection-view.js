(function(global){
'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n)};
function contain(c,img,x,y,w,h,alpha=1){if(!img)return;c.save();c.globalAlpha=alpha;const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,r=Math.min(w/iw,h/ih),ww=iw*r,hh=ih*r;c.drawImage(img,x+(w-ww)/2,y+(h-hh)/2,ww,hh);c.restore()}
function render(c,data,images,p,options={}){
 const W=c.canvas.width,H=c.canvas.height,s=W/1200,zh=!!options.zh,train=data.mode==='train';p=clamp(p);
 c.fillStyle='#F6F8FB';c.fillRect(0,0,W,H);
 const box={x:30*s,y:20*s,w:W-60*s,h:H-40*s};
 const text=(t,x,y,size=20,color='#60778B',bold=false)=>{c.fillStyle=color;c.font=`${bold?'600':'400'} ${size*s}px Arial,sans-serif`;c.fillText(t,x,y)};
 if(p<.14){contain(c,images.input,box.x,box.y,box.w,box.h);if(!train&&images.depth&&p>.06){c.save();c.beginPath();c.rect(box.x,box.y,box.w*smooth((p-.06)/.08),box.h);c.clip();contain(c,images.depth,box.x,box.y,box.w,box.h);c.restore()}return}
 if(p>=.94){contain(c,images.output,box.x,box.y,box.w,box.h);return}
 const departure=smooth((p-.14)/.19),arrival=smooth((p-.67)/.20);
 const sideEye=train?[3.5,-1.7,-1.6]:[3.5,-1.5,-1.7],sideTarget=[0,0,2.35];
 let eye=mix([0,0,0],sideEye,departure),target=mix([0,0,1],sideTarget,departure),downHint=[0,1,0];
 const endEye=train?[0,0,0]:data.target_origin,endTarget=train?[0,0,1]:data.target_forward;
 eye=mix(eye,endEye,arrival);target=mix(target,endTarget,arrival);downHint=mix(downHint,train?[0,1,0]:data.target_down,arrival);
 const orbit=(options.orbit||0)*departure*(1-arrival);
 if(orbit){const r=sub(eye,target),cs=Math.cos(orbit),sn=Math.sin(orbit);eye=[target[0]+cs*r[0]+sn*r[2],eye[1],target[2]-sn*r[0]+cs*r[2]]}
 const forward=norm(sub(target,eye)),right=norm(cross(downHint,forward)),down=cross(forward,right);
 const ki=data.input_intrinsics,ko=train?ki:data.target_intrinsics;
 const initialFx=ki[0]/ki[4]*box.w,initialFy=ki[1]/ki[5]*box.h;
 const fx=(initialFx*(1-departure)+790*s*departure)*(1-arrival)+ko[0]/ko[4]*box.w*arrival;
 const fy=(initialFy*(1-departure)+790*s*departure)*(1-arrival)+ko[1]/ko[5]*box.h*arrival;
 const cx=box.x+((ki[2]/ki[4]*(1-departure)+.5*departure)*(1-arrival)+ko[2]/ko[4]*arrival)*box.w;
 const cy=box.y+((ki[3]/ki[5]*(1-departure)+.5*departure)*(1-arrival)+ko[3]/ko[5]*arrival)*box.h;
 const project=q=>{const r=sub(q,eye),z=dot(r,forward);return [cx+dot(r,right)/z*fx,cy+dot(r,down)/z*fy,z]};
 c.save();c.beginPath();c.rect(box.x,box.y,box.w,box.h);c.clip();
 const lift=smooth((p-.145)/.19),tint=smooth((p-.48)/.13)*(1-smooth((p-.72)/.11));
 const hide=smooth((p-.49)/.16);
 const pts=data.points.map(pt=>{const q=project(mix(pt.slice(3,6),pt.slice(0,3),lift));return {pt,q}}).filter(o=>o.q[2]>.03&&o.q[0]>=box.x-3&&o.q[0]<=box.x+box.w&&o.q[1]>=box.y-3&&o.q[1]<=box.y+box.h).sort((a,b)=>b.q[2]-a.q[2]);
 const sideWeight=departure*(1-arrival),radius=(2.8+1.25*(1-sideWeight))*s;
 for(const {pt,q}of pts){const visible=pt[9];let color=pt.slice(6,9);if(visible)color=mix(color,[210,163,82],tint*.38);else color=mix(color,[246,248,251],hide*.91);c.fillStyle=`rgb(${color.map(v=>Math.round(v)).join(',')})`;c.fillRect(q[0]-radius/2,q[1]-radius/2,radius,radius)}
 function line(a,b,color,width=2){const u=project(a),v=project(b);if(u[2]<.02||v[2]<.02)return;c.strokeStyle=color;c.lineWidth=width*s;c.beginPath();c.moveTo(u[0],u[1]);c.lineTo(v[0],v[1]);c.stroke()}
 function frustum(points,color,label,alpha){if(alpha<.01)return;c.save();c.globalAlpha=alpha;for(let i=1;i<5;i++){line(points[0],points[i],color,2.1);line(points[i],points[i%4+1],color,2.1)}const q=project(points[0]);if(q[2]>.03&&q[0]>-100&&q[0]<W+100&&q[1]>-100&&q[1]<H+100){c.fillStyle=color;c.beginPath();c.arc(q[0],q[1],5*s,0,2*Math.PI);c.fill();c.font=`600 ${19*s}px Arial,sans-serif`;const width=c.measureText(label).width;let lx=clamp(q[0]+14*s,box.x+8*s,box.x+box.w-width-8*s);let ly=clamp(q[1]+(color==='#5084B5'?31:-24)*s,box.y+25*s,box.y+box.h-8*s);c.fillStyle='#ffffffec';c.fillRect(lx-6*s,ly-22*s,width+12*s,30*s);text(label,lx,ly,19,color,true)}c.restore()}
 const ca=clamp(sideWeight*3)*(1-smooth((p-.69)/.10)),targetAlpha=smooth((p-.36)/.12)*ca;
 frustum(data.input_frustum,train?'#5084B5':'#C3882D',train?(zh?'配送机器人相机':'Delivery robot camera'):(zh?'轮椅相机':'Wheelchair camera'),ca);
 frustum(data.target_frustum,train?'#C3882D':'#5084B5',train?(zh?'轮椅相机':'Wheelchair camera'):(zh?'虚拟模型视角':'Virtual model viewpoint'),targetAlpha);
 // No invented link between calibrated camera centres; frusta appear in sequence.
 if(p<.20)contain(c,images.input,box.x,box.y,box.w,box.h,1-smooth((p-.14)/.055));
 if(p>.83){const resolved=train&&p<.89?images.mask:images.output;contain(c,resolved,box.x,box.y,box.w,box.h,smooth((p-.83)/.08));if(train&&p>.89){contain(c,images.mask,box.x,box.y,box.w,box.h,1-smooth((p-.89)/.045))}}
 c.restore();
 if(p>.30&&p<.79){text(zh?'拖动查看 · 相机位置固定':'Drag to inspect · calibrated cameras stay fixed',36*s,H-20*s,14,'#8b9baa')}
}
global.ChairNavProjection={render,smooth};
})(typeof window!=='undefined'?window:globalThis);
