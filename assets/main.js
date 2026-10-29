// Scroll reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// Prefill bot from ?bot=
const p=new URLSearchParams(location.search).get('bot');const f=document.getElementById('leadform');
if(f&&p){f.bot.value=p;f.task.value=f.task.value||`I'm interested in the ${p}.`}
// Lead form: posts JSON to window.PAULBOTS_CONFIG.formEndpoint (placeholder until a form service is connected)
if(f)f.addEventListener('submit',async ev=>{ev.preventDefault();const m=f.querySelector('.formmsg');
 if(!f.checkValidity()){m.textContent='Please fill in your name, business, email, task, and check the consent box.';f.reportValidity();return}
 if(f.website.value)return; // honeypot
 const ep=(window.PAULBOTS_CONFIG||{}).formEndpoint;const data=Object.fromEntries(new FormData(f));
 if(!ep||ep.startsWith('PLACEHOLDER')){console.warn('Form endpoint not connected yet',data);m.textContent='Thanks! Our online form is being connected. For the fastest reply, please call 888-772-2820.';return}
 try{const r=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
  if(!r.ok)throw 0;f.reset();m.textContent="Thanks! We got your request and will be in touch soon."}catch{m.textContent='Sorry, something went wrong. Please call 888-772-2820.'}});
// Hero typewriter: line 1, then line 2 cycles its middle word(s). Full text lives in the h1 aria-label.
(()=>{const h=document.querySelector('.typer');if(!h)return;const L=[...h.querySelectorAll('.tl')].map(l=>[l.querySelector('.ghost'),l.querySelector('.typed')]);
 const W=['Everything','Sales','Service','Follow-Up','Check-Ins','Prospecting'],pre='Stop Doing ',post=' Yourself.';
 const longest=W.reduce((a,b)=>b.length>a.length?b:a);L[1][0].textContent=pre+longest+post; // reserve space for widest variant
 const[l1,e1]=[L[0][0].textContent,L[0][1]],e2=L[1][1];
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){e1.textContent=l1;e2.textContent=pre+W[0]+post;h.dataset.done='1';return}
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),cur=e=>{[e1,e2].forEach(x=>x.classList.toggle('cur',x===e))};
 (async()=>{await wait(300);cur(e1);for(let i=1;i<=l1.length;i++){e1.textContent=l1.slice(0,i);await wait(52)}
  await wait(260);cur(e2);let t=pre+W[0]+post;for(let i=1;i<=t.length;i++){e2.textContent=t.slice(0,i);await wait(52)}
  h.dataset.done='1';let k=0;
  for(;;){await wait(1800);const w=W[k];for(let i=w.length;i>=0;i--){e2.textContent=pre+w.slice(0,i)+post;await wait(35)}
   k=(k+1)%W.length;const n=W[k];await wait(200);for(let i=1;i<=n.length;i++){e2.textContent=pre+n.slice(0,i)+post;await wait(55)}}})();})();
