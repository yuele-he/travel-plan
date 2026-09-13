import { loadGzipParts } from '../load-gzip-parts.js';
const mod = await loadGzipParts(new URL('../_parts/locale-zh-Hant7', import.meta.url).href, 3);
export default mod.default;
