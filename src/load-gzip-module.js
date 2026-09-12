export async function loadGzipBundledModule(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
  const b64 = (await r.text()).trim();
  const compressed = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  if (!('DecompressionStream' in globalThis)) {
    throw new Error('This browser does not support DecompressionStream');
  }
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source = await new Response(stream).text();
  const blobUrl = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
  try {
    return await import(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
