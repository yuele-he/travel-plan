import { loadBundledModule } from '../load-parts.js';
const mod = await loadBundledModule(new URL('../_parts/locale-zh-CN', import.meta.url).href, 4);
export default mod.default;
