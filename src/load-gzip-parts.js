function decodeBase64Bytes(value) {
  const clean = value.replace(/\s+/g, '');
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function joinBytes(chunks) {
  const total = chunks.reduce((n, chunk) => n + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export async function loadGzipParts(baseUrl, count) {
  const encodedParts = [];
  for (let i = 1; i <= count; i++) {
    const url = `${baseUrl}.${i}.b64`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed to load gzip part ${i}: ${r.status}`);
    encodedParts.push((await r.text()).trim());
  }

  let compressed;
  try {
    compressed = joinBytes(encodedParts.map(decodeBase64Bytes));
  } catch (partError) {
    compressed = decodeBase64Bytes(encodedParts.join(''));
  }

  if (!('DecompressionStream' in globalThis)) {
    throw new Error('This browser does not support DecompressionStream. Please use a current Safari, Chrome, or Edge browser.');
  }

  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source = await new Response(stream).text();
  const blobUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    return await import(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
