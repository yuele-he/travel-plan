import { loadGzipParts } from '../load-gzip-parts.js';
const mod = await loadGzipParts(new URL('../_parts/locale-en.gz', import.meta.url).href, 3);
export default mod.default;
