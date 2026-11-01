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
