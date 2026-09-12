export async function loadBundledModule(baseUrl, count, transform = s => s) {
  let b64 = '';
  for (let i = 1; i <= count; i++) {
    const url = `${baseUrl}.${i}.b64`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    b64 += (await r.text()).trim();
  }
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const source = transform(new TextDecoder().decode(bytes));
  const blobUrl = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
  try {
    return await import(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
