/* Shared presentation components. No questionnaire state or branching rules. */
// Ignore the second click of a double-click, including when the first click
// replaced the question. No timer or delayed navigation is involved.
document.addEventListener('click',event=>{
  if(event.detail>1&&event.target.closest('button')){
    event.preventDefault();event.stopImmediatePropagation();
  }
},true);
function ChoiceCard(title,sub,selected,value,multi=false){
  return `<button type="button" class="opt ${selected?'sel':''}" aria-pressed="${selected}" data-value="${esc(value)}">
    <span class="${multi?'check':'radio'}" aria-hidden="true">${multi&&selected?'✓':''}</span>
    <span class="opttext"><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:''}</span>
  </button>`;
}
function QuestionTitle(question,index,total){
  return `<div class="num">${String(index+1).padStart(2,'0')} / ${total}</div>
    <h1 class="qtitle" tabindex="-1">${esc(question.title)}</h1>${question.help?`<p class="qhelp">${esc(question.help)}</p>`:''}`;
}

// Thumbnail URLs belong to the current render, never to persisted draft data.
let thumbnailGeneration=0;
const thumbnailURLs=[];
function clearThumbnails(){
  thumbnailGeneration++;
  thumbnailURLs.splice(0).forEach(url=>URL.revokeObjectURL(url));
}
async function showThumbnails(root,readFiles){
  const generation=thumbnailGeneration;
  const images=[...root.querySelectorAll('[data-thumbnail]')];
  if(!images.length)return;
  try{
    const files=await readFiles();
    if(generation!==thumbnailGeneration)return;
    images.forEach(image=>{
      const file=files.find(file=>file.id===image.dataset.thumbnail);
      if(!file?.blob)return;
      const url=URL.createObjectURL(file.blob);thumbnailURLs.push(url);image.src=url;
    });
  }catch(error){/* Metadata and delete controls remain usable if previews fail. */}
}
window.addEventListener('pagehide',clearThumbnails);
// The reference uses data attributes as event hooks. Normalize all compact
// choices and field labels here so every page shares the same accessible UI.
function enhanceControls(root){
  root.querySelectorAll('.chip,.inlineChoice,.cityBtn').forEach(button=>{
    const multi=['family','place','hotelPref','diet','rule'].some(key=>key in button.dataset);
    button.classList.add(multi?'multiChoice':'singleChoice');
    button.setAttribute('aria-pressed',button.classList.contains('sel'));
  });
  root.querySelectorAll('input:not([type="file"]),textarea').forEach((field,index)=>{
    if(!field.id)field.id=`answer-${index}`;
    const caption=field.closest('.field')?.querySelector('.label');
    if(caption){
      const label=document.createElement('label');
      label.className=caption.className;label.htmlFor=field.id;label.textContent=caption.textContent;
      caption.replaceWith(label);
    }else field.setAttribute('aria-label',field.placeholder||tr('accessibility.enter_your_answer'));
  });
  root.querySelectorAll('.fileInput').forEach(field=>field.setAttribute('aria-label',tr('upload.accessible',{name:field.closest('.uploadGroup').querySelector('.uploadGroupTitle b').textContent})));
}
