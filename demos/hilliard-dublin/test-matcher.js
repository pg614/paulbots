const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync(__dirname+'/index.html','utf8');
const js=h.slice(h.indexOf("const PH="),h.indexOf("const log="))+';this.match=match;';
const ctx={};vm.runInNewContext(js,ctx);
// expect: id, or 'callback' (null fallback OR price answer that offers callback without a number)
const cases=[
['My furnace quit and it\'s 10 PM. Can someone come tonight?','emergency'],
['Do you service Plain City or Marysville?','callback'],
['Can I finance a new furnace?','financing'],
['How much does a new AC cost?','callback'],
['Are your techs licensed?','license'],
['do you do financing','financing'],
['payment plans?','financing'],
['can i finace a furnance','financing'],
['how much for a furnace','callback'],
['are you open sunday','hours'],
['NO HEAT HELP','emergency'],
['do you come to hilliard','area'],
['is your guys licenced','license'],
['what are your hours','hours'],
['do you have a maintenance plan','maint'],
['ac not working','emergency'],
['whats the weather like on mars','callback'],
];
let fail=0;for(const[q,want]of cases){const m=ctx.match(q);const got=m?m.id:'callback';
 const ok=got===want||(want==='callback'&&got==='price');
 if(!ok)fail++;console.log((ok?'PASS':'FAIL')+'  '+q+'  -> '+got+(ok?'':' (want '+want+')'));}
console.log(`${cases.length-fail}/${cases.length} passed`);process.exit(fail?1:0);
