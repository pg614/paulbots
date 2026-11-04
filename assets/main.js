// Scroll reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// Prefill bot from ?bot=
const p=new URLSearchParams(location.search).get('bot');const f=document.getElementById('leadform');
if(f&&p){f.bot.value=p;f.task.value=f.task.value||`I'm interested in the ${p}.`}
// Lead form: posts JSON to window.PAULBOTS_CONFIG.formEndpoint (FormSubmit AJAX)
if(f)f.addEventListener('submit',async ev=>{ev.preventDefault();const m=f.querySelector('.formmsg');
 if(!f.checkValidity()){m.textContent='Please fill in your name, business, email, task, and check the consent box.';f.reportValidity();return}
 if(f._honey.value)return; // honeypot (FormSubmit also ignores _honey)
 const ep=(window.PAULBOTS_CONFIG||{}).formEndpoint;const data=Object.fromEntries(new FormData(f));
 if(!ep||ep.startsWith('PLACEHOLDER')){console.warn('Form endpoint not connected yet',data);m.textContent='Thanks! Our online form is being connected. For the fastest reply, please call 888-772-2820.';return}
 try{const r=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
  const j=await r.json().catch(()=>({}));if(!r.ok||String(j.success)!=='true')throw 0; // FormSubmit returns "false" as a string on errors
  if(window.gtag)gtag('event','generate_lead',{form:'contact'});
  f.reset();m.className='formmsg ok';m.textContent="Thanks! We got your request and Paul will be in touch soon."}catch{m.className='formmsg err';m.textContent="Sorry, that didn't go through. Please try again, or call 888-772-2820."}});
// Hero typewriter. Only textContent of persistent spans changes; the .hw highlight span is static HTML.
(()=>{const h=document.querySelector('.typer');if(!h)return;const q=s=>h.querySelector(s);
 const W=['Everything','Sales','Service','Follow-Up','Check-Ins','Prospecting'],PRE='Stop Doing ',POST=' Yourself.';
 const l1=q('.tl .ghost').textContent,t1=q('.t1'),pre=q('.l2 .pre'),w=q('.l2 .w'),post=q('.l2 .post'),hw=q('.l2 .hw');
 const longest=W.reduce((a,b)=>b.length>a.length?b:a);q('.ghost .hw').textContent=longest; // reserve widest variant
 const caret=n=>h.querySelectorAll('.caret').forEach(c=>c.style.visibility=c.classList.contains('c'+n)?'visible':'hidden');
 const set=(a,b,c)=>{pre.textContent=a;w.textContent=b;post.textContent=c;hw.style.display=(b||h.dataset.phase==='word')?'':'none'};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){t1.textContent=l1;h.dataset.phase='word';set(PRE,W[0],POST);caret(0);h.dataset.done='1';return}
 const wait=ms=>new Promise(r=>setTimeout(r,ms));caret(1);set('','','');
 (async()=>{await wait(300);for(let i=1;i<=l1.length;i++){t1.textContent=l1.slice(0,i);await wait(52)}
  await wait(260);caret(3);for(let i=1;i<=PRE.length;i++){set(PRE.slice(0,i),'','');await wait(52)}
  caret(2);for(let i=1;i<=W[0].length;i++){set(PRE,W[0].slice(0,i),'');await wait(52)}
  caret(3);for(let i=1;i<=POST.length;i++){set(PRE,W[0],POST.slice(0,i));await wait(52)}
  h.dataset.phase='word';caret(2);h.dataset.done='1';let k=0;
  for(;;){await wait(1800);const x=W[k];for(let i=x.length;i>=0;i--){set(PRE,x.slice(0,i),POST);await wait(35)}
   k=(k+1)%W.length;const n=W[k];await wait(200);for(let i=1;i<=n.length;i++){set(PRE,n.slice(0,i),POST);await wait(55)}}})();})();
document.querySelectorAll('.themetog').forEach(function(b){b.addEventListener('click',function(){var r=document.documentElement,n=r.getAttribute('data-theme')==='light'?'dark':'light';r.setAttribute('data-theme',n);try{localStorage.setItem('pb-theme',n)}catch(e){}})});
(function(){var m=document.getElementById('orbmodal');if(!m)return;var f=m.querySelector('.orbframe'),last;
function open(e){last=e&&e.currentTarget;if(!f.firstChild){var i=document.createElement('iframe');i.src=window.PB_ORB;i.title='PaulBots AI voice demo';i.setAttribute('allow','microphone; autoplay');f.appendChild(i)}m.hidden=false;document.body.style.overflow='hidden';m.querySelector('.orbclose').focus()}
function close(){m.hidden=true;document.body.style.overflow='';f.innerHTML='';if(last)last.focus()}
document.querySelectorAll('.orbopen').forEach(function(b){b.addEventListener('click',open)});
m.querySelector('.orbclose').addEventListener('click',close);m.addEventListener('click',function(e){if(e.target===m)close()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)close()})})();
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a,button');if(!a||!window.gtag)return;var h=a.getAttribute('href')||'',t=(a.textContent||'').trim().slice(0,60);
if(h.indexOf('tel:')===0)gtag('event','click_call',{link_text:t,page:location.pathname});
else if(/orb|talk in browser|try our ai/i.test(t+' '+(a.className||'')))gtag('event','click_talk_ai',{link_text:t,page:location.pathname});
else if(/build|contact/i.test(t)||/contact\.html|#build/.test(h))gtag('event','click_contact',{link_text:t,page:location.pathname});},true);

document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.chatopen');if(!b)return;if(window.gtag)gtag('event','click_chat',{page:location.pathname});
function find(r){var x=r.querySelector('[aria-label="Open Assistant"]');if(x)return x;var all=r.querySelectorAll('*');for(var i=0;i<all.length;i++){if(all[i].shadowRoot){x=find(all[i].shadowRoot);if(x)return x}}return null}
var f=find(document);if(f)f.click();else location.href='/contact.html';});

/* Retell widget add-on: dark panel + refocus input (inspects widget's shadow DOM; safe no-op if Retell changes markup) */
(function(){
var CSS='.pbdark [class*="_innerShell_"],.pbdark [class*="_conversationPanel_"],.pbdark [class*="_messages_"]{background:#0f172a!important;color:#e2e8f0!important}'+
'.pbdark [class*="_window_"]{background:#0f172a!important;border-color:#1e293b!important;color-scheme:dark}'+
'.pbdark header{background:#111c33!important;border-bottom:1px solid #1e293b!important}'+
'.pbdark header svg path[fill="#00122E"]{fill:#e2e8f0!important}.pbdark header svg path[stroke="#00122E"]{stroke:#e2e8f0!important}.pbdark header button{color:#e2e8f0!important}'+
'.pbdark [class*="_agent_"][class*="_message_"]{background:#1e293b!important;color:#e2e8f0!important}'+
'.pbdark [class*="_user_"][class*="_message_"]{background:#2563eb!important;color:#fff!important}'+
'.pbdark [class*="_inputRow_"]{background:#0f172a!important;border-color:#1e293b!important}'+
'.pbdark [class*="_inputShell_"]{background:#1e293b!important;border-color:#334155!important}'+
'.pbdark textarea{background:transparent!important;color:#f1f5f9!important;caret-color:#93c5fd}.pbdark [class*="_inputPlaceholder_"]{color:#94a3b8!important}'+
'.pbdark [class*="_poweredBy"]{color:#94a3b8!important}.pbdark [class*="_poweredBy"] a{color:#93c5fd!important}'+
'.pbdark [class*="_drawer"],.pbdark [class*="_history"]{background:#0f172a!important;color:#e2e8f0!important}';
var fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
function isDark(){return document.documentElement.getAttribute('data-theme')!=='light'}
function roots(r,o){o=o||[];var a=r.querySelectorAll('*');for(var i=0;i<a.length;i++)if(a[i].shadowRoot){o.push(a[i].shadowRoot);roots(a[i].shadowRoot,o)}return o}
var ft;function focusSoon(sr){if(!fine)return;clearTimeout(ft);ft=setTimeout(function(){var w=sr.querySelector('[class*="_windowOpen_"]'),t=sr.querySelector('textarea');if(!w||!t||t.disabled||sr.activeElement===t)return;var ae=document.activeElement;if(ae&&ae!==document.body&&!ae.shadowRoot&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))return;t.focus({preventScroll:true})},250)}
function setup(sr){var m=sr.getElementById&&sr.getElementById('widget-mount-point');if(!m)return;
if(!sr.__pb){sr.__pb=1;var s=document.createElement('style');s.textContent=CSS;sr.appendChild(s);
new MutationObserver(function(){var mp=sr.querySelector('[class*="_messages_"]');if(mp)focusSoon(sr)}).observe(m,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled']});
sr.addEventListener('submit',function(){focusSoon(sr)},true)}
m.classList.toggle('pbdark',isDark())}
function scan(){roots(document).forEach(setup)}
var tries=0,iv=setInterval(function(){scan();if(++tries>40)clearInterval(iv)},500);
new MutationObserver(scan).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
document.addEventListener('click',function(){setTimeout(scan,300)},true);
})();

/* ===== Space background, scroll reveal, progress, parallax (Nov 4) ===== */
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,d=document,b=d.body;
// progress bar
var bar=d.createElement('div');bar.id='scrollbar';b.appendChild(bar);
// reveal + stagger
var sel='main>section,body>section:not(.hero),.ctaband .ctain';
var items=[].slice.call(d.querySelectorAll(sel)).filter(function(e){return !e.classList.contains('reveal')});
items.forEach(function(e){e.classList.add('sr')});
['.grid','.proofgrid','.capgrid','.checks','.faq','.prices','ol','.tgrid'].forEach(function(s){d.querySelectorAll(s).forEach(function(g){[].forEach.call(g.children,function(c,i){if(c.closest('.ftd'))return;c.classList.add('sr');c.style.setProperty('--d',Math.min(i,8)*0.08+'s')})})});
var counters=[].slice.call(d.querySelectorAll('.amt'));
function count(el){var m=el.textContent.match(/^(\D*)(\d+)(.*)$/);if(!m||RM)return;var to=+m[2],t0=null;function f(t){t0=t0||t;var p=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-p,3);el.textContent=m[1]+Math.round(to*e)+m[3];if(p<1)requestAnimationFrame(f);else el.textContent=m[1]+to+m[3]}requestAnimationFrame(f)}
if('IntersectionObserver' in window&&!RM){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');if(e.target.classList.contains('amt'))count(e.target);io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});d.querySelectorAll('.sr').forEach(function(e){io.observe(e)});counters.forEach(function(e){io.observe(e)})}else d.querySelectorAll('.sr').forEach(function(e){e.classList.add('in')});
// space canvas
var c=d.createElement('canvas');c.id='spacebg';c.setAttribute('aria-hidden','true');b.insertBefore(c,b.firstChild);
var x=c.getContext('2d'),W,H,DPR=Math.min(2,window.devicePixelRatio||1),stars=[],shoot=[],ship=null,last=0,run=!RM,sy=0;
function size(){W=innerWidth;H=innerHeight;c.width=W*DPR;c.height=H*DPR;x.setTransform(DPR,0,0,DPR,0,0);stars=[];var n=Math.round(W*H/9000);for(var i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H*1.6,r:Math.random()*1.1+.2,a:Math.random()*.6+.2,z:Math.random()*.5+.2,tw:Math.random()*6})}
var orbits=[{cx:.82,cy:.28,rx:220,ry:70,sp:.00012,pr:5,col:'#60a5fa',z:.15},{cx:.82,cy:.28,rx:340,ry:110,sp:-.00008,pr:3.5,col:'#c084fc',z:.15},{cx:.14,cy:.78,rx:180,ry:60,sp:.0001,pr:4,col:'#34d399',z:.25}];
function draw(t){x.clearRect(0,0,W,H);
for(var i=0;i<stars.length;i++){var s=stars[i],yy=((s.y-sy*s.z)%(H*1.6)+H*1.6)%(H*1.6);if(yy>H)continue;x.globalAlpha=s.a*(RM?1:.75+.25*Math.sin(t/900+s.tw));x.fillStyle='#e2e8f0';x.beginPath();x.arc(s.x,yy,s.r,0,6.283);x.fill()}
orbits.forEach(function(o){var cx=o.cx*W,cy=o.cy*H-sy*o.z;x.globalAlpha=.09;x.strokeStyle='#93c5fd';x.lineWidth=1;x.beginPath();x.ellipse(cx,cy,o.rx,o.ry,-.25,0,6.283);x.stroke();var a=t*o.sp,px=cx+o.rx*Math.cos(a)*Math.cos(-.25)-o.ry*Math.sin(a)*Math.sin(-.25),py=cy+o.rx*Math.cos(a)*Math.sin(-.25)+o.ry*Math.sin(a)*Math.cos(-.25);x.globalAlpha=.55;var g=x.createRadialGradient(px,py,0,px,py,o.pr*3);g.addColorStop(0,o.col);g.addColorStop(1,'transparent');x.fillStyle=g;x.beginPath();x.arc(px,py,o.pr*3,0,6.283);x.fill();x.globalAlpha=.9;x.fillStyle=o.col;x.beginPath();x.arc(px,py,o.pr,0,6.283);x.fill()});
if(!RM){if(Math.random()<.004&&shoot.length<2)shoot.push({x:Math.random()*W*.8+W*.2,y:Math.random()*H*.4,v:6+Math.random()*4,l:0});
shoot=shoot.filter(function(s){s.l+=1;s.x-=s.v;s.y+=s.v*.45;var a=Math.max(0,1-s.l/70);x.globalAlpha=a*.8;var g=x.createLinearGradient(s.x,s.y,s.x+80,s.y-36);g.addColorStop(0,'#fff');g.addColorStop(1,'transparent');x.strokeStyle=g;x.lineWidth=1.4;x.beginPath();x.moveTo(s.x,s.y);x.lineTo(s.x+80,s.y-36);x.stroke();return a>0});
if(!ship&&Math.random()<.0012)ship={x:-40,y:H*(.2+Math.random()*.5),v:.6+Math.random()*.4};
if(ship){ship.x+=ship.v;ship.y+=Math.sin(ship.x/60)*.15;x.save();x.translate(ship.x,ship.y);x.globalAlpha=.75;x.fillStyle='#cbd5e1';x.beginPath();x.moveTo(12,0);x.lineTo(-6,-5);x.lineTo(-3,0);x.lineTo(-6,5);x.closePath();x.fill();x.fillStyle='#38bdf8';x.globalAlpha=.5+.3*Math.sin(t/80);x.beginPath();x.arc(-7,0,2.4,0,6.283);x.fill();x.restore();if(ship.x>W+40)ship=null}}
x.globalAlpha=1}
var acc=0;function loop(t){if(!run)return;if(t-last>33){last=t;draw(t)}requestAnimationFrame(loop)}
size();draw(0);addEventListener('resize',function(){size();draw(performance.now())});
d.addEventListener('visibilitychange',function(){if(RM)return;run=!d.hidden;if(run)requestAnimationFrame(loop)});
if(run)requestAnimationFrame(loop);
// scroll: progress + parallax
var hero=d.querySelector('.hero .pmwrap'),tk=false;
function onS(){tk=false;var y=scrollY,h=d.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?y/h:0)+')';if(!RM){sy=y*.25;if(hero&&y<900)hero.style.transform='translateY('+(y*-.08)+'px)';if(!run)draw(performance.now())}else{sy=0}}
addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(onS)}},{passive:true});onS();
})();
