import { loadGzipParts } from './load-gzip-parts.js';
const mod = await loadGzipParts(new URL('./_parts/data.gz', import.meta.url).href, 3);
export const DATA = mod.DATA;
