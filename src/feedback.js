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

export async function submitFeedback({ endpoint, payload }) {
  if (endpoint) {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (r.ok) return { sent: true, copied: false };
    } catch (_) {}
  }
  await writeClipboard(JSON.stringify(payload, null, 2));
  return { sent: false, copied: true };
}

export async function shareResult({ title, text, url }) {
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
