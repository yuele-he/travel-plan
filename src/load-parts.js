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

export async function loadBundledModule(baseUrl, count, transform = s => s) {
  const encodedParts = [];
  for (let i = 1; i <= count; i++) {
    const url = `${baseUrl}.${i}.b64`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    encodedParts.push((await r.text()).trim());
  }

  // The repository parts were encoded independently. Decoding each part first
  // avoids invalid base64 caused by padding characters in the middle.
  let bytes;
  try {
    bytes = joinBytes(encodedParts.map(decodeBase64Bytes));
  } catch (partError) {
    // Fallback for a future bundle that is split from one continuous base64 string.
    bytes = decodeBase64Bytes(encodedParts.join(''));
  }

  const source = transform(new TextDecoder().decode(bytes));
  const blobUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    return await import(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
