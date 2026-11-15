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
 if(!ep||ep.startsWith('PLACEHOLDER')){console.warn('Form endpoint not connected yet',data);m.textContent='Thanks! Our online form is being connected. For the fastest reply, please call 888-618-9599.';return}
 try{const r=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
  const j=await r.json().catch(()=>({}));if(!r.ok||String(j.success)!=='true')throw 0; // FormSubmit returns "false" as a string on errors
  if(window.gtag)gtag('event','generate_lead',{form:'contact'});
  f.reset();m.className='formmsg ok';m.textContent="Thanks! We got your request and Paul will be in touch soon."}catch{m.className='formmsg err';m.textContent="Sorry, that didn't go through. Please try again, or call 888-618-9599."}});
// Hero typewriter. Types one full headline, pauses, deletes it, then the other, and loops.
// Ghost text reserves the wider line so the layout does not jump. The highlight stays on the key word.
(()=>{const h=document.querySelector('.typer');if(!h)return;const q=s=>h.querySelector(s);
 const phrases=[{l1:'Turn more leads',word:'customers'},{l1:'Turn more visitors',word:'leads'}];
 const PRE='into ',POST='.',TYPE=48,DEL=28,PAUSE=2000;
 const t1=q('.t1'),pre=q('.l2 .pre'),w=q('.l2 .w'),post=q('.l2 .post'),hw=q('.l2 .hw');
 const caret=n=>h.querySelectorAll('.caret').forEach(c=>c.style.visibility=c.classList.contains('c'+n)?'visible':'hidden');
 const set=(a,b,c)=>{pre.textContent=a;w.textContent=b;post.textContent=c;hw.style.display=b?'':'none'};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){t1.textContent=phrases[0].l1;h.dataset.phase='word';set(PRE,phrases[0].word,POST);caret(0);h.dataset.done='1';return}
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 async function typePhrase(p){
  caret(1);set('','','');t1.textContent='';
  for(let i=1;i<=p.l1.length;i++){t1.textContent=p.l1.slice(0,i);await wait(TYPE)}
  await wait(160);caret(3);
  for(let i=1;i<=PRE.length;i++){set(PRE.slice(0,i),'','');await wait(TYPE)}
  caret(2);
  for(let i=1;i<=p.word.length;i++){set(PRE,p.word.slice(0,i),'');await wait(TYPE)}
  caret(3);
  for(let i=1;i<=POST.length;i++){set(PRE,p.word,POST.slice(0,i));await wait(TYPE)}
  h.dataset.phase='word';caret(3);
 }
 async function deletePhrase(p){
  h.dataset.phase='';caret(3);
  for(let i=POST.length;i>=0;i--){set(PRE,p.word,POST.slice(0,i));await wait(DEL)}
  caret(2);
  for(let i=p.word.length;i>=0;i--){set(PRE,p.word.slice(0,i),'');await wait(DEL)}
  caret(3);hw.style.display='none';
  for(let i=PRE.length;i>=0;i--){set(PRE.slice(0,i),'','');await wait(DEL)}
  caret(1);
  for(let i=p.l1.length;i>=0;i--){t1.textContent=p.l1.slice(0,i);await wait(DEL)}
 }
 caret(1);set('','','');
 (async()=>{await wait(280);let k=0;for(;;){const p=phrases[k];await typePhrase(p);await wait(PAUSE);await deletePhrase(p);k=(k+1)%phrases.length;await wait(180)}})();
})();
document.querySelectorAll('.themetog').forEach(function(b){b.addEventListener('click',function(){var r=document.documentElement,n=r.getAttribute('data-theme')==='light'?'dark':'light';r.setAttribute('data-theme',n);try{localStorage.setItem('pb-theme',n)}catch(e){}})});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a,button');if(!a||!window.gtag)return;var h=a.getAttribute('href')||'',t=(a.textContent||'').trim().slice(0,60);
if(h.indexOf('tel:')===0)gtag('event','click_call',{link_text:t,page:location.pathname});
else if(/orb|talk in browser|try our ai/i.test(t+' '+(a.className||'')))gtag('event','click_talk_ai',{link_text:t,page:location.pathname});
else if(/build|contact/i.test(t)||/contact\.html|#build/.test(h))gtag('event','click_contact',{link_text:t,page:location.pathname});},true);
/* PaulBots assistant: text chat and in-browser voice.
   The browser asks /api/xai-session for a short-lived token, then opens the
   realtime WebSocket itself. The API key never comes to the page. */
(function(){
var STYLE=''
+'.pb-aria{position:fixed;right:16px;bottom:16px;z-index:35;display:inline-flex;align-items:center;gap:8px;max-width:calc(100% - 32px);background:#2563eb;color:#fff;font:600 15px/1 Inter,system-ui,sans-serif;padding:14px 18px;border:0;border-radius:999px;box-shadow:0 10px 24px rgba(37,99,235,.35);cursor:pointer}'
+'.pb-aria svg{display:block;flex:none}.pb-aria[hidden]{display:none!important}'
+'@media(max-width:640px){.pb-aria{transition:opacity .25s}body.pb-heroin .pb-aria{opacity:0;visibility:hidden;pointer-events:none}}'
+'@media(prefers-reduced-motion:reduce){.pb-aria{transition:none}}'
+'.pb-panel,.pb-voicebox{position:fixed;z-index:80;display:flex;flex-direction:column;background:#0f172a;color:#e2e8f0;border:1px solid #1e293b;border-radius:18px;box-shadow:0 24px 60px rgba(2,6,23,.45);overflow:hidden}'
+'.pb-panel{right:16px;bottom:84px;width:min(380px,calc(100% - 32px));height:min(560px,calc(100dvh - 120px))}'
+'.pb-panel[hidden],.pb-voice[hidden]{display:none!important}'
+'.pb-voice{position:fixed;inset:0;z-index:90;background:rgba(2,6,23,.72);display:flex;align-items:flex-end;justify-content:center;padding:12px}'
+'.pb-voicebox{position:relative;width:min(420px,100%);max-height:min(560px,calc(100dvh - 24px))}'
+'.pb-hd{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:12px 14px;background:#111c33;border-bottom:1px solid #1e293b}'
+'.pb-hd b{font-size:15px}.pb-hd .sp{flex:1}'
+'.pb-x{background:none;border:0;color:#e2e8f0;font-size:26px;line-height:1;cursor:pointer;padding:0 4px}'
+'.pb-log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}'
+'.pb-msg{max-width:88%;padding:10px 12px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;line-height:1.45}'
+'.pb-msg.user{align-self:flex-end;background:#2563eb;color:#fff}'
+'.pb-msg.bot{align-self:flex-start;background:#1e293b;color:#e2e8f0}'
+'.pb-row{display:flex;gap:8px;padding:10px;border-top:1px solid #1e293b;align-items:flex-end}'
+'.pb-row textarea{flex:1;min-width:0;resize:none;height:44px;max-height:120px;border-radius:12px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font:16px/1.4 Inter,system-ui,sans-serif;padding:10px 12px}'
+'.pb-send,.pb-talk,.pb-hang{border:0;border-radius:12px;cursor:pointer;font:600 14px/1 Inter,system-ui,sans-serif;color:#fff}'
+'.pb-send{background:#2563eb;padding:0 14px;height:44px}'
+'.pb-talk{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#2563eb;padding:12px 16px;border-radius:999px}'
+'.pb-hang{background:#dc2626;padding:12px 16px;border-radius:999px}'
+'.pb-talk[disabled],.pb-send[disabled],.pb-hang[disabled]{opacity:.6;cursor:default}'
+'.pb-talk[hidden],.pb-hang[hidden]{display:none!important}'
+'.pb-tools{display:flex;gap:8px;padding:0 12px 12px;flex-wrap:wrap}'
+'.pb-vbody{padding:8px 16px 18px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}'
+'.pb-status{margin:0;font-weight:700}.pb-status.live{color:#86efac}.pb-status.bad{color:#fecaca}'
+'.pb-cap{margin:0;min-height:1.4em;color:#cbd5e1;font-size:14px;overflow-wrap:anywhere}'
+'.pb-note{margin:0;color:#94a3b8;font-size:13px}'
+'.pb-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.2);vertical-align:-1px}'
+'html[data-theme=light] .pb-panel,html[data-theme=light] .pb-voicebox{background:#fff;color:#0f172a;border-color:#e2e8f0}'
+'html[data-theme=light] .pb-hd{background:#f8fafc;border-color:#e2e8f0}'
+'html[data-theme=light] .pb-x{color:#0f172a}'
+'html[data-theme=light] .pb-msg.bot{background:#f1f5f9;color:#0f172a}'
+'html[data-theme=light] .pb-row{border-color:#e2e8f0}'
+'html[data-theme=light] .pb-row textarea{background:#fff;color:#0f172a;border-color:#cbd5e1}'
+'html[data-theme=light] .pb-cap{color:#334155}html[data-theme=light] .pb-note{color:#64748b}'
+'@media(max-width:640px){.pb-panel{left:8px;right:8px;width:auto;bottom:76px}}';
var st=document.createElement('style');st.textContent=STYLE;document.head.appendChild(st);

function el(tag, cls, text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function b64(bytes){var s='',i,n=0x8000;for(i=0;i<bytes.length;i+=n)s+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+n,bytes.length)));return btoa(s)}
function unb64(data){var bin=atob(data),out=new Uint8Array(bin.length),i;for(i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
function pcm16(f32){var out=new Int16Array(f32.length),i,s;for(i=0;i<f32.length;i++){s=Math.max(-1,Math.min(1,f32[i]));out[i]=s<0?s*0x8000:s*0x7fff}return out}
function down(input, from, to){if(!from||from===to)return input;var ratio=from/to,len=Math.floor(input.length/ratio),out=new Float32Array(len),i,idx,a,b,f;for(i=0;i<len;i++){idx=i*ratio;a=Math.floor(idx);b=Math.min(a+1,input.length-1);f=idx-a;out[i]=input[a]*(1-f)+input[b]*f}return out}

var chat, voice, log, input, sendBtn, talkBtn, hangBtn, statusEl, capEl;
var chatSocket, voiceSocket, history=[], textFallback=false, assistantEl=null, toolLeft=0, textWait=null, doneTimer=null;
var audioCtx, micStream, processor, playTime=0, sources=[], voiceState='ready', conversationId='', voiceGen=0;

function pill(){return document.getElementById('pb-aria')}
function setPill(show){var b=pill();if(b)b.hidden=!show}

function buildChat(){
  chat=el('section','pb-panel');chat.hidden=true;chat.setAttribute('role','dialog');chat.setAttribute('aria-label','Chat with us');
  var hd=el('div','pb-hd');hd.appendChild(el('b','','Chat with us'));var sp=el('span','sp');hd.appendChild(sp);
  var talk=el('button','pb-talk','Talk to us');talk.type='button';talk.addEventListener('click',function(){openVoice()});hd.appendChild(talk);
  var x=el('button','pb-x','×');x.type='button';x.setAttribute('aria-label','Close chat');x.addEventListener('click',closeChat);hd.appendChild(x);
  log=el('div','pb-log');log.setAttribute('role','log');log.setAttribute('aria-live','polite');
  var row=el('form','pb-row');row.addEventListener('submit',function(e){e.preventDefault();submitChat()});
  input=document.createElement('textarea');input.rows=1;input.placeholder='Type a message';input.setAttribute('aria-label','Message');input.maxLength=4000;
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitChat()}});
  sendBtn=el('button','pb-send','Send');sendBtn.type='submit';
  row.appendChild(input);row.appendChild(sendBtn);
  chat.appendChild(hd);chat.appendChild(log);chat.appendChild(row);
  document.body.appendChild(chat);
}
function buildVoice(){
  voice=el('div','pb-voice');voice.hidden=true;voice.setAttribute('role','dialog');voice.setAttribute('aria-modal','true');voice.setAttribute('aria-label','Talk to us');
  var box=el('div','pb-voicebox');
  var hd=el('div','pb-hd');hd.appendChild(el('b','','Talk to us'));var sp=el('span','sp');hd.appendChild(sp);
  var x=el('button','pb-x','×');x.type='button';x.setAttribute('aria-label','Close');x.addEventListener('click',function(){hangup(true)});hd.appendChild(x);
  var body=el('div','pb-vbody');
  statusEl=el('p','pb-status','Ready');statusEl.setAttribute('role','status');
  capEl=el('p','pb-cap','');
  talkBtn=el('button','pb-talk','Talk to us');talkBtn.type='button';talkBtn.addEventListener('click',startVoice);
  hangBtn=el('button','pb-hang','Hang up');hangBtn.type='button';hangBtn.hidden=true;hangBtn.addEventListener('click',function(){hangup(false)});
  body.appendChild(statusEl);body.appendChild(capEl);body.appendChild(talkBtn);body.appendChild(hangBtn);
  body.appendChild(el('p','pb-note','Your browser will ask for the microphone. This is a demo, so please don’t share sensitive information. Or call 888-618-9599.'));
  box.appendChild(hd);box.appendChild(body);voice.appendChild(box);
  voice.addEventListener('click',function(e){if(e.target===voice)hangup(true)});
  document.body.appendChild(voice);
}
function setVoice(state, message){
  voiceState=state;
  statusEl.className='pb-status'+(state==='live'?' live':(state==='error'?' bad':''));
  statusEl.textContent='';
  if(state==='live'){var d=el('span','pb-dot');d.setAttribute('aria-hidden','true');statusEl.appendChild(d);statusEl.appendChild(document.createTextNode(' '+(message||'Live')))}
  else statusEl.textContent=message||(state==='connecting'?'Connecting…':state==='ended'?'Call ended':'Ready');
  talkBtn.hidden=state==='connecting'||state==='live';
  talkBtn.disabled=state==='connecting';
  hangBtn.hidden=state!=='connecting'&&state!=='live';
}

function addMsg(role, text){var n=el('div','pb-msg '+(role==='user'?'user':'bot'),text);log.appendChild(n);log.scrollTop=log.scrollHeight;return n}
function openChat(){chat.hidden=false;setPill(false);input.focus()}
function closeChat(){chat.hidden=true;setPill(true)}
function openVoice(){voice.hidden=false;document.body.style.overflow='hidden';if(voiceState==='ready'||voiceState==='ended'||voiceState==='error')setVoice('ready','Ready')}
function closeVoice(){voice.hidden=true;document.body.style.overflow='';setPill(chat.hidden)}

async function session(){
  var r=await fetch('/api/xai-session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  var j=await r.json().catch(function(){return {}});
  if(!r.ok||!j.token)throw new Error(j.error||'Could not start the assistant.');
  return j;
}
function socketUrl(cfg){var u=cfg.ws_url;if(conversationId)u+=(u.indexOf('?')>=0?'&':'?')+'conversation_id='+encodeURIComponent(conversationId);return u}
function connect(cfg, onEvent){
  return new Promise(function(resolve,reject){
    var ws,sent=false,settled=false;
    try{ws=new WebSocket(socketUrl(cfg),['xai-client-secret.'+cfg.token])}catch(e){reject(e);return}
    var timer=setTimeout(function(){if(!settled){settled=true;try{ws.close()}catch(err){}reject(new Error('The assistant took too long to connect.'))}},8000);
    ws.onopen=function(){sent=true;ws.send(JSON.stringify({type:'session.update',session:sessionBody(cfg,cfg.__mode)}))};
    ws.onmessage=function(ev){
      if(typeof ev.data!=='string')return;
      var e;try{e=JSON.parse(ev.data)}catch(err){return}
      if(e.type==='conversation.created'&&e.conversation&&e.conversation.id)conversationId=e.conversation.id;
      if(!settled&&sent&&e.type==='session.updated'){clearTimeout(timer);settled=true;resolve(ws)}
      if(!settled&&e.type==='error'){clearTimeout(timer);settled=true;reject(new Error((e.error&&(e.error.message||e.error.type))||'The assistant rejected the session.'));return}
      if(settled&&onEvent)onEvent(e);
    };
    ws.onerror=function(){if(!settled){clearTimeout(timer);settled=true;reject(new Error('Could not connect.'))}};
  });
}
function sessionBody(cfg, mode){
  var body={
    voice:cfg.voice||'ara',
    instructions:cfg.instructions,
    tools:cfg.tools||[],
    turn_detection:mode==='voice'?{type:'server_vad'}:null,
    audio:{
      input:{format:{type:'audio/pcm',rate:24000}},
      output:{format:{type:'audio/pcm',rate:24000}}
    }
  };
  if(mode==='voice')body.audio.input.transcription={model:'grok-transcribe',keyterms:['PaulBots','Paul-BAWTs']};
  return body;
}

function ensureAssistant(){if(!assistantEl)assistantEl=addMsg('bot','');return assistantEl}
function appendText(delta){if(!delta)return;var n=ensureAssistant();n.textContent+=delta;log.scrollTop=log.scrollHeight}
function handleEvent(e, mode){
  if(!e||!e.type)return;
  if(e.type==='conversation.created'&&e.conversation&&e.conversation.id)conversationId=e.conversation.id;
  if(e.type==='response.created'){if(mode==='text')assistantEl=addMsg('bot','')}
  if(e.type==='response.text.delta'||e.type==='response.output_text.delta')appendText(e.delta||e.text||'');
  if(e.type==='response.output_audio_transcript.delta'||e.type==='response.audio_transcript.delta'){
    if(mode==='text')appendText(e.delta||'');
    else if(capEl)capEl.textContent=(capEl.textContent+' '+(e.delta||'')).trim().slice(-280);
  }
  if(e.type==='response.output_audio.delta'||e.type==='response.audio.delta'){if(mode==='voice')playPcm(e.delta||e.audio)}
  if(e.type==='input_audio_buffer.speech_started'&&mode==='voice')stopPlayback();
  if(e.type==='conversation.item.input_audio_transcription.completed'&&mode==='voice'&&e.transcript&&capEl)capEl.textContent=e.transcript;
  if(e.type==='response.function_call_arguments.done'){clearTimeout(doneTimer);onTool(e, mode)}
  if(e.type==='response.done'&&mode==='text'){
    clearTimeout(doneTimer);
    doneTimer=setTimeout(function(){
      if(toolLeft>0)return;
      if(assistantEl&&!assistantEl.textContent)assistantEl.textContent='I could not get a text reply. Please try again, or call 888-618-9599.';
      if(textWait){var done=textWait;textWait=null;done()}
    },450);
  }
  if(e.type==='error'){
    var msg=(e.error&&(e.error.message||e.error.type))||'Something went wrong.';
    if(mode==='text'){textFallback=true;if(textWait){var finish=textWait;textWait=null;finish()}}
    if(mode==='voice'&&(voiceState==='connecting'||voiceState==='live'))setVoice('error',String(msg));
  }
}
async function onTool(e, mode){
  toolLeft++;
  var args=e.arguments;
  if(typeof args==='string'){try{args=JSON.parse(args||'{}')}catch(err){args={}}}
  var result;
  try{
    if(e.name==='submit_lead'){
      var r=await fetch('/api/xai-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args||{})});
      result=await r.json().catch(function(){return {ok:false}});
      if(result&&result.clientFallback){
        var ep=(window.PAULBOTS_CONFIG||{}).formEndpoint;
        if(!ep)result={ok:false,error:'The lead form is not connected. Ask them to call 888-618-9599.'};
        else{
          var fr=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({name:args.name,business:args.business||'',email:args.email,phone:args.phone||'',business_type:args.business_type||'',task:args.task,consent:'yes',bot:'PaulBots website assistant',_subject:'New PaulBots lead',_template:'table'})});
          var fj=await fr.json().catch(function(){return {}});
          result=fr.ok&&String(fj.success)==='true'?{ok:true}:{ok:false,error:'The lead form did not accept the request.'};
        }
      }
    }else result={ok:false,error:'That action is not available.'};
  }catch(err){result={ok:false,error:'Could not save the request.'}}
  var ws=mode==='voice'?voiceSocket:chatSocket;
  if(ws&&ws.readyState===1){
    ws.send(JSON.stringify({type:'conversation.item.create',item:{type:'function_call_output',call_id:e.call_id||e.item_id,output:JSON.stringify(result)}}));
    toolLeft--;
    if(toolLeft<=0){
      toolLeft=0;
      var again={type:'response.create'};
      if(mode==='text'&&!textFallback)again.response={modalities:['text']};
      ws.send(JSON.stringify(again));
    }
  }else toolLeft=Math.max(0,toolLeft-1);
}

async function chatReply(text){
  history.push({role:'user',content:text});
  addMsg('user',text);
  sendBtn.disabled=true;
  try{
    if(!textFallback){
      if(!chatSocket||chatSocket.readyState!==1){
        var cfg=await session();
        chatSocket=await connect(Object.assign({__mode:'text'},cfg), function(e){handleEvent(e,'text')});
      }
      assistantEl=null;
      var wait=new Promise(function(resolve){textWait=resolve});
      chatSocket.send(JSON.stringify({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text:text}]}}));
      chatSocket.send(JSON.stringify({type:'response.create',response:{modalities:['text']}}));
      var timed=new Promise(function(resolve){setTimeout(function(){textFallback=true;resolve()},20000)});
      await Promise.race([wait,timed]);
      if(textFallback)await fallbackReply();
      else history.push({role:'assistant',content:assistantEl?assistantEl.textContent:''});
    }else await fallbackReply();
  }catch(err){
    if(!textFallback){
      textFallback=true;
      try{await fallbackReply()}catch(e2){addMsg('bot',(e2&&e2.message)||(err&&err.message)||'The assistant is unavailable. Please call 888-618-9599.')}
    }else addMsg('bot',(err&&err.message)||'The assistant is unavailable. Please call 888-618-9599.');
  }finally{sendBtn.disabled=false}
}
async function fallbackReply(){
  if(assistantEl&&!assistantEl.textContent)assistantEl.remove();
  assistantEl=addMsg('bot','');
  var r=await fetch('/api/xai-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history})});
  if(!r.ok){var j=await r.json().catch(function(){return {}});throw new Error(j.error||'The assistant could not reply.')}
  var reader=r.body&&r.body.getReader?r.body.getReader():null;
  if(!reader){var all=await r.text();applySse(all);return}
  var decoder=new TextDecoder(),buf='';
  while(true){
    var step=await reader.read();
    if(step.done)break;
    buf+=decoder.decode(step.value,{stream:true});
    var lines=buf.split('\n');buf=lines.pop()||'';
    for(var i=0;i<lines.length;i++)consumeSse(lines[i]);
  }
  if(buf)consumeSse(buf);
  history.push({role:'assistant',content:assistantEl.textContent});
}
function consumeSse(line){
  var t=line.trim();if(t.indexOf('data:')!==0)return;var raw=t.slice(5).trim();if(!raw)return;
  var e;try{e=JSON.parse(raw)}catch(err){return}
  if(e.delta)appendText(e.delta);
  if(e.error)throw new Error(e.error);
}
function applySse(text){text.split('\n').forEach(consumeSse);history.push({role:'assistant',content:assistantEl.textContent})}
function submitChat(){var text=(input.value||'').trim();if(!text||sendBtn.disabled)return;input.value='';chatReply(text)}

function playPcm(data){
  if(!data||!audioCtx)return;
  var bytes=unb64(data),pcm=new Int16Array(bytes.buffer,bytes.byteOffset,Math.floor(bytes.byteLength/2));
  var buf=audioCtx.createBuffer(1,pcm.length,24000),ch=buf.getChannelData(0),i;
  for(i=0;i<pcm.length;i++)ch[i]=pcm[i]/32768;
  var node=audioCtx.createBufferSource();node.buffer=buf;node.connect(audioCtx.destination);
  var now=audioCtx.currentTime;if(playTime<now)playTime=now+0.02;
  node.start(playTime);playTime+=buf.duration;sources.push(node);
  node.onended=function(){var n=sources.indexOf(node);if(n>=0)sources.splice(n,1)};
}
function stopPlayback(){sources.forEach(function(n){try{n.stop()}catch(e){}});sources=[];playTime=0}

async function startVoice(){
  if(voiceState==='connecting'||voiceState==='live')return;
  var gen=++voiceGen;
  setVoice('connecting','Connecting…');capEl.textContent='';
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    var resumeP=audioCtx.resume();
    var micP=navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    var cfgP=session();
    await Promise.race([resumeP, new Promise(function(r){setTimeout(r,800)})]);
    if(gen!==voiceGen){micP.then(function(s){s.getTracks().forEach(function(t){t.stop()})}).catch(function(){});return}
    var cfg=await cfgP;
    voiceSocket=await connect(Object.assign({__mode:'voice'},cfg), function(e){handleEvent(e,'voice')});
    voiceSocket.onclose=function(){if(voiceState==='live'||voiceState==='connecting')setVoice('ended','Call ended');stopMic()};
    micStream=await micP;
    var source=audioCtx.createMediaStreamSource(micStream);
    processor=audioCtx.createScriptProcessor(4096,1,1);
    var mute=audioCtx.createGain();mute.gain.value=0;
    processor.onaudioprocess=function(ev){
      if(!voiceSocket||voiceSocket.readyState!==1||voiceState!=='live')return;
      if(audioCtx.currentTime<playTime)return;
      var samples=down(ev.inputBuffer.getChannelData(0),audioCtx.sampleRate,24000);
      voiceSocket.send(JSON.stringify({type:'input_audio_buffer.append',audio:b64(new Uint8Array(pcm16(samples).buffer))}));
    };
    source.connect(processor);processor.connect(mute);mute.connect(audioCtx.destination);
    if(gen!==voiceGen){stopMic();return}
    setVoice('live','Live');
  }catch(err){
    if(gen!==voiceGen)return;
    stopMic();if(voiceSocket){try{voiceSocket.close()}catch(e){}}
    setVoice('error',(err&&err.message)||'The microphone or the assistant is unavailable.');
  }
}
function stopMic(){if(processor){try{processor.disconnect()}catch(e){}}processor=null;if(micStream){micStream.getTracks().forEach(function(t){t.stop()});micStream=null}stopPlayback()}
function hangup(close){voiceGen++;stopMic();if(voiceSocket){try{voiceSocket.close()}catch(e){}}voiceSocket=null;if(voiceState==='live'||voiceState==='connecting')setVoice('ended','Call ended');if(close)closeVoice()}

buildChat();buildVoice();
document.addEventListener('click',function(e){
  var chatBtn=e.target.closest&&e.target.closest('.chatopen');
  if(chatBtn){e.preventDefault();if(window.gtag)gtag('event','click_chat',{page:location.pathname});openChat();return}
  var voiceBtn=e.target.closest&&e.target.closest('.orbopen');
  if(voiceBtn){e.preventDefault();openVoice()}
});
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(voice&&!voice.hidden)hangup(true);else if(chat&&!chat.hidden)closeChat()});
var watch=document.querySelector('.hbtns,.cbus-actions,.demobtns');
if(watch&&'IntersectionObserver' in window){
  new IntersectionObserver(function(entries){document.body.classList.toggle('pb-heroin',entries[0].isIntersecting)},{rootMargin:'0px 0px -10px 0px'}).observe(watch);
}
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
['.grid','.proofgrid','.capgrid','.checks','.faq','.prices','ol','.tgrid'].forEach(function(s){d.querySelectorAll(s).forEach(function(g){if(g.closest('.trainpkgs'))return;[].forEach.call(g.children,function(c,i){if(c.closest('.ftd')||c.closest('.trainpkgs'))return;c.classList.add('sr');c.style.setProperty('--d',Math.min(i,8)*0.08+'s')})})});
function skipCount(el){return !el||el.closest('.trainpkgs')||el.hasAttribute('data-static')||/,/.test(el.textContent)}
var counters=[].slice.call(d.querySelectorAll('.amt')).filter(function(e){return !skipCount(e)});
function count(el){if(skipCount(el))return;var m=el.textContent.match(/^(\D*)(\d+)(.*)$/);if(!m||RM)return;var to=+m[2],t0=null;function f(t){t0=t0||t;var p=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-p,3);el.textContent=m[1]+Math.round(to*e)+m[3];if(p<1)requestAnimationFrame(f);else el.textContent=m[1]+to+m[3]}requestAnimationFrame(f)}
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
/* ===== Light-mode sky (draft) ===== */
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,d=document,b=d.body,R=d.documentElement;
var c=d.createElement('canvas');c.id='skybg';c.setAttribute('aria-hidden','true');b.insertBefore(c,b.firstChild);
var x=c.getContext('2d'),W,H,DPR=Math.min(2,window.devicePixelRatio||1),clouds=[],birds=[],sy=0,last=0;
function light(){return R.getAttribute('data-theme')==='light'}
function mk(i){var w=180+Math.random()*320;return{x:Math.random()*(W+w)-w,y:Math.random()*H*1.5,w:w,h:w*(.22+Math.random()*.12),v:.06+Math.random()*.12,a:.35+Math.random()*.3,z:.1+Math.random()*.35}}
function size(){W=innerWidth;H=innerHeight;c.width=W*DPR;c.height=H*DPR;x.setTransform(DPR,0,0,DPR,0,0);clouds=[];var n=Math.max(5,Math.round(W/170));for(var i=0;i<n;i++)clouds.push(mk(i))}
function cloud(k,y){var g=x.createLinearGradient(0,y-k.h,0,y+k.h*.6);g.addColorStop(0,'rgba(255,255,255,'+k.a+')');g.addColorStop(1,'rgba(219,234,254,'+k.a*.35+')');x.fillStyle=g;x.beginPath();
x.ellipse(k.x+k.w*.5,y,k.w*.5,k.h*.38,0,0,6.283);x.ellipse(k.x+k.w*.36,y-k.h*.28,k.w*.22,k.h*.42,0,0,6.283);x.ellipse(k.x+k.w*.62,y-k.h*.34,k.w*.26,k.h*.5,0,0,6.283);x.fill()}
function bird(o,t){var f=Math.sin(t/180+o.ph)*o.s*.45;x.strokeStyle='rgba(30,58,95,'+o.a+')';x.lineWidth=1.3;x.lineCap='round';x.beginPath();x.moveTo(o.x-o.s,o.y-f);x.quadraticCurveTo(o.x-o.s*.4,o.y-o.s*.35-f*.3,o.x,o.y);x.quadraticCurveTo(o.x+o.s*.4,o.y-o.s*.35-f*.3,o.x+o.s,o.y-f);x.stroke()}
function draw(t){x.clearRect(0,0,W,H);if(!light())return;
var sx=W*.8,sY=H*.16-sy*.1,g=x.createRadialGradient(sx,sY,0,sx,sY,Math.max(W,H)*.45);g.addColorStop(0,'rgba(255,251,235,.95)');g.addColorStop(.06,'rgba(254,243,199,.55)');g.addColorStop(.25,'rgba(186,230,253,.25)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
clouds.forEach(function(k){if(!RM){k.x+=k.v;if(k.x>W+20){k.x=-k.w-20;k.y=Math.random()*H*1.5}}var y=((k.y-sy*k.z)%(H*1.5)+H*1.5)%(H*1.5);if(y<H+k.h)cloud(k,y)});
if(!RM){if(birds.length===0&&Math.random()<.002){var n=2+Math.floor(Math.random()*3),y0=H*(.12+Math.random()*.35),dir=1;for(var i=0;i<n;i++)birds.push({x:-30-i*26,y:y0+i*(i%2?10:-6),s:5+Math.random()*3,v:.9+Math.random()*.2,a:.35+Math.random()*.2,ph:Math.random()*6})}
birds=birds.filter(function(o){o.x+=o.v;o.y+=Math.sin(o.x/90)*.12;bird(o,t);return o.x<W+40})}}
size();var run=!RM;function loop(t){if(!run)return;if(t-last>33){last=t;draw(t)}requestAnimationFrame(loop)}
draw(0);addEventListener('resize',function(){size();draw(performance.now())});
new MutationObserver(function(){draw(performance.now())}).observe(R,{attributes:true,attributeFilter:['data-theme']});
d.addEventListener('visibilitychange',function(){if(RM)return;run=!d.hidden;if(run)requestAnimationFrame(loop)});
addEventListener('scroll',function(){sy=RM?0:scrollY*.25;if(RM)draw(0)},{passive:true});
if(run)requestAnimationFrame(loop);
})();
