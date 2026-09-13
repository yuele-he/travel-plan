import zhCN from './zh-CN.js';

// Temporary fallback while the larger English and Traditional Chinese bundles
// finish uploading. Keeping all keys available prevents the app from failing
// during friend testing; the language switch can be restored to native copies
// once those bundles are committed.
export const LOCALES = {
  'zh-CN': zhCN,
  'zh-Hant': zhCN,
  en: zhCN,
};
