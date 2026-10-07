(()=>{
const S={name:'',tag:'',photos:[],about:{}};
const API=async(u,o={})=>{const r=await fetch(u,{credentials:'same-origin',...o,headers:{'Content-Type':'application/json','X-Requested-With':'portfolio',...(o.headers||{})}});const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'Request failed'),{status:r.status});return j};
const PHRASES=['Smoke bends light.','Silence consumes noise.','Shadows keep watch.','Time dissolves here.','Inner space expands.','Stillness is power.','Amber hours bleed.','Thoughts turn inward.','Detached from matrix.','Solitude breeds clarity.','Ghost in room.','Patience wears crowns.','Smoke tells truths.','Walls breathe slow.','Essence over ego.','Heavy is calm.','Void absorbs all.','Grace under ash.','Mind transcends walls.','Light yields dark.','Unshaken by drift.','Peace demands quiet.','Shadows carve form.','Rooted in nothing.','Flame holds secrets.','Presence equals weapon.','Detachment is freedom.','Watching time burn.','Heavy air breathes.','Absolute quiet reigns.'];
let ffOn=false,au=true,FC='#ffd166',canEdit=false,edit=false,dirty=false,filter='All',mode='album',lastMode='',pg=0,pal=0,art=null,vis=[],cur=0,phraseIdx=0;
const PAL=[['#aa5238','#ffd166','#c77dff'],['#b74266','#ffb3c6','#9d4edd'],['#675ace','#f78fb3','#4cc9f0'],['#007a69','#a3e635','#0ea5e9'],['#d11a42','#fde047','#10b981']],PN=['Golden hour','Rose','Twilight','Lagoon','Poppy'];
const $=(s,r=document)=>r.querySelector(s),root=$('#root'),R=new WeakMap(),PS=new WeakMap();
const esc=t=>String(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
root.innerHTML=`<div id="env"><div class="en"><div class="lt"><b id="en1"></b><span>a collection, just for you</span></div><div class="fl"></div><div class="fr"></div><button class="seal" id="seal">♥</button></div><p>tap the seal</p></div><div id="glow"></div><canvas id="ff"></canvas><div id="cur"></div><input id="pf" type="file" accept="image/*" hidden>
<header class="hero"><div class="blob"></div><h1 id="h"></h1><p id="tg"></p><button class="cta" id="cta">View the album <span class="ar">↓</span></button><div class="hint">move your mouse · click for sparks ↓</div></header>
<section class="splash" id="sp" aria-label="Life thru my lens"><svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34"/></filter></defs>
<path class="b k1" filter="url(#rough)" style="--d:0" d="M60 190C160 90 330 130 470 110S760 70 900 120S1100 90 1150 170C1190 240 1060 290 930 270S640 300 480 280S170 300 90 250Z"/>
<path class="b k2" filter="url(#rough)" style="--d:250" d="M200 120C280 50 420 60 520 95C480 150 300 175 200 120Z"/>
<path class="b k3" filter="url(#rough)" style="--d:400" d="M780 250C860 205 1000 215 1090 262C1040 325 860 335 780 250Z"/>
<circle class="b d k1 dr" style="--d:500;--tx:8px;--ty:-10px" cx="120" cy="80" r="14"/><circle class="b d k3 dr" style="--d:560;--tx:-6px;--ty:8px" cx="60" cy="150" r="8"/><circle class="b d k2 dr" style="--d:620;--tx:10px;--ty:6px" cx="1110" cy="70" r="16"/><circle class="b d k1 dr" style="--d:680;--tx:-8px;--ty:-6px" cx="1160" cy="130" r="9"/><circle class="b d k3 dr" style="--d:740;--tx:6px;--ty:10px" cx="980" cy="40" r="10"/><circle class="b d k2 dr" style="--d:800;--tx:-10px;--ty:-8px" cx="300" cy="40" r="7"/><circle class="b d k1 dr" style="--d:860;--tx:6px;--ty:-9px" cx="560" cy="332" r="12"/><circle class="b d k3 dr" style="--d:920;--tx:-7px;--ty:7px" cx="700" cy="338" r="8"/><circle class="b d k2 dr" style="--d:980;--tx:9px;--ty:-5px" cx="1020" cy="322" r="11"/><circle class="b d k3 dr" style="--d:1040;--tx:-6px;--ty:-9px" cx="150" cy="312" r="13"/><circle class="b d k1 dr" style="--d:1100;--tx:8px;--ty:8px" cx="40" cy="262" r="7"/><circle class="b d k1 dr" style="--d:1160;--tx:-9px;--ty:6px" cx="430" cy="24" r="9"/><circle class="b d k3 dr" style="--d:1220;--tx:7px;--ty:-7px" cx="850" cy="28" r="6"/></svg>
<div class="sp-text"><span class="sp-name" id="spn"></span><h2>Life</h2><span class="sp-script">thru my lens</span></div></section>
<nav id="nav"></nav><div id="drop">Drag &amp; drop photos here, or <button id="pick">Choose photos</button><input id="file" type="file" accept="image/*" multiple hidden></div>
<main id="grid"></main><section id="about"></section><footer><span id="ft"></span> · <a href="#admin" id="adm">Admin</a></footer><dialog id="login"><form id="lf" autocomplete="on"><h3>Admin login</h3><input id="pw" type="password" autocomplete="current-password" placeholder="Password" required><div><button class="pri">Log in</button> <button type="button" id="lc">Cancel</button></div><p id="le" role="alert"></p></form></dialog>
<div id="lb"><button class="x">✕</button><button class="sh">Share</button><button class="p">←</button><img alt=""><div class="fs"></div><button class="n">→</button><div class="note"></div><div class="t"></div></div><div id="msg"></div>`;
$('#cta').onclick=()=>$('#nav').scrollIntoView({behavior:'smooth'});
{const h=new Date().getHours();$('.hint').textContent=(h<5?'still up? ✦':h<12?'good morning ☀':h<18?'good afternoon ✿':'good evening ☾')}
const msg=t=>{const m=$('#msg');m.textContent=t;m.style.display='block';clearTimeout(msg.t);msg.t=setTimeout(()=>m.style.display='none',2800)};
function setPal(){const p=PAL[pal],s=document.documentElement.style;s.setProperty('--acc',p[0]);s.setProperty('--c2',p[1]);s.setProperty('--c3',p[2]);FC=p[1];try{localStorage.setItem('pal',pal)}catch(e){}}
try{pal=+localStorage.getItem('pal')||0}catch(e){}setPal();
function head(){
 let k=0;if($('#h').dataset.n!==S.name){$('#h').dataset.n=S.name;$('#h').innerHTML=S.name.split(' ').map(w=>'<span style="--i:'+(k++)+'"><i>'+[...w].map(esc).join('</i><i>')+'</i></span>').join(' ')}
 if($('#tg').dataset.t!==S.tag){$('#tg').dataset.t=S.tag;$('#tg').innerHTML=S.tag.split(' ').map((w,i)=>'<span style="--i:'+i+'">'+esc(w)+'</span>').join(' ')}document.title=S.name+' — Portfolio';
 $('#spn').textContent=S.name;
 $('#ft').textContent='© '+new Date().getFullYear()+' '+S.name+' · All photos belong to the artist';
}
function nav(){
 const I={grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
 dice:'<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.97a4 4 0 0 0 3.3-1.7l5.45-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.97a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.04a4 4 0 0 1-3.3-1.8l-.36-.45"/>',
 pal:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6 17.46 2 12 2z"/>',
 user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
 spark:'<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
 note:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 pen:'<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
 lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',check:'<path d="M20 6 9 17l-5-5"/>'},
 B=(id,ic,label,val,cls,tip)=>`<button id="${id}" class="ctl ${cls||''}" title="${tip||''}"><i class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[ic]}</svg></i><span>${val!==undefined?'<small>'+label+'</small>'+val:label}</span></button>`,
 cs=['All',...new Set(S.photos.map(p=>p.cat))];
 $('#nav').innerHTML=cs.map(c=>`<button data-c="${esc(c)}" class="tab ${c===filter?'on':''}">${esc(c)}</button>`).join('')+'<span class="sp"></span>'+
 B('md','grid','Layout',{album:'Old album',grid:'Clean grid',table:'Scatter'}[mode],'','Switch how photos are arranged')+B('rn','dice','Random photo',undefined,'','Open a random photo')+B('pl','pal','Color mood',PN[pal],'','Change the color mood')+B('ab2','user','About me',undefined,'','Go to the About section')+B('ff2','spark','Sparkles',ffOn?'On':'Off',ffOn?'on':'','Floating sparkles on or off')+B('mu','note','Music',au?'On':'Off',au?'on':'','Soft background music on or off')+
 (canEdit?B('te',edit?'check':'pen',edit?'Done editing':'Edit portfolio',undefined,'own','Add, delete or rename photos'):'')+(canEdit&&edit?B('nm','pen','Name &amp; tagline',undefined,'own')+B('lo','lock','Log out'):'');
}
$('#nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.c){filter=b.dataset.c;render()}
 else if(b.id==='md'){mode={album:'grid',grid:'table',table:'album'}[mode];render();msg({album:'Old album ✦',grid:'Clean grid',table:'Drag the photos around — play!'}[mode])}
 else if(b.id==='rn'){vis=S.photos.filter(p=>filter==='All'||p.cat===filter);if(vis.length)open(Math.floor(Math.random()*vis.length));else msg('No photos yet')}
 else if(b.id==='pl'){pal=(pal+1)%PAL.length;setPal();msg('Mood: '+PN[pal])}
 else if(b.id==='ab2')$('#about').scrollIntoView({behavior:'smooth'})
 else if(b.id==='ff2'){ffOn=!ffOn;msg(ffOn?'Sparkles on ✨':'Sparkles off');nav()}
 else if(b.id==='mu')music()
 else if(b.id==='te'){edit=!edit;render()}
 else if(b.id==='nm'){const a=prompt('Your name / brand',S.name);if(a){S.name=a;const t=prompt('Tagline',S.tag);if(t!==null)S.tag=t;saveSite().then(()=>{head();nav()})}}
 else if(b.id==='lo')logout()};
function layout(g,els){const W=g.clientWidth,cw=W<700?150:230,rh=cw*1.45,cols=Math.max(1,Math.floor(W/(cw+20))),rows=Math.ceil(els.length/cols);
 els.forEach((c,i)=>{let r=R.get(vis[i]);if(!r)R.set(vis[i],r={a:Math.random()*14-7,x:Math.random()*30-15,y:Math.random()*40-20});
  c.style.setProperty('--r',r.a+'deg');c.style.left=Math.max(4,(i%cols)*(W/cols)+(W/cols-cw)/2+r.x)+'px';c.style.top=(Math.floor(i/cols)*rh+30+r.y)+'px';c.style.width=cw+'px';const q=PS.get(vis[i]);if(q){c.style.left=q[0]*W+'px';c.style.top=q[1]+'px'}});
 g.style.setProperty('--th',Math.max(rows*rh+80,innerHeight*.8)+'px')}
const FL=['🌸','🌿','🌼','🍂'],chap=(p,i)=>mode==='album'&&filter==='All'&&(i===0||vis[i-1].cat!==p.cat)?`<div class="chap"><i class="stamp">PAGE ${++pg}</i><span>${esc(p.cat)}</span><b class="flw">${FL[pg%4]}</b></div>`:'';
function about(now){const a=S.about||{},ed=canEdit&&edit;$('#about').innerHTML=`<div class="ab"><div class="pt">${a.src?`<img src="${a.src}" alt="">`:'<span>'+(ed?'+ add portrait':'♡')+'</span>'}<b class="pc tl"></b><b class="pc br"></b></div><div class="tx"><h2>About</h2><p>${esc(a.text||'Hi, I am '+S.name+'. These are the moments I could not let go of.')}</p><svg class="sig" viewBox="0 0 420 90"><text x="6" y="64">${esc(S.name)}</text></svg>${a.email?`<a href="mailto:${esc(a.email)}">✉ Say hello</a>`:''}${ed?'<br><button id="ea">Edit about</button>':''}</div></div>`;if(now)$('#about').querySelectorAll('.ab,.sig').forEach(x=>x.classList.add('in'))}
function strip(){const n=vis.length,k=Math.min(n,7),h=Math.floor(k/2);$('.fs',lb).innerHTML=Array.from({length:k},(_,j)=>{const i=(cur-h+j+n*2)%n;return`<img data-k="${i}" src="${vis[i].thumb||vis[i].src}" class="${i===cur?'on':''}">`}).join('')}
$('#about').addEventListener('click',e=>{if(!edit)return;if(e.target.closest('.pt'))$('#pf').click();else if(e.target.id==='ea'){S.about=S.about||{};const t=prompt('A few words about you',S.about.text||'');if(t!==null)S.about.text=t;const m=prompt('Contact email (optional)',S.about.email||'');if(m!==null)S.about.email=m.trim();saveSite().then(()=>{about(1);nav()})}});
$('#pf').onchange=async e=>{const f=e.target.files[0];if(!f)return;S.about=S.about||{};try{const r=await API('/api/portrait',{method:'POST',body:JSON.stringify({data:await shrink(f,700)})});S.about.src=r.src;about(1);nav();msg('Portrait saved')}catch(er){msg(er.message)}e.target.value=''};
function render(){const m=S.photos.filter(p=>!p.o);if(m.length){Promise.all(m.map(p=>new Promise(r=>{const i=new Image();i.onload=()=>{const k=i.width/i.height;p.o=k>1.15?'l':k<.87?'p':'s';r()};i.onerror=()=>{p.o='s';r()};i.src=p.src}))).then(draw);return}draw()}
function albumLayout(g,cards){const W=g.clientWidth,cs=W<700?4:6,gap=W<700?10:16,pad=W<700?16:32,u=(W-2*pad-(cs-1)*gap)/cs,A=[-1.4,1,-.6,1.6,-1.1,.5,-1.7,.9];
 [['--cols',cs],['--u',u+'px'],['--gap',gap+'px'],['--pad',pad+'px']].forEach(a=>g.style.setProperty(a[0],a[1]));
 cards.forEach((c,i)=>{const o=vis[i].o||'s',f=cs===6&&i%7===0,z=cs===6?(f?{l:[4,3],p:[3,4],s:[3,3]}:{l:[3,2],p:[2,3],s:[2,2]})[o]:{l:[4,3],p:[2,3],s:[2,2]}[o];c.style.gridColumn='span '+z[0];c.style.gridRow='span '+z[1];c.style.setProperty('--r',A[i%8]+'deg')})}
function draw(){const old=new Map();$('#grid').querySelectorAll('.card').forEach(c=>{const p=vis[+c.dataset.i];if(p)old.set(p,c.getBoundingClientRect())});const lm=lastMode;lastMode=mode;pg=0;
 document.body.classList.toggle('edit',edit);
 vis=S.photos.filter(p=>filter==='All'||p.cat===filter);
 if(filter!=='All'&&!vis.length){filter='All';vis=S.photos;msg('That page is empty - showing everything')}
 if(mode==='album'&&filter==='All'){const o=[...new Set(vis.map(p=>p.cat))];vis=o.flatMap(c=>vis.filter(p=>p.cat===c))}
 const g=$('#grid');g.className=mode==='table'?'table':mode==='album'?'album':'';g.style.cssText='';
 g.innerHTML=vis.length?vis.map((p,i)=>`${chap(p,i)}<figure class="card" tabindex="0" data-i="${i}"${edit&&mode!=='table'?' draggable="true"':''}><img src="${p.thumb||p.src}"${p.thumb&&p.w?` srcset="${p.thumb} ${Math.round(p.w*Math.min(1,640/Math.max(p.w,p.h)))}w, ${p.src} ${p.w}w" sizes="(max-width:700px) 50vw,40vw"`:''}${p.lq?` style="background:center/cover url(${p.lq})"`:''} alt="${esc(p.title)}" loading="lazy" decoding="async" draggable="false">${i%3===1?'<u class="tp"></u>':'<b class="pc tl"></b><b class="pc tr"></b><b class="pc bl"></b><b class="pc br"></b>'}<div class="tools"><button data-a="e">Edit</button><button data-a="f" title="Move to the front">★</button><button data-a="d">Delete</button></div><figcaption class="cap">${esc(p.title)||'Untitled'}<small>${esc(p.cat)}</small></figcaption></figure>`).join(''):`<div class="empty">${canEdit?'Your gallery is empty — tap ✎ Edit, then add photos.':'Gallery coming soon…'}</div>`;
 const cards=[...g.querySelectorAll('.card')];if(mode==='table')layout(g,cards);if(mode==='album')albumLayout(g,cards);
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');const t=e.target;setTimeout(()=>t.style.transitionDelay='0ms',2600);io.unobserve(t)}}),{threshold:.05});
 cards.forEach((c,i)=>{const d=(mode==='album'?Math.min(i*140,1600):(i%5)*110)+'ms',st=c.style;st.transitionDelay=d;st.setProperty('--d',d);st.setProperty('--fx',(Math.random()<.5?-1:1)*(25+Math.random()*35)+'vw');st.setProperty('--fy',(Math.random()*50-25)+'vh');st.setProperty('--fr',(Math.random()*90-45)+'deg');io.observe(c)});
 if(mode==='album'&&lm==='album')cards.forEach((c,i)=>{const o=old.get(vis[i]);if(!o)return;c.style.transition='none';c.classList.add('in');const n=c.getBoundingClientRect(),dx=o.left-n.left,dy=o.top-n.top;requestAnimationFrame(()=>c.style.transition='');c.style.transitionDelay='0ms';if(dx||dy)c.animate([{translate:dx+'px '+dy+'px'},{translate:'0 0'}],{duration:900,easing:'cubic-bezier(.3,1.4,.5,1)'})});
 head();nav();about();g.querySelectorAll('.chap').forEach(x=>io.observe(x));document.querySelectorAll('.sig,.ab,.splash').forEach(x=>io.observe(x));
}
const g=$('#grid');
g.addEventListener('click',e=>{const c=e.target.closest('.card');if(!c)return;const i=+c.dataset.i,a=e.target.dataset.a;
 if(a==='d'){const p=vis[i],ix=S.photos.indexOf(p);API('/api/photos/'+p.id,{method:'DELETE'}).then(()=>{S.photos.splice(ix,1);render();undo(p.id)}).catch(er=>msg(er.message))}
 else if(a==='f'){const p=vis[i];S.photos=[p,...S.photos.filter(x=>x!==p)];render();saveOrder()}
 else if(a==='e'){const p=vis[i],t=prompt('Title',p.title);if(t!==null)p.title=t;const k=prompt('Category (e.g. Photography, Personal, Travel)',p.cat);if(k)p.cat=k.trim();const n=prompt('Love note / the story behind this photo (optional)',p.note||'');if(n!==null)p.note=n;API('/api/photos/'+p.id,{method:'PATCH',body:JSON.stringify({title:p.title,cat:p.cat,note:p.note||''})}).then(()=>{render();msg('Saved')}).catch(er=>{msg(er.message);load().then(render)})}
 else if(mode!=='table')open(i)});
g.addEventListener('dblclick',e=>{const c=e.target.closest('.card');if(c)burst(e.clientX,e.clientY,['❤️','💖','✨'],8)});
g.addEventListener('mousemove',e=>{if(mode==='table')return;const c=e.target.closest('.card');if(!c||!c.classList.contains('in'))return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
 const k=mode==='album'?16:9;c.style.transition='box-shadow .3s';c.style.setProperty('--lx',(x+.5)*100+'%');c.style.setProperty('--ly',(y+.5)*100+'%');c.style.transform=`perspective(800px) rotateY(${x*k}deg) rotateX(${-y*k}deg) scale(${mode==='album'?1.06:1.02})`});
g.addEventListener('mouseout',e=>{const c=e.target.closest('.card');if(c&&mode!=='table'){c.style.transition='';c.style.transform=''}});
let z=10,dg=null;
g.addEventListener('pointerdown',e=>{if(mode!=='table'||e.target.closest('button'))return;const c=e.target.closest('.card');if(!c)return;
 dg={c,x:e.clientX,y:e.clientY,l:c.offsetLeft,t:c.offsetTop,m:0};c.style.zIndex=++z;c.setPointerCapture(e.pointerId)});
g.addEventListener('pointermove',e=>{if(!dg)return;const dx=e.clientX-dg.x,dy=e.clientY-dg.y;dg.m=Math.max(dg.m,Math.abs(dx)+Math.abs(dy));if(dg.m>6)dg.c.classList.add('drag');
 dg.c.style.left=dg.l+dx+'px';dg.c.style.top=dg.t+dy+'px'});
const up=()=>{if(!dg)return;const{c,m}=dg;c.classList.remove('drag');dg=null;if(m<6)open(+c.dataset.i);else if(mode==='table')PS.set(vis[+c.dataset.i],[c.offsetLeft/g.clientWidth,c.offsetTop])};
g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);
function burst(x,y,set,n){for(let i=0;i<n;i++){const s=document.createElement('div');s.className='fx';s.textContent=set[i%set.length];s.style.left=x+'px';s.style.top=y+'px';document.body.appendChild(s);
 const a=Math.random()*6.28,d=60+Math.random()*110;s.animate([{transform:'translate(0,0) scale(.4)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-60}px) scale(1.3) rotate(${Math.random()*360}deg)`,opacity:0}],{duration:900+Math.random()*500,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>s.remove()}}

let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;const cu=$('#cur');
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;const s=document.documentElement.style;s.setProperty('--mx',mx+'px');s.setProperty('--my',my+'px');const gr=g.getBoundingClientRect();g.style.setProperty('--gx',mx-gr.left+'px');g.style.setProperty('--gy',my-gr.top+'px');
 const over=e.target.closest&&e.target.closest('.card');cu.classList.toggle('big',!!over&&!dg);cu.textContent=over?(mode==='table'?'DRAG':'VIEW'):'';
 document.querySelectorAll('#h i').forEach(l=>{const r=l.getBoundingClientRect(),dx=r.left+r.width/2-mx,dy=r.top+r.height/2-my,d=Math.hypot(dx,dy);
  l.style.transform=d<170?`translate(${dx/d*(170-d)*.5}px,${dy/d*(170-d)*.5}px) rotate(${dx*.2}deg)`:'';l.style.color=d<170?'var(--acc)':''})});

const cv=$('#ff'),cc=cv.getContext('2d'),P=[];
function ffSize(){cv.width=innerWidth;cv.height=innerHeight}ffSize();addEventListener('resize',ffSize);
for(let i=0;i<28;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:1+Math.random()*2.4,a:Math.random()*6.28,s:.2+Math.random()*.5,p:Math.random()*6.28});
if(innerWidth<700)P.length=12;
function ffLoop(t){cc.clearRect(0,0,cv.width,cv.height);if(ffOn){cc.globalCompositeOperation='lighter';
 P.forEach(f=>{f.a+=(Math.random()-.5)*.12;f.x+=Math.cos(f.a)*f.s;f.y+=Math.sin(f.a)*f.s-.15;const dx=mx-f.x,dy=my-f.y,d=Math.hypot(dx,dy)||1;if(d<220){f.x+=dx/d*.7;f.y+=dy/d*.7}
  if(f.y<-10)f.y=cv.height+10;if(f.x<-10)f.x=cv.width+10;if(f.x>cv.width+10)f.x=-10;
  const gd=cc.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r*4);gd.addColorStop(0,FC);gd.addColorStop(1,'transparent');cc.globalAlpha=.18+.22*Math.sin(t/600+f.p);cc.fillStyle=gd;cc.beginPath();cc.arc(f.x,f.y,f.r*4,0,6.28);cc.fill()})}
 requestAnimationFrame(ffLoop)}requestAnimationFrame(ffLoop);
function music(){if(au){au.pause();au=null;msg('Music off');nav();return}
  au=new Audio('/music/ambient.mp3');au.loop=true;au.volume=0.15;au.play().catch(()=>{msg('Music blocked - click to enable');au=null;nav()});msg('♪ music on');nav()}
let tw;function type(el,t){clearInterval(tw);el.textContent='';let i=0;if(!t)return;tw=setInterval(()=>{el.textContent=t.slice(0,++i);if(i>=t.length)clearInterval(tw)},40)}
g.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList.contains('card'))e.target.click()});
document.addEventListener('visibilitychange',()=>{if(au)document.hidden?au.suspend():au.resume()});
let dr=null;const saveOrder=()=>API('/api/photos/order',{method:'PUT',body:JSON.stringify({ids:S.photos.map(x=>x.id)})}).catch(e=>msg(e.message));
g.addEventListener('dragstart',e=>{const c=e.target.closest('.card');if(c&&edit){dr=vis[+c.dataset.i];e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dr.id)}});
g.addEventListener('dragover',e=>{if(dr&&e.target.closest('.card'))e.preventDefault()});
g.addEventListener('drop',e=>{const c=e.target.closest('.card');if(!dr||!c)return;e.preventDefault();const t=vis[+c.dataset.i];if(t!==dr){S.photos=S.photos.filter(x=>x!==dr);S.photos.splice(S.photos.indexOf(t),0,dr);render();saveOrder()}dr=null});
g.addEventListener('dragend',()=>dr=null);
function undo(id){const m=$('#msg');m.innerHTML='Photo deleted <button id="undo">Undo</button>';m.style.display='block';clearTimeout(msg.t);msg.t=setTimeout(()=>m.style.display='none',8000);
 $('#undo').onclick=async()=>{try{const r=await API('/api/photos/'+id+'/restore',{method:'POST'});S.photos.splice(r.index,0,r.photo);render();msg('Restored')}catch(e){msg(e.message)}}}
function closeLb(){lb.classList.remove('o');history.replaceState(null,'','/')}
function share(){const u=location.origin+'/photo/'+vis[cur].id,t=(vis[cur].title||'Photo')+' — '+S.name;if(navigator.share)navigator.share({title:t,url:u}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(u).then(()=>msg('Link copied'),()=>prompt('Copy this link',u));else prompt('Copy this link',u)}
const lb=$('#lb');
function open(i){cur=i;show();lb.classList.add('o')}
function show(){const p=vis[cur],im=$('img',lb);im.style.animation='none';im.offsetWidth;im.style.animation='';im.src=p.src;type($('.note',lb),p.note||'');strip();history.replaceState(null,'','/photo/'+p.id);$('.t',lb).textContent=(p.title||'')+(p.title?' · ':'')+p.cat;
 const t=new Image();t.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.drawImage(t,0,0,1,1);const d=x.getImageData(0,0,1,1).data;lb.style.setProperty('--lc',`rgba(${d[0]},${d[1]},${d[2]},.7)`);lb.style.background=`radial-gradient(circle at 50% 40%,rgba(${d[0]},${d[1]},${d[2]},.35),#000 75%)`}catch(e){}};t.src=p.thumb||p.src}
function step(d){cur=(cur+d+vis.length)%vis.length;show()}
lb.onclick=e=>{if(e.target===lb||e.target.classList.contains('x'))closeLb();else if(e.target.classList.contains('sh'))share();else if(e.target.classList.contains('n'))step(1);else if(e.target.classList.contains('p'))step(-1);else if(e.target.dataset.k!==undefined){cur=+e.target.dataset.k;show()}};
let sx=0;lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)step(d<0?1:-1)});
addEventListener('keydown',e=>{if(!lb.classList.contains('o'))return;if(e.key==='Escape')closeLb();if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});
async function shrink(f,mx=1700,q=.82){const b=await createImageBitmap(f),k=Math.min(1,mx/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=b.width*k;c.height=b.height*k;c.getContext('2d').drawImage(b,0,0,c.width,c.height);const w=c.toDataURL('image/webp',q);return w.startsWith('data:image/webp')?w:c.toDataURL('image/jpeg',q)}
async function add(files){let n=0;for(const f of files){if(!f.type.startsWith('image/'))continue;msg('Uploading '+(files.indexOf(f)+1)+' of '+files.length+': '+f.name);try{const im=await createImageBitmap(f),k=Math.min(1,1800/Math.max(im.width,im.height)),full=await shrink(f,1800),thumb=await shrink(f,640),lq=await shrink(f,24,.5);
  const title=PHRASES[phraseIdx%PHRASES.length];phraseIdx++;
  const r=await API('/api/photos',{method:'POST',body:JSON.stringify({full,thumb,lq,w:Math.round(im.width*k),h:Math.round(im.height*k),title,cat:filter==='All'?'Photography':filter})});S.photos.unshift(r.photo);n++}catch(e){msg(e.message||('Could not upload '+f.name))}}
  if(n){render();msg(n+' photo(s) added')}}
$('#pick').onclick=()=>$('#file').click();$('#file').onchange=e=>{add([...e.target.files]);e.target.value=''};
const dz=$('#drop');['dragover','dragenter'].forEach(v=>dz.addEventListener(v,e=>{e.preventDefault();dz.classList.add('h')}));
['dragleave','drop'].forEach(v=>dz.addEventListener(v,e=>{e.preventDefault();dz.classList.remove('h')}));dz.addEventListener('drop',e=>add([...e.dataTransfer.files]));
async function saveSite(){try{await API('/api/site',{method:'PUT',body:JSON.stringify({name:S.name,tag:S.tag,about:{text:S.about.text||'',email:S.about.email||''}})});msg('Saved')}catch(e){msg(e.message)}}
async function load(){const[s,p]=await Promise.all([API('/api/site'),API('/api/photos')]);S.name=s.name;S.tag=s.tag;S.about=s.about||{};S.photos=p.photos}
async function checkAdmin(){try{canEdit=!!(await API('/api/me')).admin}catch(e){canEdit=false}}
async function logout(){try{await API('/api/logout',{method:'POST'})}catch(e){}canEdit=false;edit=false;render();msg('Logged out')}
$('#lc').onclick=()=>$('#login').close();
$('#lf').onsubmit=async e=>{e.preventDefault();$('#le').textContent='';try{await API('/api/login',{method:'POST',body:JSON.stringify({password:$('#pw').value})});$('#pw').value='';$('#login').close();canEdit=true;edit=true;render();msg('Welcome back - edit mode on')}catch(er){$('#le').textContent=er.message}};
$('#adm').onclick=e=>{e.preventDefault();if(canEdit){edit=!edit;render()}else $('#login').showModal()};
{const env=$('#env');$('#en1').textContent=S.name;
  $('#seal').onclick=()=>{$('.en',env).classList.add('open');burst(innerWidth/2,innerHeight/2,['♥','✦','✿'],12);setTimeout(()=>env.classList.add('go'),2400);setTimeout(()=>{env.remove();},3500)}}
addEventListener('resize',()=>{const cs=[...g.querySelectorAll('.card')];if(mode==='table')layout(g,cs);if(mode==='album')albumLayout(g,cs)});
au=new Audio('/music/ambient.mp3');au.loop=true;au.volume=0.15;au.play().catch(()=>{});function resume(){au.play().catch(()=>{})}document.addEventListener('click',resume,{once:true});document.addEventListener('keydown',resume,{once:true});document.addEventListener('touchstart',resume,{once:true});
(async()=>{try{await Promise.all([load(),checkAdmin()])}catch(e){msg('Could not load the portfolio')}
  $('#en1').textContent=S.name;render();{const m=/^\/photo\/([a-f0-9]{16})$/.exec(location.pathname);if(m){const i=vis.findIndex(x=>x.id===m[1]);if(i>=0)open(i)}}if(location.hash==='#admin'&&!canEdit)$('#login').showModal()})();
})();
