const STORAGE='cq-trip-web-v4-draft';
const DB='cq-trip-attachments-v4', STORE='files';

const HOT=['shanghai','beijing','guangzhou','shenzhen','hong_kong','macao','chengdu','hangzhou','wuhan','xian','changsha','nanjing','zhengzhou','kunming'];
const CITY_GROUPS={
 A:['macao'],B:['baoding','baotou','beihai','beijing'],C:['changchun','changsha','changzhou','chengdu','chongqing'],
 D:['dali','dalian','dongguan','dunhuang'],F:['foshan','fuzhou'],G:['guangzhou','guilin','guiyang'],
 H:['harbin','haikou','hangzhou','hefei','huangshan','hohhot','huizhou'],J:['jiaxing','jinan','jinhua','jiujiang'],
 K:['kunming'],L:['lanzhou','lhasa','lijiang','luoyang'],N:['nanchang','nanjing','nanning','ningbo'],
 Q:['qingdao','quanzhou'],S:['sanya','shanghai','shaoxing','shenyang','shenzhen','shijiazhuang','suzhou'],
 T:['taizhou','taiyuan','tianjin'],W:['wenzhou','wuhan','urumqi','wuxi'],
 X:['xiamen','xian','hong_kong','xining','xuzhou'],Y:['yangzhou','yantai','yichang','yinchuan'],
 Z:['zhangjiajie','zhanjiang','zhengzhou','zhongshan','zhuhai']
};
const COMMON_PLACES=['hongyadong','jiefangbei','shibati','shancheng_trail','liziba','eling_factory','ciqikou','yangtze_cableway','nanshan_yikeshu','guanyinqiao','longmenhao','three_gorges_museum','chongqing_zoo'];

function fresh(){
  return {
    schema_version:'chongqing_trip_order_v4',
    order_id:(crypto.randomUUID?crypto.randomUUID():'order-'+Date.now()),
    created_at:new Date().toISOString(),
    trip:{destination:'chongqing',origin:'',start_date:'',end_date:'',first_day_window:'',last_day_window:''},
    party:{type:'',size:null,family_members:[],child_ages:''},
    known:{hotel:false,inbound:false,outbound:false,user_places:false,fixed_event:false},
    answered:{known:false,must_places:false,dietary:false,hard_rules:false},
    hotel:{coverage:'none',manual_note:'',stay_style:'',budget_per_room:'',prefs:[],pref_other:''},
    transport:{inbound_manual:'',outbound_manual:''},
    event:{manual_note:''},
    places:{quick:[],pasted:'',must:[]},
    driving:{mode:''},
    schedule:{usual_start:'',earliest_start:'',usual_return:'',latest_return:''},
    mobility:{usual_steps:'',hard_steps:'',stairs:''},
    local_transport:{taxi_cap:undefined},
    food:{meal_budget:'',meal_max:undefined,queue:'',dietary:[],dietary_other:'',smoke_rule:''},
    interests:{},
    hard_rules:[],
    note:'',
    attachments:{hotel:[],inbound:[],outbound:[],event:[]},
    submitted:false
  };
}
function load(){
  try{
    const x=JSON.parse(localStorage.getItem(STORAGE));
    if(x?.schema_version==='chongqing_trip_order_v4')return migrateDraft(x);
  }catch(e){}
  return fresh();
}

let P=load();
let currentId;try{currentId=localStorage.getItem(STORAGE+'-step')||'origin'}catch{currentId='origin'}
let calendarCursor=P.trip.start_date?new Date(P.trip.start_date+'T00:00:00'):new Date();
// Presentation state is deliberately separate from the compatible V4 schema.
let showCityDirectory=false;
const manualSections=new Set();

const card=document.getElementById('card');
const bottom=document.getElementById('bottom');
const back=document.getElementById('back');
const next=document.getElementById('next');
const stageNav=document.getElementById('stageNav');
const questionNav=document.getElementById('questionNav');

function save(){
  const status=document.getElementById('saveState');
  const retry=document.getElementById('retrySave');
  status.textContent=tr('save.saving');retry.hidden=true;
  try{
    localStorage.setItem(STORAGE,JSON.stringify(P));
    localStorage.setItem(STORAGE+'-step',currentId);
    status.textContent=tr('save.saved');
    return true;
  }catch(error){
    status.textContent=tr('save.failed');retry.hidden=false;
    return false;
  }
}
document.getElementById('retrySave').onclick=save;
function esc(s){
  return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\x22/g,'&quot;');
}
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),1100);
}
function allCities(){const s=new Set(HOT);Object.values(CITY_GROUPS).forEach(a=>a.forEach(c=>s.add(c)));return [...s]}
function isDayTrip(){return !!P.trip.start_date&&P.trip.start_date===P.trip.end_date}
function needLodging(){return !isDayTrip() && (!P.known.hotel || P.hotel.coverage==='partial')}
function hasBookedMaterials(){return (P.known.hotel&&!isDayTrip())||P.known.inbound||P.known.outbound||P.known.fixed_event}
function needsTravelBounds(){return !P.known.inbound||!P.known.outbound}
function fullTimeDriving(){return ['self','rental'].includes(P.driving.mode)}

function steps(){
  const S=[
    {id:'origin',stage:'basic',title:tr('question.origin.title'),help:tr('question.origin.help')},
    {id:'dates',stage:'basic',title:tr('question.dates.title'),help:tr('question.dates.help')},
    {id:'party_type',stage:'basic',title:tr('question.party.title')}
  ];
  if(P.party.type && P.party.type!=='solo')S.push({id:'party_details',stage:'basic',title:tr('question.party_details.title')});
  S.push({id:'known',stage:'bookings',title:tr('question.known.title'),help:tr('question.known.help')});
  if(hasBookedMaterials())S.push({id:'materials',stage:'bookings',title:tr('question.materials.title')});
  if(needsTravelBounds())S.push({id:'travel_bounds',stage:'bookings',title:tr('question.travel_bounds.title')});
  if(P.known.user_places){
    S.push({id:'places',stage:'bookings',title:tr('question.places.title')});
    S.push({id:'must_places',stage:'bookings',title:tr('question.must_places.title')});
  }
  if(needLodging()){
    S.push({id:'stay_style',stage:'lodging',title:tr('question.stay_style.title')});
    S.push({id:'hotel_budget',stage:'lodging',title:tr('question.hotel_budget.title')});
  }
  S.push(
    {id:'driving',stage:'transport',title:tr('question.driving.title')},
    {id:'day_start',stage:'transport',title:tr('question.day_start.title')},
    {id:'day_end',stage:'transport',title:tr('question.day_end.title')},
    {id:'mobility',stage:'transport',title:tr('question.mobility.title')},
  );
  if(!fullTimeDriving())S.push({id:'taxi',stage:'transport',title:tr('question.taxi.title')});
  S.push(
    {id:'food_budget',stage:'food',title:tr('question.food_budget.title')},
    {id:'food_rules',stage:'food',title:tr('question.food_rules.title')},
    {id:'interests',stage:'preferences',title:tr('question.interests.title'),help:tr('question.interests.help')},
    {id:'hard_rules',stage:'preferences',title:tr('question.hard_rules.title')},
    {id:'review',stage:'review',title:tr('question.review.title')}
  );
  return S;
}
function stepIndex(){
  const S=steps();let i=S.findIndex(x=>x.id===currentId);
  if(i<0){i=0;currentId=S[0].id}
  return [S,i];
}
function stageGroups(){
  const out=[];
  for(const q of steps()){
    let g=out.find(x=>x.stage===q.stage);
    if(!g){g={stage:q.stage,ids:[]};out.push(g)}
    g.ids.push(q.id);
  }
  return out;
}
function shortQuestionLabel(id){
  return ({
    origin:tr('question.origin.short'),dates:tr('question.dates.short'),party_type:tr('question.party_type.short'),party_details:tr('question.party_details.short'),
    known:tr('question.known.short'),materials:tr('question.materials.short'),travel_bounds:tr('question.travel_bounds.short'),places:tr('question.places.short'),must_places:tr('question.must_places.short'),
    stay_style:tr('question.stay_style.short'),hotel_budget:tr('question.hotel_budget.short'),
    driving:tr('question.driving.short'),day_start:tr('question.day_start.short'),day_end:tr('question.day_end.short'),mobility:tr('question.mobility.short'),taxi:tr('question.taxi.short'),
    food_budget:tr('question.food_budget.short'),food_rules:tr('question.food_rules.short'),
    interests:tr('question.interests.short'),hard_rules:tr('question.hard_rules.short'),review:tr('question.review.short')
  })[id]||id;
}
function stageState(g){
  const vals=g.ids.filter(id=>id!=='review').map(id=>complete(id));
  if(!vals.length)return currentId==='review'?'current':'';
  const n=vals.filter(Boolean).length;
  if(n===vals.length)return'done';
  if(n>0)return'partial';
  return'';
}
function renderStageNav(){
  const groups=stageGroups(),current=steps().find(x=>x.id===currentId)?.stage;
  stageNav.innerHTML=groups.map(g=>`<button class="stageJump ${g.stage===current?'current':stageState(g)}" aria-current="${g.stage===current?'step':'false'}" data-stage="${esc(g.stage)}">${esc(tr('nav.'+g.stage))}</button>`).join('');
  stageNav.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{
    const g=groups.find(x=>x.stage===b.dataset.stage);if(g)go(g.ids[0]);
  });
  stageNav.querySelector('.stageJump.current')?.scrollIntoView({behavior:'instant',block:'nearest',inline:'center'});
}
function renderQuestionNav(){
  const S=steps(),current=S.find(x=>x.id===currentId),groups=stageGroups();
  const group=groups.find(g=>g.stage===current?.stage)||groups[0];
  if(!group){questionNav.innerHTML='';return}
  const items=group.ids.map(qid=>{
    const q=S.find(x=>x.id===qid);
    const done=qid==='review'?validate().length===0:complete(qid);
    const cls=[qid===currentId?'current':'',done?'done':''].filter(Boolean).join(' ');
    return `<button class="qjump ${cls}" aria-current="${qid===currentId?'step':'false'}" data-qid="${esc(qid)}" title="${esc(q.title)}">
      <span>${esc(shortQuestionLabel(qid))}</span><span class="qjumpDone" aria-hidden="true">${done?'✓':''}</span>
    </button>`;
  }).join('');
  questionNav.innerHTML=`<div class="qitemsWrap">${items}</div>`;
  questionNav.querySelectorAll('[data-qid]').forEach(b=>b.onclick=()=>go(b.dataset.qid));
  questionNav.querySelector('.qjump.current')?.scrollIntoView({behavior:'instant',block:'nearest',inline:'center'});
}
function go(id){
  currentId=id;save();render();window.scrollTo({top:0,behavior:'instant'});card.querySelector('h1')?.focus({preventScroll:true});
}
function goDelta(d){
  const [S,i]=stepIndex();go(S[Math.max(0,Math.min(S.length-1,i+d))].id);
}
function autoNext(){
  if(!complete(currentId))return;
  const [S,i]=stepIndex();if(i<S.length-1)go(S[i+1].id);
}
function selectedPlaceNames(){
  const pasted=(P.places.pasted||'').split(/[\n,，、;；]+/).map(x=>placeKey(x.trim())).filter(Boolean);
  return [...new Set([...(P.places.quick||[]),...pasted])];
}
function ymd(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function hmToMin(v,late=false){
  if(!v||v==='open')return null;
  const [h,m]=v.split(':').map(Number);let n=h*60+m;
  if(late&&h<=3)n+=1440;
  return n;
}
function minToHm(n){
  n=((n%1440)+1440)%1440;
  return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
}
function valLabel(x){return x===undefined||x===null||x===''?tr('common.unfilled'):(I18N[locale]['value.'+x]!==undefined?tr('value.'+x):String(x))}
function cityDynamicHtml(kw=''){
  kw=(kw||'').trim();let groups={};
  const cities=allCities().filter(c=>!kw||cityLabel(c).toLocaleLowerCase(locale).includes(kw.toLocaleLowerCase(locale)));
  if(locale==='en'){
    cities.sort((a,b)=>cityLabel(a).localeCompare(cityLabel(b),'en')).forEach(c=>{const letter=cityLabel(c)[0].toUpperCase();(groups[letter]??=[]).push(c)});
  }else Object.keys(CITY_GROUPS).sort().forEach(letter=>{const matches=CITY_GROUPS[letter].filter(c=>cities.includes(c));if(matches.length)groups[letter]=matches});
  return `${kw&&!allCities().some(c=>cityLabel(c).toLocaleLowerCase(locale)===kw.toLocaleLowerCase(locale))?`<button class="customCityBtn" id="customCity">${esc(tr('city_search.use'))}${esc(kw)}”</button>`:''}
  <div class="cityAlphaTitle">${kw?tr('city_search.search_results'):tr('city_search.all_cities_regions_a_z')}</div>
  ${Object.keys(groups).length?Object.keys(groups).map(l=>`<div class="citySection"><h4>${l}</h4><div class="cityGrid">${groups[l].map(c=>`<button class="cityBtn ${P.trip.origin===c?'sel':''}" data-city="${esc(c)}">${esc(cityLabel(c))}</button>`).join('')}</div></div>`).join(''):`<div class="sectionHint">${esc(tr('city_search.no_matching_city_you_can_use_the_name'))}</div>`}`;
}
function renderOrigin(){
  return `<div class="cityPanel">
    <input class="citySearch" id="originSearch" value="${esc(P.origin_search||'')}" placeholder="${esc(tr('question.origin.search_cities_regions_e_g_chengdu_hong_kong'))}" autocomplete="off">
    <div class="cityHotTitle">${esc(tr('question.origin.popular_cities_regions'))}</div>
    <div class="cityHot">${HOT.map(c=>`<button class="chip ${P.trip.origin===c?'sel':''}" data-city="${esc(c)}">${esc(cityLabel(c))}</button>`).join('')}</div>
    ${P.trip.origin?`<div class="currentCity">${esc(tr('question.origin.selected_route',{city:cityLabel(P.trip.origin)}))}</div>`:''}
    <button class="textAction" id="allCities" aria-expanded="${showCityDirectory}" aria-controls="cityDynamic">${showCityDirectory?tr('question.origin.hide_all_cities_regions'):tr('question.origin.view_all_cities_regions')}</button>
    <div id="cityDynamic">${P.origin_search?.trim()||showCityDirectory?cityDynamicHtml(P.origin_search||''):''}</div>
  </div>`;
}
function renderDates(){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),start=(first.getDay()+6)%7,last=new Date(y,m+1,0).getDate();
  let cells=[];for(let i=0;i<start;i++)cells.push('<span></span>');
  for(let d=1;d<=last;d++){
    const s=ymd(new Date(y,m,d));
    const inr=P.trip.start_date&&P.trip.end_date&&s>=P.trip.start_date&&s<=P.trip.end_date;
    const sel=s===P.trip.start_date||s===P.trip.end_date;
    cells.push(`<button class="day ${inr?'inrange':''} ${sel?'sel':''}" aria-label="${formatDate(s)}" aria-pressed="${sel}" data-date="${s}">${d}</button>`);
  }
  return `<div class="calHead"><button id="prevMonth" aria-label="${esc(tr('question.dates.previous_month'))}">‹</button><b>${new Intl.DateTimeFormat(locale,{year:'numeric',month:'long'}).format(first)}</b><button id="nextMonth" aria-label="${esc(tr('question.dates.next_month'))}">›</button></div>
  <div class="calendar"><div class="week">${Array.from({length:7},(_,i)=>`<span>${new Intl.DateTimeFormat(locale,{weekday:'short'}).format(new Date(2026,0,5+i))}</span>`).join('')}</div><div class="days">${cells.join('')}</div></div>
  <div class="rangeText">${P.trip.start_date?`${esc(tr('question.dates.start'))}<b>${formatDate(P.trip.start_date)}</b>`:tr('question.dates.choose_your_first_day')}${P.trip.end_date?`　${esc(tr('question.dates.end'))}<b>${formatDate(P.trip.end_date)}</b>`:''}</div>
  ${isDayTrip()?`<div class="infoLine">${esc(tr('question.dates.this_is_a_day_trip_so_we_will'))}</div>`:''}`;
}
function renderPartyType(){
  const v=P.party.type;
  return `<div class="options">
    ${ChoiceCard(tr('value.solo'),'',v==='solo','solo')}
    ${ChoiceCard(tr('value.couple'),'',v==='couple','couple')}
    ${ChoiceCard(tr('value.friends'),'',v==='friends','friends')}
    ${ChoiceCard(tr('value.family'),'',v==='family','family')}
    ${ChoiceCard(tr('value.colleagues'),'',v==='colleagues','colleagues')}
    ${ChoiceCard(tr('common.other'),'',v==='other','other')}
  </div>`;
}
function renderPartyDetails(){
  const n=P.party.size;
  const basic=[2,3,4,5,6,7,8].map(x=>`<button class="inlineChoice ${n===x?'sel':''}" data-party-size="${x}">${x} ${esc(tr('question.party_details.people'))}</button>`).join('');
  const more=Number(n)>=9;
  return `<div class="subblock">
    <div class="subhead">${esc(tr('question.party_details.how_many_people_are_traveling'))}</div>
    <div class="inlineChoices">${basic}<button class="inlineChoice ${more?'sel':''}" data-party-size="more">${esc(tr('question.party_details.9_or_more_people'))}</button></div>
    ${more?`<div class="field compactField"><div class="label">${esc(tr('question.party_details.exact_number_of_people'))}</div><input class="input" id="partyExact" type="number" min="9" value="${n||''}" placeholder="${esc(tr('question.party_details.for_example_10'))}"></div>`:''}
  </div>
  ${P.party.type==='family'?`<div class="familyPanel">
    <div class="subhead">${esc(tr('question.party_details.who_is_in_your_family_group'))}</div>
    <div class="chips">${['child','elder','sibling','other_family'].map(x=>`<button class="chip ${P.party.family_members.includes(x)?'sel':''}" data-family="${esc(x)}">${esc(tr('family.'+x))}</button>`).join('')}</div>
    ${P.party.family_members.includes('child')?`<div class="field"><div class="label">${esc(tr('question.party_details.how_old_are_the_children'))}</div><input class="input" id="childAges" value="${esc(P.party.child_ages)}" placeholder="${esc(tr('question.party_details.for_example_5_9'))}"></div>`:''}
  </div>`:''}`;
}
function renderKnown(){
  const k=P.known,none=P.answered.known&&!k.hotel&&!k.inbound&&!k.outbound&&!k.user_places&&!k.fixed_event;
  return `<div class="options">
    ${isDayTrip()?'':ChoiceCard(tr('question.known.hotel'),'',k.hotel,'hotel',true)}
    ${ChoiceCard(tr('question.known.travel_to_chongqing'),tr('question.known.flights_high_speed_rail_trains_etc'),k.inbound,'inbound',true)}
    ${ChoiceCard(tr('question.known.travel_from_chongqing'),tr('question.known.flights_high_speed_rail_trains_etc'),k.outbound,'outbound',true)}
    ${ChoiceCard(tr('question.known.places_you_already_want_to_visit'),'',k.user_places,'user_places',true)}
    ${ChoiceCard(tr('question.known.fixed_plans_or_reservations'),tr('question.known.shows_appointments_meals_with_friends_etc'),k.fixed_event,'fixed_event',true)}
    ${ChoiceCard(tr('question.known.nothing_yet'),'',none,'none',true)}
  </div>`;
}
function attachmentSection(cat,title,manual,placeholder,extra=''){
  const meta=P.attachments[cat]||[];
  return `<div class="uploadGroup">
    <div class="uploadGroupTitle"><b>${title}</b><span>${meta.length?esc(tr('upload.count',{n:meta.length})):''}</span></div>
    <label class="smallUpload">${esc(tr('upload.upload_screenshot'))}<input class="fileInput" data-cat="${cat}" type="file" multiple accept="image/jpeg,image/png,image/webp"></label>
    <div class="files">${meta.map(x=>`<div class="fileRow"><img class="thumbnail" data-thumbnail="${esc(x.id)}" alt="${esc(tr('upload.preview',{name:title}))}" width="56" height="56"><span class="fileMeta"><b>${esc(x.name)}</b><small>${Math.ceil(x.size/1024)} KB</small></span><button class="remove" data-remove-file="${esc(x.id)}" data-cat="${cat}" aria-label="${esc(tr('upload.delete',{name:x.name}))}">${esc(tr('upload.delete_action'))}</button></div>`).join('')}</div>
    <details class="disclosure" data-manual-section="${cat}" ${manual||manualSections.has(cat)?'open':''}><summary>${esc(tr('upload.no_screenshot_enter_the_details_instead'))}</summary><div class="field"><label class="label">${esc(tr('upload.details',{name:title}))}</label><textarea class="area" data-manual="${cat}" placeholder="${esc(placeholder)}">${esc(manual||'')}</textarea></div></details>
    ${extra}
  </div>`;
}
function renderMaterials(){
  let out=`<div class="privacy">${esc(tr('question.materials.you_can_hide_order_numbers_phone_numbers_and'))}</div>`;
  if(P.known.hotel&&!isDayTrip()){
    out+=attachmentSection('hotel',tr('question.known.hotel'),P.hotel.manual_note,tr('question.materials.for_example_ji_hotel_chongqing_jiefangbei_oct_2'),
      `<div class="subblock"><div class="subhead">${esc(tr('question.materials.do_these_hotel_bookings_cover_your_whole_trip'))}</div>
      <div class="inlineChoices">
        <button class="inlineChoice ${P.hotel.coverage==='all'?'sel':''}" data-coverage="all">${esc(tr('value.all'))}</button>
        <button class="inlineChoice ${P.hotel.coverage==='partial'?'sel':''}" data-coverage="partial">${esc(tr('value.partial'))}</button>
      </div></div>`);
  }
  if(P.known.inbound)out+=attachmentSection('inbound',tr('question.known.travel_to_chongqing'),P.transport.inbound_manual,tr('question.materials.for_example_oct_2_14_06_shanghai_south'));
  if(P.known.outbound)out+=attachmentSection('outbound',tr('question.known.travel_from_chongqing'),P.transport.outbound_manual,tr('question.materials.for_example_oct_5_19_35_chongqing_jiangbei'));
  if(P.known.fixed_event)out+=attachmentSection('event',tr('question.materials.fixed_plans_reservations'),P.event.manual_note,tr('question.materials.for_example_oct_3_19_30_a_show'));
  return out;
}
function renderTravelBounds(){
  const win=[[tr('value.morning'),'morning'],[tr('value.noon'),'noon'],[tr('value.afternoon'),'afternoon'],[tr('value.evening'),'evening'],[tr('value.night'),'night'],[tr('value.undecided'),'undecided']];
  let out='';
  if(!P.known.inbound){
    out+=`<div class="subblock"><div class="subhead">${esc(tr('question.travel_bounds.about_when_can_you_start_sightseeing_on_the'))}</div>
    <div class="inlineChoices">${win.map(([t,v])=>`<button class="inlineChoice ${P.trip.first_day_window===v?'sel':''}" data-first-window="${v}">${t}</button>`).join('')}</div></div>`;
  }
  if(!P.known.outbound){
    out+=`<div class="subblock"><div class="subhead">${esc(tr('question.travel_bounds.about_when_do_you_need_to_finish_on'))}</div>
    <div class="inlineChoices">${win.map(([t,v])=>`<button class="inlineChoice ${P.trip.last_day_window===v?'sel':''}" data-last-window="${v}">${t}</button>`).join('')}</div></div>`;
  }
  return out;
}
function renderPlaces(){
  return `<div class="chips">${COMMON_PLACES.map(p=>`<button class="chip ${P.places.quick.includes(p)?'sel':''}" data-place="${esc(p)}">${esc(placeLabel(p))}</button>`).join('')}</div>
  <div class="field"><div class="label">${esc(tr('question.places.any_other_saved_places_paste_them_here'))}</div>
  <textarea class="area" id="placesPaste" placeholder="${esc(tr('question.places.for_example_baixiangju_beicang_creative_park_chongqing_zoo'))}">${esc(P.places.pasted)}</textarea></div>`;
}
function renderMust(){
  const names=selectedPlaceNames();
  if(!names.length)return `<div class="infoLine">${esc(tr('question.must.add_places_on_the_previous_page_or_deselect'))}</div>`;
  const none=P.answered.must_places&&P.places.must.length===0;
  return `<div class="options">${names.map(n=>ChoiceCard(placeLabel(n),'',P.places.must.includes(n),n,true)).join('')}
  ${ChoiceCard(tr('question.must.none_you_can_choose_based_on_the_route'),'',none,'__none__',true)}</div>`;
}
function stayOptions(){
  const n=Number(P.party.size||1);
  if(n<=1)return [[tr('value.single'),'single'],[tr('value.flex'),'flex']];
  if(n===2)return [[tr('value.king'),'king'],[tr('value.twin'),'twin'],[tr('value.flex'),'flex']];
  if(n===3)return [[tr('value.one3'),'one3'],[tr('value.two'),'two'],[tr('value.flex'),'flex']];
  if(n===4)return [[tr('rooms.2_standard_rooms'),'two'],[tr('value.one4'),'one4'],[tr('value.flex'),'flex']];
  return [[tr('value.fewer'),'fewer'],[tr('value.roomy'),'roomy'],[tr('value.flex'),'flex']];
}
function renderStayStyle(){
  return `<div class="options">${stayOptions().map(([t,v])=>ChoiceCard(t,'',P.hotel.stay_style===v,v)).join('')}</div>
  <div class="infoLine">${esc(tr('question.stay_style.we_will_check_how_many_guests_each_room'))}</div>`;
}
function renderHotelBudget(){
  const v=P.hotel.budget_per_room;
  const prefs=['near_metro','quiet','bathtub','view','laundry','parking','none','other'];
  return `<div class="subblock">
    <div class="subhead">${esc(tr('question.hotel_budget.about_how_much_would_you_like_to_spend'))}</div>
    <div class="options priceOptions">
      ${ChoiceCard(tr('question.hotel_budget.up_to_300'),'',''+v==='≤300','≤300')}
      ${ChoiceCard('¥300–500','',''+v==='300-500','300-500')}
      ${ChoiceCard('¥500–800','',''+v==='500-800','500-800')}
      ${ChoiceCard('¥800–1200','',''+v==='800-1200','800-1200')}
      ${ChoiceCard('¥1200–1800','',''+v==='1200-1800','1200-1800')}
      ${ChoiceCard(tr('question.hotel_budget.over_1800'),'',''+v==='1800+','1800+')}
      ${ChoiceCard(tr('value.unsure'),'',''+v==='unsure','unsure')}
    </div>
    <div class="infoLine">${esc(tr('question.hotel_budget.for_groups_we_will_also_compare_the_total'))}</div>
  </div>
  <div class="subblock">
    <div class="subhead">${esc(tr('question.hotel_budget.anything_else_that_matters_for_your_hotel'))}</div>
    <div class="subhelp">${esc(tr('question.hotel_budget.optional_select_all_that_apply'))}</div>
    <div class="chips">${prefs.map(x=>`<button class="chip ${P.hotel.prefs.includes(x)?'sel':''}" data-hotel-pref="${esc(x)}">${esc(tr('hotel.'+x))}</button>`).join('')}</div>
    ${P.hotel.prefs.includes('other')?`<div class="field compactField"><input class="input" id="hotelPrefOther" value="${esc(P.hotel.pref_other)}" placeholder="${esc(tr('question.hotel_budget.other_hotel_preferences'))}"></div>`:''}
  </div>`;
}
function renderDriving(){
  const v=P.driving.mode;
  return `<div class="options">
    ${ChoiceCard(tr('question.driving.no'),tr('question.driving.mainly_walking_metro_buses_and_taxis'),v==='none','none')}
    ${ChoiceCard(tr('value.self'),tr('question.driving.also_driving_during_the_trip'),v==='self','self')}
    ${ChoiceCard(tr('value.rental'),'',v==='rental','rental')}
    ${ChoiceCard(tr('value.partial_drive'),'',v==='partial_drive','partial_drive')}
    ${ChoiceCard(tr('value.undecided'),'',v==='undecided','undecided')}
  </div>`;
}
function startSpecialOptions(){
  if(!P.schedule.usual_start)return [];
  const normal=hmToMin(P.schedule.usual_start);
  const start=Math.max(6*60,normal-180);
  const out=[];
  for(let n=start;n<=normal;n+=60)out.push(minToHm(n));
  if(out[out.length-1]!==P.schedule.usual_start)out.push(P.schedule.usual_start);
  return [...new Set(out)];
}
function renderDayStart(){
  const normal=P.schedule.usual_start;
  return `<div class="subblock"><div class="subhead">${esc(tr('question.day_start.what_time_would_you_normally_like_to_start'))}</div>
    <div class="inlineChoices">${['07:00','08:00','09:00','10:00','11:00','12:00'].map(t=>`<button class="inlineChoice ${normal===t?'sel':''}" data-usual-start="${t}">${t==='12:00'?tr('question.day_start.midday_or_later'):t}</button>`).join('')}</div>
  </div>
  ${normal?`<div class="subblock"><div class="subhead">${esc(tr('question.day_start.for_something_really_worthwhile_how_early_could_you'))}</div>
    <div class="inlineChoices">${startSpecialOptions().map(t=>`<button class="inlineChoice ${P.schedule.earliest_start===t?'sel':''}" data-earliest-start="${t}">${t}${t===normal?tr('question.day_start.same_as_usual'):''}</button>`).join('')}</div>
  </div>`:''}`;
}
function returnSpecialOptions(){
  if(!P.schedule.usual_return)return [];
  const normal=hmToMin(P.schedule.usual_return,true);
  const vals=[];for(let n=normal;n<=normal+180;n+=60)vals.push(minToHm(n));
  return vals;
}
function renderDayEnd(){
  const normal=P.schedule.usual_return;
  return `<div class="subblock"><div class="subhead">${esc(tr('question.day_end.what_time_would_you_normally_like_to_be'))}</div>
    <div class="inlineChoices">${['20:00','21:00','22:00','23:00','00:00'].map(t=>`<button class="inlineChoice ${normal===t?'sel':''}" data-usual-return="${t}">${t==='00:00'?tr('question.day_end.midnight_or_later'):t}</button>`).join('')}</div>
  </div>
  ${normal?`<div class="subblock"><div class="subhead">${esc(tr('question.day_end.if_the_day_is_really_worthwhile_how_late'))}</div>
    <div class="inlineChoices">${returnSpecialOptions().map(t=>`<button class="inlineChoice ${P.schedule.latest_return===t?'sel':''}" data-latest-return="${t}">${t}${t===normal?tr('question.day_start.same_as_usual'):''}</button>`).join('')}
    <button class="inlineChoice ${P.schedule.latest_return==='open'?'sel':''}" data-latest-return="open">${esc(tr('question.day_end.no_fixed_limit'))}</button></div>
  </div>`:''}`;
}
function hardStepOptions(){
  const map={'≤6000':6000,'6000-10000':10000,'10000-15000':15000,'15000-20000':20000,'20000+':20000};
  const min=map[P.mobility.usual_steps]||0;
  return [6000,10000,15000,20000,25000].filter(x=>x>=min);
}
function renderMobility(){
  const usual=P.mobility.usual_steps;
  return `<div class="infoLine">${esc(tr('question.mobility.answer_for_the_person_in_your_group_who'))}</div>
  <div class="subblock"><div class="subhead">${esc(tr('question.mobility.for_your_group_how_much_walking_feels_comfortable'))}</div>
    <div class="options">
      ${ChoiceCard(tr('question.mobility.up_to_6_000_steps'),'',usual==='≤6000','≤6000')}
      ${ChoiceCard(tr('question.mobility.6_000_10_000_steps'),'',usual==='6000-10000','6000-10000')}
      ${ChoiceCard(tr('question.mobility.10_000_15_000_steps'),'',usual==='10000-15000','10000-15000')}
      ${ChoiceCard(tr('question.mobility.15_000_20_000_steps'),'',usual==='15000-20000','15000-20000')}
      ${ChoiceCard(tr('question.mobility.over_20_000_steps_is_fine'),'',usual==='20000+','20000+')}
    </div>
  </div>
  ${usual?`<div class="subblock"><div class="subhead">${esc(tr('question.mobility.on_a_busy_day_what_is_the_maximum'))}</div>
    <div class="inlineChoices">${hardStepOptions().map(x=>`<button class="inlineChoice ${String(P.mobility.hard_steps)===String(x)?'sel':''}" data-hard-steps="${x}">${x===25000?tr('question.mobility.25_000_steps_or_more'):x+tr('question.mobility.steps')}</button>`).join('')}</div>
  </div>`:''}
  <div class="subblock"><div class="subhead">${esc(tr('question.mobility.how_comfortable_is_your_group_with_hills_and'))}</div>
    <div class="options">
      ${ChoiceCard(tr('value.easy'),'',P.mobility.stairs==='easy','easy')}
      ${ChoiceCard(tr('value.some'),'',P.mobility.stairs==='some','some')}
      ${ChoiceCard(tr('value.less'),'',P.mobility.stairs==='less','less')}
      ${ChoiceCard(tr('value.avoid'),'',P.mobility.stairs==='avoid','avoid')}
    </div>
  </div>`;
}
function renderTaxi(){
  const v=P.local_transport.taxi_cap;
  return `<div class="options">
    ${ChoiceCard(tr('question.taxi.0_prefer_public_transport'),'',v===0,'0')}
    ${ChoiceCard('¥20','',String(v)==='20','20')}
    ${ChoiceCard('¥40','',String(v)==='40','40')}
    ${ChoiceCard('¥60','',String(v)==='60','60')}
    ${ChoiceCard('¥100','',String(v)==='100','100')}
    ${ChoiceCard('¥150','',String(v)==='150','150')}
    ${ChoiceCard(tr('question.taxi.no_fixed_limit_saving_time_matters_more'),'',v==='open','open')}
  </div><div class="infoLine">${esc(tr('question.taxi.this_is_the_extra_cost_for_your_whole'))}</div>`;
}
function mealMaxOptions(){
  const min={'≤30':100,'30-60':100,'60-100':100,'100-150':150,'150-300':300,'300+':500}[P.food.meal_budget]||100;
  return [100,150,200,300,500].filter(x=>x>=min);
}
function renderFoodBudget(){
  const v=P.food.meal_budget;
  return `<div class="subblock"><div class="subhead">${esc(tr('question.food_budget.about_how_much_would_you_normally_spend_per'))}</div>
    <div class="options">
      ${ChoiceCard(tr('question.food_budget.up_to_30'),tr('question.food_budget.noodles_snacks_or_a_simple_meal'),v==='≤30','≤30')}
      ${ChoiceCard('¥30–60',tr('question.food_budget.casual_meals_and_local_restaurants'),v==='30-60','30-60')}
      ${ChoiceCard('¥60–100',tr('question.food_budget.many_hotpot_places_local_dishes_and_everyday_meals'),v==='60-100','60-100')}
      ${ChoiceCard('¥100–150',tr('question.food_budget.more_focus_on_atmosphere_location_or_ingredients'),v==='100-150','100-150')}
      ${ChoiceCard('¥150–300',tr('question.food_budget.more_focus_on_ingredients_atmosphere_or_something_special'),v==='150-300','150-300')}
      ${ChoiceCard(tr('question.food_budget.over_300'),tr('question.food_budget.fine_dining_or_a_special_food_experience'),v==='300+','300+')}
    </div>
  </div>
  ${v?`<div class="subblock"><div class="subhead">${esc(tr('question.food_budget.for_a_restaurant_you_really_want_to_try'))}</div>
    <div class="inlineChoices">${mealMaxOptions().map(x=>`<button class="inlineChoice ${String(P.food.meal_max)===String(x)?'sel':''}" data-meal-max="${x}">¥${x}</button>`).join('')}
    <button class="inlineChoice ${P.food.meal_max==='open'?'sel':''}" data-meal-max="open">${esc(tr('question.day_end.no_fixed_limit'))}</button></div>
  </div>`:''}`;
}
function renderFoodRules(){
  const d=P.food.dietary;
  const dietary=['none','no_spicy','less_spicy','no_cilantro','no_offal','vegetarian','seafood_allergy','nut_allergy','other'];
  return `<div class="subblock"><div class="subhead">${esc(tr('question.food_rules.how_long_would_you_wait_for_a_popular'))}</div>
    <div class="inlineChoices">${[[tr('question.food_rules.no_waiting'),'0'],[tr('question.food_rules.15_minutes'),'15'],[tr('question.food_rules.30_minutes'),'30'],[tr('question.food_rules.45_minutes'),'45'],[tr('question.food_rules.60_minutes'),'60'],[tr('question.food_rules.longer_if_it_is_really_worth_it'),'open']].map(([t,v])=>`<button class="inlineChoice ${String(P.food.queue)===v?'sel':''}" data-queue="${v}">${t}</button>`).join('')}</div>
  </div>
  <div class="subblock"><div class="subhead">${esc(tr('question.food_rules.any_dietary_restrictions'))}</div>
    <div class="chips">${dietary.map(x=>`<button class="chip ${d.includes(x)?'sel':''}" data-diet="${esc(x)}">${esc(tr('diet.'+x))}</button>`).join('')}</div>
    ${d.includes('other')?`<div class="field compactField"><input class="input" id="dietaryOther" value="${esc(P.food.dietary_other)}" placeholder="${esc(tr('question.food_rules.other_dietary_restrictions'))}"></div>`:''}
  </div>
  <div class="subblock"><div class="subhead">${esc(tr('question.food_rules.how_important_is_a_smoke_free_dining_environment'))}</div>
    <div class="options">
      ${ChoiceCard(tr('value.smoke_free'),'',P.food.smoke_rule==='smoke_free','smoke_free')}
      ${ChoiceCard(tr('value.prefer_smoke_free'),'',P.food.smoke_rule==='prefer_smoke_free','prefer_smoke_free')}
      ${ChoiceCard(tr('value.smoke_ok'),'',P.food.smoke_rule==='smoke_ok','smoke_ok')}
    </div>
  </div>`;
}
function interestName(k){
  return ({nature:tr('interest.nature'),citywalk:tr('interest.citywalk'),museum:tr('interest.museum'),shopping:tr('interest.shopping'),photo:tr('interest.photo'),night:tr('interest.night'),food:tr('interest.food')})[k]||k;
}
function renderInterests(){
  const items=[['nature',tr('interest.nature')],['citywalk',tr('interest.citywalk')],['museum',tr('interest.museum')],['shopping',tr('interest.shopping')],['photo',tr('interest.photo')],['night',tr('interest.night')],['food',tr('interest.food')]];
  return `<div class="ratings">${items.map(([k,n])=>`<div class="starsRow"><b>${n}</b><div class="stars">${[1,2,3,4,5].map(v=>`<button class="star ${Number(P.interests[k])>=v?'on':''}" aria-label="${esc(tr('rating.label',{name:n,n:v}))}" aria-pressed="${Number(P.interests[k])===v}" data-interest="${k}" data-star="${v}">★</button>`).join('')}</div></div>`).join('')}</div>`;
}
function renderHardRules(){
  const rs=['nap','free_time','avoid_influencer_spots','fewer_areas','slow_pace','stroller','accessible','none'];
  return `<div class="chips">${rs.map(x=>`<button class="chip ${P.hard_rules.includes(x)?'sel':''}" data-rule="${esc(x)}">${esc(tr('rule.'+x))}</button>`).join('')}</div>
  <div class="field"><div class="label">${esc(tr('question.hard_rules.anything_else_you_d_like_us_to_know'))}</div>
  <textarea class="area compactArea" id="specialNote" placeholder="${esc(tr('question.hard_rules.for_example_leave_half_a_day_for_a'))}">${esc(P.note)}</textarea></div>`;
}

function content(id){
  if(id==='origin')return renderOrigin();
  if(id==='dates')return renderDates();
  if(id==='party_type')return renderPartyType();
  if(id==='party_details')return renderPartyDetails();
  if(id==='known')return renderKnown();
  if(id==='materials')return renderMaterials();
  if(id==='travel_bounds')return renderTravelBounds();
  if(id==='places')return renderPlaces();
  if(id==='must_places')return renderMust();
  if(id==='stay_style')return renderStayStyle();
  if(id==='hotel_budget')return renderHotelBudget();
  if(id==='driving')return renderDriving();
  if(id==='day_start')return renderDayStart();
  if(id==='day_end')return renderDayEnd();
  if(id==='mobility')return renderMobility();
  if(id==='taxi')return renderTaxi();
  if(id==='food_budget')return renderFoodBudget();
  if(id==='food_rules')return renderFoodRules();
  if(id==='interests')return renderInterests();
  if(id==='hard_rules')return renderHardRules();
  if(id==='review')return renderReview();
  return '';
}

function pageIssues(id){
  const a=[];const add=m=>a.push(m);
  if(id==='origin'&&!P.trip.origin)add(tr('validation.origin_required'));
  if(id==='dates'&&(!P.trip.start_date||!P.trip.end_date))add(tr('validation.complete_your_travel_dates'));
  if(id==='party_type'&&!P.party.type)add(tr('validation.choose_who_you_are_traveling_with'));
  if(id==='party_details'){
    if(!Number.isInteger(Number(P.party.size))||Number(P.party.size)<2)add(tr('validation.enter_the_exact_number_of_travelers'));
    if(P.party.type==='family'&&!P.party.family_members.length)add(tr('validation.choose_who_is_in_your_family_group'));
    if(P.party.type==='family'&&P.party.family_members.includes('child')&&!P.party.child_ages.trim())add(tr('validation.enter_the_children_s_ages'));
  }
  if(id==='known'&&!P.answered.known)add(tr('validation.confirm_what_you_have_already_booked_or_decided'));
  if(id==='materials'){
    const ok=cat=>{
      if(cat==='hotel')return P.attachments.hotel.length>0||P.hotel.manual_note.trim();
      if(cat==='inbound')return P.attachments.inbound.length>0||P.transport.inbound_manual.trim();
      if(cat==='outbound')return P.attachments.outbound.length>0||P.transport.outbound_manual.trim();
      if(cat==='event')return P.attachments.event.length>0||P.event.manual_note.trim();
      return true;
    };
    if(P.known.hotel&&!isDayTrip()&&!ok('hotel'))add(tr('validation.upload_a_hotel_screenshot_or_enter_the_details'));
    if(P.known.hotel&&!isDayTrip()&&!['all','partial'].includes(P.hotel.coverage))add(tr('validation.confirm_whether_your_hotel_bookings_cover_all_nights'));
    if(P.known.inbound&&!ok('inbound'))add(tr('validation.upload_your_travel_to_chongqing_booking_or_enter'));
    if(P.known.outbound&&!ok('outbound'))add(tr('validation.upload_your_travel_from_chongqing_booking_or_enter'));
    if(P.known.fixed_event&&!ok('event'))add(tr('validation.upload_your_fixed_plans_or_enter_the_details'));
  }
  if(id==='travel_bounds'){
    if(!P.known.inbound&&!P.trip.first_day_window)add(tr('validation.choose_when_you_can_start_on_the_first'));
    if(!P.known.outbound&&!P.trip.last_day_window)add(tr('validation.choose_when_you_need_to_finish_on_the'));
  }
  if(id==='places'&&selectedPlaceNames().length===0)add(tr('validation.add_the_places_you_want_to_visit'));
  if(id==='must_places'&&(!P.answered.must_places||P.places.must.some(n=>!selectedPlaceNames().includes(n))))add(tr('validation.confirm_your_must_visits_from_your_current_wanted'));
  if(id==='stay_style'&&!stayOptions().some(([,v])=>v===P.hotel.stay_style))add(tr('validation.choose_a_room_arrangement_for_your_group'));
  if(id==='hotel_budget'&&!P.hotel.budget_per_room)add(tr('validation.choose_your_hotel_budget_per_room_per_night'));
  if(id==='driving'&&!P.driving.mode)add(tr('validation.confirm_whether_you_will_drive_or_rent_a'));
  if(id==='day_start'){
    if(!P.schedule.usual_start)add(tr('validation.choose_your_usual_start_time'));
    if(!P.schedule.earliest_start)add(tr('validation.choose_your_earliest_possible_start_time'));
  }
  if(id==='day_end'){
    if(!P.schedule.usual_return)add(tr('validation.choose_your_usual_return_time'));
    if(!P.schedule.latest_return)add(tr('validation.choose_your_latest_possible_return_time'));
  }
  if(id==='mobility'){
    if(!P.mobility.usual_steps)add(tr('validation.choose_a_comfortable_daily_step_count'));
    if(!P.mobility.hard_steps)add(tr('validation.choose_your_maximum_step_count_for_a_busy'));
    if(!P.mobility.stairs)add(tr('validation.choose_your_comfort_level_with_hills_and_stairs'));
  }
  if(id==='taxi'&&P.local_transport.taxi_cap===undefined)add(tr('validation.choose_how_much_extra_your_group_would_pay'));
  if(id==='food_budget'){
    if(!P.food.meal_budget)add(tr('validation.choose_your_usual_meal_budget'));
    if(P.food.meal_max===undefined)add(tr('validation.choose_your_maximum_budget_for_a_special_meal'));
  }
  if(id==='food_rules'){
    if(!P.food.queue)add(tr('validation.choose_your_maximum_waiting_time'));
    if(!P.answered.dietary)add(tr('validation.confirm_your_dietary_restrictions'));
    if(!P.food.smoke_rule)add(tr('validation.choose_your_smoking_environment_preference'));
  }
  if(id==='interests'&&['nature','citywalk','museum','shopping','photo','night','food'].some(k=>!P.interests[k]))add(tr('validation.rate_all_the_activities'));
  if(id==='hard_rules'&&!P.answered.hard_rules)add(tr('validation.confirm_any_other_requirements'));
  return a;
}
function complete(id){return id==='review'?validate().length===0:pageIssues(id).length===0}
function validate(){
  const out=[];
  for(const s of steps()){
    if(s.id==='review')continue;
    for(const msg of pageIssues(s.id))out.push({id:s.id,msg});
  }
  return out;
}

function render(){
  successVisible=false;localizeShell();clearThumbnails();
  const [S,i]=stepIndex(),q=S[i];
  const required=S.filter(s=>s.id!=='review');
  const done=required.filter(s=>complete(s.id)).length;
  const pct=Math.round(done/required.length*100);
  document.getElementById('score').textContent=pct+'%';
  document.getElementById('bar').style.width=pct+'%';
  document.getElementById('progress').setAttribute('aria-valuenow',pct);
  renderStageNav();renderQuestionNav();
  card.innerHTML=QuestionTitle(q,i,S.length)+`<div class="answerArea">${content(q.id)}</div>`;
  enhanceControls(card);
  showThumbnails(card,idbAll);
  bottom.style.display=q.id==='review'?'none':'grid';
  back.disabled=i===0;
  next.disabled=!complete(q.id);
  wire(q.id);save();
}

function rerender(){render()}
function updateNext(){next.disabled=!complete(currentId);save()}

function wire(id){
  if(id==='origin'){
    const choose=c=>{P.trip.origin=c;P.origin_search='';save();autoNext()};
    const bind=()=>{enhanceControls(card);document.querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>choose(b.dataset.city))};
    bind();
    const s=document.getElementById('originSearch');
    const refreshCities=()=>{document.getElementById('cityDynamic').innerHTML=s.value.trim()||showCityDirectory?cityDynamicHtml(s.value):'';bind();document.getElementById('customCity')?.addEventListener('click',()=>choose((P.origin_search||'').trim()))};
    s.oninput=()=>{P.origin_search=s.value;save();refreshCities()};
    document.getElementById('allCities').onclick=e=>{showCityDirectory=!showCityDirectory;e.currentTarget.setAttribute('aria-expanded',showCityDirectory);e.currentTarget.textContent=showCityDirectory?tr('question.origin.hide_all_cities_regions'):tr('question.origin.view_all_cities_regions');refreshCities()};
    document.getElementById('customCity')?.addEventListener('click',()=>choose((P.origin_search||'').trim()));
  }
  if(id==='dates'){
    document.getElementById('prevMonth').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);render()};
    document.getElementById('nextMonth').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);render()};
    document.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{
      const d=b.dataset.date;
      if(!P.trip.start_date||P.trip.end_date){P.trip.start_date=d;P.trip.end_date='';}
      else{
        if(d<P.trip.start_date){P.trip.end_date=P.trip.start_date;P.trip.start_date=d}else P.trip.end_date=d;
        if(isDayTrip()){P.hotel.coverage='none';P.hotel.stay_style='';P.hotel.budget_per_room='';}
      }
      save();
      if(P.trip.end_date)autoNext();else render();
    });
  }
  if(id==='party_type'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{
      P.party.type=b.dataset.value;
      if(P.party.type==='solo'){P.party.size=1;P.party.family_members=[];P.party.child_ages=''}
      else{if(P.party.size===1)P.party.size=null;if(P.party.type!=='family'){P.party.family_members=[];P.party.child_ages=''}}
      save();autoNext();
    });
  }
  if(id==='party_details'){
    document.querySelectorAll('[data-party-size]').forEach(b=>b.onclick=()=>{
      if(b.dataset.partySize==='more'){if(Number(P.party.size)<9)P.party.size=9}
      else P.party.size=Number(b.dataset.partySize);
      save();
      if(P.party.type!=='family'&&Number(P.party.size)<9)autoNext();else render();
    });
    document.getElementById('partyExact')?.addEventListener('input',e=>{const n=Number(e.target.value);P.party.size=Number.isInteger(n)&&n>=9?n:null;updateNext()});
    document.querySelectorAll('[data-family]').forEach(b=>b.onclick=()=>{
      const x=b.dataset.family;
      P.party.family_members=P.party.family_members.includes(x)?P.party.family_members.filter(v=>v!==x):[...P.party.family_members,x];
      if(!P.party.family_members.includes('child'))P.party.child_ages='';
      save();render();
    });
    document.getElementById('childAges')?.addEventListener('input',e=>{P.party.child_ages=e.target.value;updateNext()});
  }
  if(id==='known'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{
      const x=b.dataset.value;P.answered.known=true;
      if(x==='none'){
        P.known={hotel:false,inbound:false,outbound:false,user_places:false,fixed_event:false};
      }else{
        P.known[x]=!P.known[x];
      }
      save();render();
    });
  }
  if(id==='materials'){
    card.querySelectorAll('[data-manual-section]').forEach(section=>section.ontoggle=()=>{
      if(!section.isConnected)return;
      if(section.open)manualSections.add(section.dataset.manualSection);else manualSections.delete(section.dataset.manualSection);
    });
    document.querySelectorAll('.fileInput').forEach(inp=>inp.onchange=async e=>{
      const cat=e.target.dataset.cat;
      for(const f of [...e.target.files]){
        if(!['image/jpeg','image/png','image/webp'].includes(f.type)){toast(tr('feedback.please_use_jpg_png_or_webp'));continue}
        if(f.size>10*1024*1024){toast(tr('feedback.each_image_must_be_10_mb_or_smaller'));continue}
        const rec=await idbPut(cat,f);
        P.attachments[cat].push({id:rec.id,name:rec.name,size:rec.size,type:rec.type});
      }
      save();render();
    });
    document.querySelectorAll('[data-remove-file]').forEach(b=>b.onclick=async()=>{
      const cat=b.dataset.cat,id=b.dataset.removeFile;
      await idbDelete(id);P.attachments[cat]=P.attachments[cat].filter(x=>x.id!==id);save();render();
    });
    document.querySelectorAll('[data-manual]').forEach(t=>t.oninput=e=>{
      const cat=e.target.dataset.manual;
      if(cat==='hotel')P.hotel.manual_note=e.target.value;
      if(cat==='inbound')P.transport.inbound_manual=e.target.value;
      if(cat==='outbound')P.transport.outbound_manual=e.target.value;
      if(cat==='event')P.event.manual_note=e.target.value;
      updateNext();
    });
    document.querySelectorAll('[data-coverage]').forEach(b=>b.onclick=()=>{P.hotel.coverage=b.dataset.coverage;save();render()});
  }
  if(id==='travel_bounds'){
    document.querySelectorAll('[data-first-window]').forEach(b=>b.onclick=()=>{P.trip.first_day_window=b.dataset.firstWindow;save();render()});
    document.querySelectorAll('[data-last-window]').forEach(b=>b.onclick=()=>{P.trip.last_day_window=b.dataset.lastWindow;save();render()});
  }
  if(id==='places'){
    document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{
      const x=b.dataset.place;P.places.quick=P.places.quick.includes(x)?P.places.quick.filter(v=>v!==x):[...P.places.quick,x];save();render();
    });
    document.getElementById('placesPaste').oninput=e=>{P.places.pasted=e.target.value;updateNext()};
  }
  if(id==='must_places'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{
      const x=b.dataset.value;P.answered.must_places=true;
      if(x==='__none__')P.places.must=[];
      else P.places.must=P.places.must.includes(x)?P.places.must.filter(v=>v!==x):[...P.places.must,x];
      save();render();
    });
  }
  if(id==='stay_style'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{P.hotel.stay_style=b.dataset.value;save();autoNext()});
  }
  if(id==='hotel_budget'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{P.hotel.budget_per_room=b.dataset.value;save();render()});
    document.querySelectorAll('[data-hotel-pref]').forEach(b=>b.onclick=()=>{
      const x=b.dataset.hotelPref;
      if(x==='none')P.hotel.prefs=['none'];
      else{
        P.hotel.prefs=P.hotel.prefs.filter(v=>v!=='none');
        P.hotel.prefs=P.hotel.prefs.includes(x)?P.hotel.prefs.filter(v=>v!==x):[...P.hotel.prefs,x];
      }
      if(!P.hotel.prefs.includes('other'))P.hotel.pref_other='';
      save();render();
    });
    document.getElementById('hotelPrefOther')?.addEventListener('input',e=>{P.hotel.pref_other=e.target.value;save()});
  }
  if(id==='driving'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{
      P.driving.mode=b.dataset.value;
      if(fullTimeDriving())delete P.local_transport.taxi_cap;
      save();autoNext();
    });
  }
  if(id==='day_start'){
    document.querySelectorAll('[data-usual-start]').forEach(b=>b.onclick=()=>{
      P.schedule.usual_start=b.dataset.usualStart;
      const allowed=startSpecialOptions();
      if(!allowed.includes(P.schedule.earliest_start))P.schedule.earliest_start='';
      save();render();
    });
    document.querySelectorAll('[data-earliest-start]').forEach(b=>b.onclick=()=>{P.schedule.earliest_start=b.dataset.earliestStart;save();render()});
  }
  if(id==='day_end'){
    document.querySelectorAll('[data-usual-return]').forEach(b=>b.onclick=()=>{
      P.schedule.usual_return=b.dataset.usualReturn;
      const allowed=returnSpecialOptions();
      if(P.schedule.latest_return!=='open'&&!allowed.includes(P.schedule.latest_return))P.schedule.latest_return='';
      save();render();
    });
    document.querySelectorAll('[data-latest-return]').forEach(b=>b.onclick=()=>{P.schedule.latest_return=b.dataset.latestReturn;save();render()});
  }
  if(id==='mobility'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{
      if(['≤6000','6000-10000','10000-15000','15000-20000','20000+'].includes(b.dataset.value)){
        P.mobility.usual_steps=b.dataset.value;
        const allowed=hardStepOptions().map(String);
        if(!allowed.includes(String(P.mobility.hard_steps)))P.mobility.hard_steps='';
      }else P.mobility.stairs=b.dataset.value;
      save();render();
    });
    document.querySelectorAll('[data-hard-steps]').forEach(b=>b.onclick=()=>{P.mobility.hard_steps=Number(b.dataset.hardSteps);save();render()});
  }
  if(id==='taxi'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{
      P.local_transport.taxi_cap=b.dataset.value==='0'?0:(b.dataset.value==='open'?'open':Number(b.dataset.value));
      save();autoNext();
    });
  }
  if(id==='food_budget'){
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{
      P.food.meal_budget=b.dataset.value;
      const allowed=mealMaxOptions().map(String);
      if(P.food.meal_max!=='open'&&!allowed.includes(String(P.food.meal_max)))P.food.meal_max=undefined;
      save();render();
    });
    document.querySelectorAll('[data-meal-max]').forEach(b=>b.onclick=()=>{
      P.food.meal_max=b.dataset.mealMax==='open'?'open':Number(b.dataset.mealMax);save();render();
    });
  }
  if(id==='food_rules'){
    document.querySelectorAll('[data-queue]').forEach(b=>b.onclick=()=>{P.food.queue=b.dataset.queue;save();render()});
    document.querySelectorAll('[data-diet]').forEach(b=>b.onclick=()=>{
      const x=b.dataset.diet;P.answered.dietary=true;
      if(x==='none')P.food.dietary=['none'];
      else{
        P.food.dietary=P.food.dietary.filter(v=>v!=='none');
        if(x==='no_spicy')P.food.dietary=P.food.dietary.filter(v=>v!=='less_spicy');
        if(x==='less_spicy')P.food.dietary=P.food.dietary.filter(v=>v!=='no_spicy');
        P.food.dietary=P.food.dietary.includes(x)?P.food.dietary.filter(v=>v!==x):[...P.food.dietary,x];
      }
      if(!P.food.dietary.includes('other'))P.food.dietary_other='';
      save();render();
    });
    document.getElementById('dietaryOther')?.addEventListener('input',e=>{P.food.dietary_other=e.target.value;save()});
    document.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{P.food.smoke_rule=b.dataset.value;save();render()});
  }
  if(id==='interests'){
    document.querySelectorAll('[data-interest]').forEach(b=>b.onclick=()=>{P.interests[b.dataset.interest]=Number(b.dataset.star);save();render()});
  }
  if(id==='hard_rules'){
    document.querySelectorAll('[data-rule]').forEach(b=>b.onclick=()=>{
      const x=b.dataset.rule;P.answered.hard_rules=true;
      if(x==='none')P.hard_rules=['none'];
      else{
        P.hard_rules=P.hard_rules.filter(v=>v!=='none');
        P.hard_rules=P.hard_rules.includes(x)?P.hard_rules.filter(v=>v!==x):[...P.hard_rules,x];
      }
      save();render();
    });
    document.getElementById('specialNote')?.addEventListener('input',e=>{P.note=e.target.value;save()});
  }
  if(id==='review'){
    document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>go(b.dataset.edit));
    document.querySelectorAll('[data-fix]').forEach(b=>b.onclick=()=>go(b.dataset.fix));
    document.getElementById('goFirstMissing')?.addEventListener('click',()=>{const x=validate()[0];if(x)go(x.id)});
    document.getElementById('clearDraft').onclick=async()=>{
      if(confirm(tr('feedback.clear_this_draft_and_all_uploaded_images'))){
        localStorage.removeItem(STORAGE);localStorage.removeItem(STORAGE+'-step');await idbClear();
        P=fresh();currentId='origin';render();
      }
    };
    document.getElementById('submit')?.addEventListener('click',()=>{
      const issues=validate();if(issues.length){toast(tr('review.missing',{n:issues.length}));return}
      finish();
    });
  }
}

back.onclick=()=>goDelta(-1);
next.onclick=()=>{
  if(!complete(currentId)){toast(pageIssues(currentId)[0]||tr('feedback.complete_this_page_first'));return}
  goDelta(1);
};

function reviewData(){
  const row=(key,value)=>[tr('review.'+key),String(value??tr('common.unfilled'))];
  const list=(values,group)=>values.length?values.map(v=>tr(group+'.'+v)).join(' / '):tr('common.unfilled');
  const custom=(value)=>value||tr('common.unfilled');
  const basic=[row('route',cityLabel(P.trip.origin||'')+' → '+cityLabel('chongqing')),row('dates',formatDate(P.trip.start_date)+' — '+formatDate(P.trip.end_date)),row('party',valLabel(P.party.type)+' · '+tr('unit.people',{n:P.party.size||'?'}))];
  if(P.party.type==='family')basic.push(row('family',list(P.party.family_members,'family')));
  if(P.party.type==='family'&&P.party.family_members.includes('child'))basic.push(row('ages',P.party.child_ages));
  const bookings=[];
  const material=(cat,label,note)=>bookings.push(row(label,tr('upload.count',{n:P.attachments[cat].length})+(note?' · '+note:'')));
  if(P.known.hotel&&!isDayTrip()){material('hotel','hotel',P.hotel.manual_note);bookings.push(row('coverage',valLabel(P.hotel.coverage)))}
  if(P.known.inbound)material('inbound','inbound',P.transport.inbound_manual);else bookings.push(row('first_day',valLabel(P.trip.first_day_window)));
  if(P.known.outbound)material('outbound','outbound',P.transport.outbound_manual);else bookings.push(row('last_day',valLabel(P.trip.last_day_window)));
  if(P.known.fixed_event)material('event','event',P.event.manual_note);
  if(P.known.user_places){bookings.push(row('wanted',selectedPlaceNames().map(placeLabel).join(' / ')||tr('common.unfilled')));bookings.push(row('must',P.answered.must_places?(P.places.must.length?P.places.must.map(placeLabel).join(' / '):tr('places.none')):tr('common.unfilled')))}
  const lodging=[row('rooms',valLabel(P.hotel.stay_style)),row('hotel_budget',valLabel(P.hotel.budget_per_room)),row('hotel_prefs',P.hotel.prefs.length?list(P.hotel.prefs,'hotel'):tr('common.unspecified'))];
  if(P.hotel.pref_other&&P.hotel.prefs.includes('other'))lodging.push(row('note',P.hotel.pref_other));
  const transport=[row('driving',valLabel(P.driving.mode)),row('usual_start',custom(P.schedule.usual_start)),row('earliest',custom(P.schedule.earliest_start)),row('usual_return',custom(P.schedule.usual_return)),row('latest',P.schedule.latest_return==='open'?tr('common.unlimited'):custom(P.schedule.latest_return)),row('usual_steps',valLabel(P.mobility.usual_steps)),row('max_steps',P.mobility.hard_steps?tr('unit.steps',{n:P.mobility.hard_steps}):tr('common.unfilled')),row('stairs',valLabel(P.mobility.stairs))];
  if(!fullTimeDriving())transport.push(row('taxi',P.local_transport.taxi_cap==='open'?tr('common.unlimited'):P.local_transport.taxi_cap===undefined?tr('common.unfilled'):'¥'+P.local_transport.taxi_cap));
  const food=[row('meal',valLabel(P.food.meal_budget)+tr('unit.per_person')),row('max_meal',P.food.meal_max==='open'?tr('common.unlimited'):P.food.meal_max===undefined?tr('common.unfilled'):'¥'+P.food.meal_max+tr('unit.per_person')),row('queue',P.food.queue==='open'?tr('queue.open'):P.food.queue===''?tr('common.unfilled'):tr('unit.minutes',{n:P.food.queue})),row('diet',list(P.food.dietary,'diet')),row('smoking',valLabel(P.food.smoke_rule))];
  if(P.food.dietary.includes('other')&&P.food.dietary_other)food.push(row('note',P.food.dietary_other));
  const preferences=Object.keys(INTEREST_KEYS).map(k=>[interestName(k),P.interests[k]?tr('unit.stars',{n:P.interests[k]}):tr('common.unfilled')]);
  preferences.push(row('rules',list(P.hard_rules,'rule')));if(P.note)preferences.push(row('note',P.note));
  return [{title:tr('nav.basic'),edit:'origin',rows:basic},{title:tr('nav.bookings'),edit:'known',rows:bookings},...(needLodging()?[{title:tr('nav.lodging'),edit:'stay_style',rows:lodging}]:[]),{title:tr('nav.transport'),edit:'driving',rows:transport},{title:tr('nav.food'),edit:'food_budget',rows:food},{title:tr('nav.preferences'),edit:'interests',rows:preferences}];
}
function renderReview(){
  const issues=validate();
  return `<div class="review">${reviewData().map(section=>`<section class="reviewSec"><div class="reviewHead"><h3>${esc(section.title)}</h3><button class="editLink" data-edit="${section.edit}">${esc(tr('review.edit'))}</button></div>${section.rows.map(([label,value])=>`<div class="row"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('')}</section>`).join('')}</div>
  ${issues.length?`<div class="submitLock">${esc(tr('review.missing',{n:issues.length}))}</div>${issues.map(issue=>`<div class="issue"><div class="issueLine"><b>${esc(issue.msg)}</b><button class="fixBtn" data-fix="${issue.id}">${esc(tr('review.go_fill'))}</button></div></div>`).join('')}<button class="secondary" id="goFirstMissing">${esc(tr('review.first_missing'))}</button>`:`<div class="issue green">${esc(tr('review.ready'))}</div><button class="primary" id="submit">${esc(tr('review.submit'))}</button>`}
  <button class="secondary" id="clearDraft">${esc(tr('review.clear'))}</button>`;
}
function buildText(){
  return [tr('export.title'),...reviewData().flatMap(section=>['',section.title,...section.rows.map(([label,value])=>label+': '+value)])].join('\n');
}

async function buildZip(){
  const zip=new JSZip();
  const exportP=JSON.parse(JSON.stringify(P));
  exportP.locale=locale;exportP.submitted=true;exportP.exported_at=new Date().toISOString();
  zip.file('travel_order.json',JSON.stringify(exportP,null,2));
  zip.file('travel_request.txt',buildText());
  zip.file('README.txt',tr('export.chongqing_trip_request_package_read_travel_order_json'));
  const active={hotel:P.known.hotel&&!isDayTrip(),inbound:P.known.inbound,outbound:P.known.outbound,event:P.known.fixed_event};
  for(const r of await idbAll()){
    if(!active[r.category])continue;
    const safe=(r.name||'attachment').replace(/[\/:*?\x22<>|]/g,'_');
    zip.file(`attachments/${r.category}/${r.id}_${safe}`,r.blob);
  }
  return await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
}
let successVisible=false;
async function finish(){
  successVisible=true;localizeShell();
  clearThumbnails();
  P.submitted=true;save();const text=buildText();
  card.innerHTML=`<div class="successState"><div class="doneMark">✓</div><h2>${esc(tr('success.your_trip_details_are_ready'))}</h2>
    <p class="doneText">${esc(tr('success.your_details_are_saved_on_this_device_you'))}</p>
    <button class="primary" id="sharePack">${esc(tr('success.share_trip_details'))}</button>
    <button class="secondary" id="downloadPack">${esc(tr('success.download_trip_details'))}</button>
    <button class="secondary" id="copyText">${esc(tr('success.copy_text'))}</button>
    <details class="disclosure"><summary>${esc(tr('success.view_trip_details'))}</summary><div class="resultBox">${esc(text)}</div></details>
    <div class="tiny">${esc(tr('success.saved_only_in_this_browser_nothing_has_been'))}</div></div>`;
  bottom.style.display='none';
  const makeFile=async()=>new File([await buildZip()],`${esc(tr('success.chongqing_trip'))}${P.order_id.slice(0,8)}.zip`,{type:'application/zip'});
  document.getElementById('downloadPack').onclick=async()=>{toast(tr('success.preparing_your_file'));const f=await makeFile(),u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000)};
  document.getElementById('sharePack').onclick=async()=>{toast(tr('success.preparing_your_file'));const f=await makeFile();if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({title:tr('success.chongqing_trip_details'),files:[f]});return}catch(e){}}const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);toast(tr('success.file_sharing_is_not_supported_here_downloading_instead'))};
  document.getElementById('copyText').onclick=async()=>{await navigator.clipboard.writeText(text);toast(tr('success.copied'))};
}

// IndexedDB attachment store
function dbOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function idbPut(category,file){
  const db=await dbOpen(),id=(crypto.randomUUID?crypto.randomUUID():'f-'+Date.now()+'-'+Math.random());
  const rec={id,category,name:file.name,size:file.size,type:file.type,blob:file};
  await new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(rec);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();return rec;
}
async function idbDelete(id){const db=await dbOpen();await new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}
async function idbAll(){const db=await dbOpen();const rows=await new Promise((res,rej)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});db.close();return rows}
async function idbClear(){const db=await dbOpen();await new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}

render();

