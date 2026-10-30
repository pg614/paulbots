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
