import { loadGzipParts } from '../load-gzip-parts.js';
const mod = await loadGzipParts(new URL('../_parts/locale-zh-CN2', import.meta.url).href, 11);
export default mod.default;
