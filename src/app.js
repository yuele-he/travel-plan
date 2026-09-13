import { loadBundledModule } from './load-parts.js';

const here = import.meta.url;
const abs = rel => new URL(rel, here).href;

await loadBundledModule(abs('./parts/app'), 3, source =>
  source
    .replace("from './data.js'", `from '${abs('./data.js')}'`)
    .replace("from './locales/index.js'", `from '${abs('./locales/index.js')}'`)
    .replace("from './config.js'", `from '${abs('./config.js')}'`)
    .replace("from './feedback.js'", `from '${abs('./feedback.js')}'`)
);
