import { loadBundledModule } from './load-parts.js';
const mod = await loadBundledModule(new URL('./_parts/data', import.meta.url).href, 6);
export const DATA = mod.DATA;
