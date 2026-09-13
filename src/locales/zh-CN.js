import { loadGzipBundledModule } from '../load-gzip-module.js';
const mod = await loadGzipBundledModule(new URL('../_parts/locale-zh-CN.gz.b64', import.meta.url).href);
export default mod.default;
