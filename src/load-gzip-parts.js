export async function loadGzipParts(baseUrl, count) {
  let b64 = '';
  for (let i = 1; i <= count; i++) {
    const r = await fetch(`${baseUrl}.${i}.b64`);
    if (!r.ok) throw new Error(`Failed to load gzip part ${i}: ${r.status}`);
    b64 += (await r.text()).trim();
  }
  const compressed = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  if (!('DecompressionStream' in globalThis)) throw new Error('DecompressionStream is not supported');
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source = await new Response(stream).text();
  const blobUrl = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
  try { return await import(blobUrl); }
  finally { URL.revokeObjectURL(blobUrl); }
}
