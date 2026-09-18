/* Shared locale runtime. Dictionaries load before the questionnaire. */
const I18N={};
const LOCALE_STORAGE='cq-trip-web-v4-locale';
function browserLocale(language){
  const value=(language||'').toLowerCase();
  if(/^zh-(tw|hk|mo|hant)(-|$)/.test(value))return 'zh-TW';
  if(value==='zh'||/^zh-(cn|sg|hans)(-|$)/.test(value))return 'zh-CN';
  return 'en';
}
let locale;
try{locale=localStorage.getItem(LOCALE_STORAGE)}catch{}
if(!['zh-CN','zh-TW','en'].includes(locale))locale=browserLocale(navigator.language);
try{localStorage.setItem(LOCALE_STORAGE,locale)}catch{}
function tr(key,params={}){
  const count=Number(params.n);
  const form=params.n!==undefined&&Number.isFinite(count)?new Intl.PluralRules(locale).select(count):'';
  const value=I18N[locale]?.[key+'.'+form]??I18N[locale]?.[key];
  if(value===undefined)throw new Error('Missing translation: '+locale+' / '+key);
  return value.replace(/\{(\w+)\}/g,(_,name)=>{
    if(params[name]===undefined)throw new Error('Missing translation parameter: '+key+' / '+name);
    return name==='n'&&Number.isFinite(count)?new Intl.NumberFormat(locale).format(count):String(params[name]);
  });
}
function cityLabel(value){return value?(I18N[locale]['city.'+value]||value):tr('common.unfilled')}
function placeLabel(value){return I18N[locale]['place.'+value]||value}
function placeKey(value){
  for(const key of Object.keys(I18N['zh-CN']).filter(key=>key.startsWith('place.'))){
    if(Object.values(I18N).some(dict=>dict[key]===value))return key.slice(6);
  }
  return value;
}
function formatDate(iso){
  if(!iso)return tr('common.unfilled');
  return new Intl.DateTimeFormat(locale,{year:'numeric',month:locale==='en'?'short':'long',day:'numeric'}).format(new Date(iso+'T00:00:00'));
}
const INTEREST_KEYS={nature:1,citywalk:1,museum:1,shopping:1,photo:1,night:1,food:1};
function localizeShell(){
  document.documentElement.lang=locale;
  document.title=tr('app.document_title');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-label]').forEach(el=>el.setAttribute('aria-label',tr(el.dataset.i18nLabel)));
  document.querySelectorAll('[data-locale]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.locale===locale));
}
function switchLocale(nextLocale){
  if(!I18N[nextLocale]||nextLocale===locale)return;
  const y=window.scrollY;
  locale=nextLocale;
  try{localStorage.setItem(LOCALE_STORAGE,locale)}catch{}
  document.getElementById('toast').classList.remove('show');
  if(successVisible)finish();else render();
  window.scrollTo({top:y,behavior:'instant'});
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-locale]');
  if(button)switchLocale(button.dataset.locale);
});
