const STORAGE='travel-companion-beta-v1';

const I18N={
  'zh-CN':{
    sub:'同行人小问卷 · 约 1 分钟',back:'上一步',next:'下一步',finish:'生成我的补充',
    nameTitle:'怎么称呼你？',nameHelp:'可选。方便大家知道这份偏好是谁填的。',namePlaceholder:'昵称 / 名字（可不填）',
    paceTitle:'你更喜欢一天怎么玩？',paceHelp:'选最接近你的，不需要想太久。',
    pace_relaxed:'松一点',pace_relaxed_h:'少赶场，留点随意走走和休息的时间',
    pace_balanced:'刚刚好',pace_balanced_h:'有安排，但不要从早赶到晚',
    pace_full:'多玩一点',pace_full_h:'只要值得，行程满一点也可以',
    wantTitle:'这趟旅行，你最想要哪些体验？',wantHelp:'最多选 3 个。',
    want_food:'好吃的',want_photo:'拍照',want_citywalk:'逛街区 / Citywalk',want_nature:'自然风景',
    want_museum:'博物馆 / 人文',want_shopping:'逛街购物',want_night:'夜景 / 晚上玩',want_iconic:'经典必去',
    avoidTitle:'你最不想遇到什么？',avoidHelp:'最多选 3 个；没有特别介意的也可以选“都还好”。',
    avoid_early:'太早起',avoid_late:'玩到太晚',avoid_queue:'长时间排队',avoid_rush:'一直赶场',
    avoid_walk:'走太多路',avoid_stairs:'很多坡 / 楼梯',avoid_crowd:'人挤人',avoid_influencer:'纯网红打卡',avoid_none:'都还好',
    hardTitle:'有没有必须照顾你的地方？',hardHelp:'这些会当成硬限制处理，不会和普通兴趣一起平均掉。',
    hard_steps:'一天最好 ≤ 6000 步',hard_stairs:'尽量少坡 / 少楼梯',hard_noearly:'最好 10 点后再出门',
    hard_home:'最好 22 点前回住处',hard_nap:'中间需要休息 / 午休',hard_diet:'有饮食限制 / 过敏',
    hard_access:'需要无障碍 / 行动便利',hard_none:'没有特别限制',
    dietTitle:'吃东西有什么一定要注意的？',dietHelp:'可以多选。',
    diet_nospicy:'不能吃辣',diet_lessspicy:'少辣',diet_nocilantro:'不要香菜',diet_nooffal:'不吃内脏',
    diet_veg:'素食',diet_seafood:'海鲜过敏',diet_nut:'坚果过敏',diet_other:'其他',
    otherPlaceholder:'其他饮食限制（可选）',
    doneTitle:'你的同行偏好整理好了',doneHelp:'复制下面这段发给同行人里的下单人，或者直接发给我。',
    copy:'复制同行人补充',copied:'已复制',copyFail:'复制失败，请长按下面文字手动复制',
    summaryTitle:'【同行人补充】',who:'称呼',pace:'旅行节奏',want:'最想要',avoid:'尽量避免',hard:'硬限制',diet:'饮食限制',
    none:'无',anon:'未填写',max3:'最多选 3 个'
  },
  'zh-TW':{
    sub:'同行人小問卷 · 約 1 分鐘',back:'上一步',next:'下一步',finish:'產生我的補充',
    nameTitle:'怎麼稱呼你？',nameHelp:'可選。方便大家知道這份偏好是誰填的。',namePlaceholder:'暱稱 / 名字（可不填）',
    paceTitle:'你更喜歡一天怎麼玩？',paceHelp:'選最接近你的，不需要想太久。',
    pace_relaxed:'鬆一點',pace_relaxed_h:'少趕場，留點隨意走走和休息的時間',
    pace_balanced:'剛剛好',pace_balanced_h:'有安排，但不要從早趕到晚',
    pace_full:'多玩一點',pace_full_h:'只要值得，行程滿一點也可以',
    wantTitle:'這趟旅行，你最想要哪些體驗？',wantHelp:'最多選 3 個。',
    want_food:'好吃的',want_photo:'拍照',want_citywalk:'逛街區 / Citywalk',want_nature:'自然風景',
    want_museum:'博物館 / 人文',want_shopping:'逛街購物',want_night:'夜景 / 晚上玩',want_iconic:'經典必去',
    avoidTitle:'你最不想遇到什麼？',avoidHelp:'最多選 3 個；沒有特別介意的也可以選「都還好」。',
    avoid_early:'太早起',avoid_late:'玩到太晚',avoid_queue:'長時間排隊',avoid_rush:'一直趕場',
    avoid_walk:'走太多路',avoid_stairs:'很多坡 / 樓梯',avoid_crowd:'人擠人',avoid_influencer:'純網紅打卡',avoid_none:'都還好',
    hardTitle:'有沒有必須照顧你的地方？',hardHelp:'這些會當成硬限制處理，不會和普通興趣一起平均掉。',
    hard_steps:'一天最好 ≤ 6000 步',hard_stairs:'盡量少坡 / 少樓梯',hard_noearly:'最好 10 點後再出門',
    hard_home:'最好 22 點前回住處',hard_nap:'中間需要休息 / 午休',hard_diet:'有飲食限制 / 過敏',
    hard_access:'需要無障礙 / 行動便利',hard_none:'沒有特別限制',
    dietTitle:'吃東西有什麼一定要注意的？',dietHelp:'可以多選。',
    diet_nospicy:'不能吃辣',diet_lessspicy:'少辣',diet_nocilantro:'不要香菜',diet_nooffal:'不吃內臟',
    diet_veg:'素食',diet_seafood:'海鮮過敏',diet_nut:'堅果過敏',diet_other:'其他',
    otherPlaceholder:'其他飲食限制（可選）',
    doneTitle:'你的同行偏好整理好了',doneHelp:'複製下面這段傳給同行人裡的下單人，或者直接傳給我。',
    copy:'複製同行人補充',copied:'已複製',copyFail:'複製失敗，請長按下面文字手動複製',
    summaryTitle:'【同行人補充】',who:'稱呼',pace:'旅行節奏',want:'最想要',avoid:'盡量避免',hard:'硬限制',diet:'飲食限制',
    none:'無',anon:'未填寫',max3:'最多選 3 個'
  },
  en:{
    sub:'Companion mini survey · about 1 minute',back:'Back',next:'Next',finish:'Create my preferences',
    nameTitle:'What should we call you?',nameHelp:'Optional. It helps identify whose preferences these are.',namePlaceholder:'Name / nickname (optional)',
    paceTitle:'What pace feels best to you?',paceHelp:'Pick the closest fit. No need to overthink it.',
    pace_relaxed:'Take it easy',pace_relaxed_h:'Fewer stops, with time to wander and rest',
    pace_balanced:'Balanced',pace_balanced_h:'A plan, but not rushing from morning to night',
    pace_full:'Fit more in',pace_full_h:'A fuller day is fine if the stops are worth it',
    wantTitle:'What do you most want from this trip?',wantHelp:'Choose up to 3.',
    want_food:'Food',want_photo:'Photos',want_citywalk:'Neighborhoods / city walks',want_nature:'Nature',
    want_museum:'Museums / culture',want_shopping:'Shopping',want_night:'Night views / evenings',want_iconic:'Classic must-sees',
    avoidTitle:'What would you most like to avoid?',avoidHelp:'Choose up to 3, or “No strong dislikes”.',
    avoid_early:'Very early starts',avoid_late:'Very late nights',avoid_queue:'Long queues',avoid_rush:'Constant rushing',
    avoid_walk:'Too much walking',avoid_stairs:'Lots of hills / stairs',avoid_crowd:'Heavy crowds',avoid_influencer:'Pure social-media check-ins',avoid_none:'No strong dislikes',
    hardTitle:'Anything the whole group must accommodate for you?',hardHelp:'These are treated as hard constraints, not averaged with normal preferences.',
    hard_steps:'Prefer ≤ 6,000 steps/day',hard_stairs:'Minimize hills / stairs',hard_noearly:'Prefer starting after 10:00',
    hard_home:'Prefer being back by 22:00',hard_nap:'Need a rest / nap break',hard_diet:'Dietary restriction / allergy',
    hard_access:'Need accessible / easier mobility',hard_none:'No special constraints',
    dietTitle:'Any food restrictions we must respect?',dietHelp:'Choose all that apply.',
    diet_nospicy:'No spicy food',diet_lessspicy:'Mild spice only',diet_nocilantro:'No cilantro',diet_nooffal:'No offal',
    diet_veg:'Vegetarian',diet_seafood:'Seafood allergy',diet_nut:'Nut allergy',diet_other:'Other',
    otherPlaceholder:'Other dietary restriction (optional)',
    doneTitle:'Your companion preferences are ready',doneHelp:'Copy this and send it to the person organizing the trip, or send it directly to me.',
    copy:'Copy companion preferences',copied:'Copied',copyFail:'Copy failed. Long-press the text below and copy it manually.',
    summaryTitle:'[Companion preferences]',who:'Name',pace:'Trip pace',want:'Most wanted',avoid:'Try to avoid',hard:'Hard constraints',diet:'Dietary restrictions',
    none:'None',anon:'Not provided',max3:'Choose up to 3'
  }
};

const OPT={
  pace:[
    ['relaxed','pace_relaxed','pace_relaxed_h'],['balanced','pace_balanced','pace_balanced_h'],['full','pace_full','pace_full_h']
  ],
  want:['food','photo','citywalk','nature','museum','shopping','night','iconic'],
  avoid:['early','late','queue','rush','walk','stairs','crowd','influencer','none'],
  hard:['steps','stairs','noearly','home','nap','diet','access','none'],
  diet:['nospicy','lessspicy','nocilantro','nooffal','veg','seafood','nut','other']
};

let locale=localStorage.getItem(STORAGE+'-locale')||'zh-CN';
let S=load();
let step=0;

function fresh(){return {name:'',pace:'',want:[],avoid:[],hard:[],diet:[],diet_other:''}}
function load(){try{return {...fresh(),...JSON.parse(localStorage.getItem(STORAGE)||'{}')}}catch(e){return fresh()}}
function save(){localStorage.setItem(STORAGE,JSON.stringify(S))}
function t(k){return I18N[locale][k]||k}
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function toast(msg){const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1200)}

function steps(){
  const x=['name','pace','want','avoid','hard'];
  if(S.hard.includes('diet'))x.push('diet');
  x.push('done');
  return x;
}

function toggle(list,value,max){
  if(value==='none'){
    list.splice(0,list.length,'none');
    return true;
  }
  const none=list.indexOf('none');if(none>=0)list.splice(none,1);
  const i=list.indexOf(value);
  if(i>=0){list.splice(i,1);return true}
  if(max && list.length>=max){toast(t('max3'));return false}
  list.push(value);return true;
}

function choice(value,label,help,current,key){
  return `<button class="choice ${current===value?'sel':''}" data-single="${key}" data-value="${value}"><b>${esc(t(label))}</b>${help?`<small>${esc(t(help))}</small>`:''}</button>`;
}
function chips(values,group,list,max){
  return `<div class="chips">${values.map(v=>`<button class="chip ${list.includes(v)?'sel':''}" data-multi="${group}" data-value="${v}" data-max="${max||''}">${esc(t(group+'_'+v))}</button>`).join('')}</div>`;
}
function head(title,help,index,total){
  return `<div class="kicker">${index+1} / ${total}</div><h1>${esc(t(title))}</h1>${help?`<p class="help">${esc(t(help))}</p>`:''}`;
}

function render(){
  const ss=steps();
  if(step>=ss.length)step=ss.length-1;
  const id=ss[step],card=document.getElementById('card'),bottom=document.getElementById('bottom');
  document.getElementById('headerSub').textContent=t('sub');
  document.querySelectorAll('[data-locale]').forEach(b=>b.classList.toggle('active',b.dataset.locale===locale));
  document.getElementById('back').textContent=t('back');
  document.getElementById('next').textContent=id==='diet'?t('finish'):t('next');
  document.getElementById('bar').style.width=(id==='done'?100:Math.round(step/(ss.length-1)*100))+'%';

  if(id==='name'){
    card.innerHTML=head('nameTitle','nameHelp',step,ss.length-1)+`<div class="inputWrap"><input id="name" class="input" value="${esc(S.name)}" placeholder="${esc(t('namePlaceholder'))}"></div>`;
  }else if(id==='pace'){
    card.innerHTML=head('paceTitle','paceHelp',step,ss.length-1)+`<div class="options">${OPT.pace.map(o=>choice(o[0],o[1],o[2],S.pace,'pace')).join('')}</div>`;
  }else if(id==='want'){
    card.innerHTML=head('wantTitle','wantHelp',step,ss.length-1)+chips(OPT.want,'want',S.want,3);
  }else if(id==='avoid'){
    card.innerHTML=head('avoidTitle','avoidHelp',step,ss.length-1)+chips(OPT.avoid,'avoid',S.avoid,3);
  }else if(id==='hard'){
    card.innerHTML=head('hardTitle','hardHelp',step,ss.length-1)+chips(OPT.hard,'hard',S.hard);
  }else if(id==='diet'){
    card.innerHTML=head('dietTitle','dietHelp',step,ss.length-1)+chips(OPT.diet,'diet',S.diet)+
      (S.diet.includes('other')?`<div class="inputWrap"><input id="dietOther" class="input" value="${esc(S.diet_other)}" placeholder="${esc(t('otherPlaceholder'))}"></div>`:'');
  }else{
    const text=summary();
    bottom.style.display='none';
    card.innerHTML=`<div class="done"><div class="mark">✓</div><h1>${esc(t('doneTitle'))}</h1><p class="help">${esc(t('doneHelp'))}</p><div class="actions"><button class="primary" id="copy">${esc(t('copy'))}</button></div><div class="result">${esc(text)}</div></div>`;
    document.getElementById('copy').onclick=async()=>toast(await copyText(text)?t('copied'):t('copyFail'));
    return;
  }

  bottom.style.display='grid';
  document.getElementById('back').disabled=step===0;
  document.getElementById('next').disabled=!complete(id);

  document.getElementById('name')?.addEventListener('input',e=>{S.name=e.target.value;save()});
  document.getElementById('dietOther')?.addEventListener('input',e=>{S.diet_other=e.target.value;save()});
  document.querySelectorAll('[data-single]').forEach(b=>b.onclick=()=>{S[b.dataset.single]=b.dataset.value;save();render()});
  document.querySelectorAll('[data-multi]').forEach(b=>b.onclick=()=>{
    const group=b.dataset.multi,max=Number(b.dataset.max)||0;
    if(toggle(S[group],b.dataset.value,max)){if(group==='hard'&&!S.hard.includes('diet')){S.diet=[];S.diet_other=''}save();render()}
  });
}

function complete(id){
  if(id==='name')return true;
  if(id==='pace')return !!S.pace;
  if(id==='want')return S.want.length>0;
  if(id==='avoid')return S.avoid.length>0;
  if(id==='hard')return S.hard.length>0;
  if(id==='diet')return S.diet.length>0;
  return true;
}
function labels(list,prefix){return list.filter(v=>v!=='none').map(v=>t(prefix+'_'+v))}
function summary(){
  const pace=S.pace?t('pace_'+S.pace):t('none');
  const want=labels(S.want,'want').join(' / ')||t('none');
  const avoid=S.avoid.includes('none')?t('none'):(labels(S.avoid,'avoid').join(' / ')||t('none'));
  const hard=S.hard.includes('none')?t('none'):(labels(S.hard,'hard').join(' / ')||t('none'));
  let diet=t('none');
  if(S.hard.includes('diet')){
    const ds=labels(S.diet,'diet');
    if(S.diet.includes('other')&&S.diet_other.trim())ds.push(S.diet_other.trim());
    diet=ds.join(' / ')||t('none');
  }
  return [t('summaryTitle'),`${t('who')}: ${S.name.trim()||t('anon')}`,`${t('pace')}: ${pace}`,`${t('want')}: ${want}`,`${t('avoid')}: ${avoid}`,`${t('hard')}: ${hard}`,`${t('diet')}: ${diet}`].join('\n');
}
async function copyText(text){
  if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return true}catch(e){}}
  const a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.left='-9999px';document.body.appendChild(a);a.select();
  let ok=false;try{ok=document.execCommand('copy')}catch(e){}a.remove();return ok;
}

document.getElementById('back').onclick=()=>{if(step>0){step--;render()}};
document.getElementById('next').onclick=()=>{
  const ss=steps(),id=ss[step];
  if(!complete(id))return;
  step++;
  render();
};
document.querySelectorAll('[data-locale]').forEach(b=>b.onclick=()=>{locale=b.dataset.locale;localStorage.setItem(STORAGE+'-locale',locale);document.documentElement.lang=locale;render()});
render();
