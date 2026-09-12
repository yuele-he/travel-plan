export const APP_VERSION = '2.1.0';
// Leave empty while testing with friends. If you later add your own endpoint,
// feedback will POST JSON to it; otherwise it is copied for the tester to send you.
export const FEEDBACK_ENDPOINT = '';
export const DEBUG_MODE = new URLSearchParams(location.search).get('debug') === '1';
