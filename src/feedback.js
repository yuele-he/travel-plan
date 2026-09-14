async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

export async function shareTest({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { shared: true, copied: false };
    } catch (err) {
      if (err?.name === 'AbortError') return { shared: false, copied: false, aborted: true };
    }
  }
  await writeClipboard(`${text}\n${url}`);
  return { shared: false, copied: true };
}

function wrapText(ctx, value, maxWidth) {
  const lines = [];
  for (const paragraph of String(value ?? '').split('\n')) {
    let line = '';
    for (const char of paragraph) {
      const candidate = line + char;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line.trim());
        line = char;
      } else {
        line = candidate;
      }
    }
    if (line || !paragraph) lines.push(line.trim());
  }
  return lines;
}

function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawWrapped(ctx, value, x, y, maxWidth, font, color, lineHeight) {
  ctx.font = font;
  ctx.fillStyle = color;
  const lines = wrapText(ctx, value, maxWidth);
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

function makeCanvas(payload) {
  const width = 900;
  const pad = 64;
  const content = width - pad * 2;
  const measure = document.createElement('canvas').getContext('2d');
  const sectionGap = 28;
  let height = 86;

  const measureBlock = (value, font, lineHeight, gap = 0) => {
    measure.font = font;
    height += wrapText(measure, value, content).length * lineHeight + gap;
  };
  height += 40;
  measureBlock(payload.appName, '700 18px sans-serif', 24, 20);
  measureBlock(payload.resultLabel, '700 22px sans-serif', 30, 15);
  measureBlock(payload.name, '800 48px sans-serif', 58, 22);
  measureBlock(payload.shareLine, '600 27px sans-serif', 40, 18);
  height += 46 + (payload.badges || []).length * 46;

  const addSection = (title, items, itemFont, itemLine, gap) => {
    height += sectionGap + 38;
    measureBlock(title, '800 28px sans-serif', 34, 14);
    for (const item of items) measureBlock(item, itemFont, itemLine, gap);
  };
  addSection(payload.storyTitle, payload.story, '400 22px sans-serif', 34, 16);
  height += sectionGap + 38;
  measureBlock(payload.traitsTitle, '800 28px sans-serif', 34, 14);
  for (const trait of payload.traits) {
    measureBlock(trait.name, '750 22px sans-serif', 30, 4);
    measureBlock(trait.desc, '400 19px sans-serif', 29, 18);
  }
  height += sectionGap + 38;
  measureBlock(payload.dimensionsTitle, '800 28px sans-serif', 34, 24);
  height += payload.dimensions.length * 100;
  height += sectionGap + 38;
  measureBlock(payload.adviceTitle, '800 28px sans-serif', 34, 18);
  for (const item of payload.advice) measureBlock(`· ${item}`, '400 21px sans-serif', 32, 12);
  height += 80;

  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = Math.ceil(height);
  const ctx = canvas.getContext('2d'); ctx.textBaseline = 'top';
  ctx.fillStyle = '#f6f6f3'; ctx.fillRect(0, 0, width, height);
  roundedRect(ctx, 22, 22, width - 44, height - 44, 32, '#ffffff');

  let y = 70;
  const text = (value, font, color, lineHeight, gap = 0) => { y = drawWrapped(ctx, value, pad, y, content, font, color, lineHeight) + gap; };
  const rule = () => { ctx.strokeStyle = '#e9e9e4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(width - pad, y); ctx.stroke(); y += 28; };
  text(payload.appName, '700 18px sans-serif', '#777772', 24, 20);
  text(payload.resultLabel, '700 22px sans-serif', '#777772', 30, 14);
  text(payload.name, '800 48px sans-serif', '#191919', 58, 22);
  text(payload.shareLine, '600 27px sans-serif', '#2c2c29', 40, 18);
  for (const badge of payload.badges || []) { ctx.font = '600 17px sans-serif'; const w = Math.min(content, ctx.measureText(badge).width + 30); roundedRect(ctx, pad, y, w, 34, 17, '#f0f0ec'); ctx.fillStyle = '#55534f'; ctx.fillText(badge, pad + 15, y + 7); y += 46; }
  const section = title => { rule(); text(title, '800 28px sans-serif', '#191919', 34, 14); };
  section(payload.storyTitle);
  for (const item of payload.story) text(item, '400 22px sans-serif', '#2c2c29', 34, 16);
  section(payload.traitsTitle);
  for (const trait of payload.traits) { text(trait.name, '750 22px sans-serif', '#191919', 30, 4); text(trait.desc, '400 19px sans-serif', '#6a6963', 29, 18); }
  section(payload.dimensionsTitle);
  for (const dim of payload.dimensions) { text(dim.name, '750 21px sans-serif', '#191919', 28, 12); const trackY = y + 4; ctx.fillStyle = '#ecece7'; ctx.beginPath(); ctx.roundRect(pad, trackY, content, 12, 6); ctx.fill(); ctx.fillStyle = '#282826'; ctx.beginPath(); ctx.arc(pad + content * dim.score / 100, trackY + 6, 10, 0, Math.PI * 2); ctx.fill(); y += 34; text(`${dim.left}                                      ${dim.right}`, '400 16px sans-serif', '#777772', 22, 22); }
  section(payload.adviceTitle);
  for (const item of payload.advice) text(`· ${item}`, '400 21px sans-serif', '#2c2c29', 32, 12);
  rule(); ctx.font = '600 17px sans-serif'; ctx.fillStyle = '#9a9993'; ctx.fillText(payload.footer, pad, y);
  return canvas;
}

function canvasBlob(canvas) { return new Promise(resolve => canvas.toBlob(resolve, 'image/png')); }
function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

export async function openResultImage({ payload, filename, labels }) {
  const canvas = makeCanvas(payload);
  const blob = await canvasBlob(canvas);
  const url = URL.createObjectURL(blob);
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {position:'fixed',inset:'0',zIndex:'50',background:'rgba(25,25,25,.82)',padding:'20px',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px',overflow:'auto'});
  const image = document.createElement('img'); image.src = url; image.alt = payload.name; image.style.cssText = 'display:block;max-width:100%;width:min(520px,100%);height:auto;border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.25)';
  const note = document.createElement('div'); note.textContent = labels.longPress; note.style.cssText = 'color:#fff;font-size:13px;text-align:center;line-height:1.5';
  const buttons = document.createElement('div'); buttons.style.cssText = 'display:flex;gap:8px;width:min(520px,100%)';
  const makeButton = (label, background = '#fff', color = '#222') => { const b=document.createElement('button'); b.textContent=label; b.style.cssText=`flex:1;min-height:48px;border:0;border-radius:14px;background:${background};color:${color};font:700 15px sans-serif`; return b; };
  const save = makeButton(labels.imageSave); save.onclick=()=>downloadBlob(blob,filename);
  const close = makeButton(labels.close,'#444','#fff'); close.onclick=()=>{URL.revokeObjectURL(url);overlay.remove()};
  buttons.append(save,close);
  const file = new File([blob],filename,{type:'image/png'});
  if (navigator.canShare && navigator.canShare({files:[file]})) { const share = makeButton(labels.imageShare,'#e9e9e4','#222'); share.onclick=async()=>{try{await navigator.share({files:[file],title:payload.name})}catch(err){if(err?.name!=='AbortError') downloadBlob(blob,filename)}}; buttons.insertBefore(share,close); }
  overlay.append(image,note,buttons); document.body.appendChild(overlay);
}
