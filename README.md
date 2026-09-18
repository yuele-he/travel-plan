# Travel Plan

This repository contains travel-related frontend experiments.

## Current canonical travel questionnaire

The actively maintained travel-intake questionnaire is:

```text
questionnaire-v4/
```

Public test URL:

https://yuele-he.github.io/travel-plan/questionnaire-v4/

Supported languages:

- 简体中文
- 繁體中文
- English

Current V4 behavior:

- questionnaire logic and branching are shared across all three languages;
- answers and uploaded screenshots are currently stored in the customer's browser only;
- there is no server-side order submission yet;
- the current export/download behavior is for testing.

Next product phase:

- Tencent CloudBase backend;
- order creation and permanent customer links;
- server-side draft persistence;
- server-side screenshot storage;
- admin order view;
- one-click AI export package.

See [VERSIONING.md](VERSIONING.md) for the repository versioning rule.

---

## Existing travel-persona prototype

The repository root also contains the earlier **Travel Persona / 旅游人设测试** frontend.

The earlier prototype was a single HTML file. The repo edition keeps the same product logic in a normal repository structure:

```text
travel-plan/
├─ index.html
├─ src/
│  ├─ app.js
│  ├─ config.js
│  ├─ feedback.js
│  ├─ data.js
│  └─ locales/
│     ├─ zh-CN.js
│     ├─ zh-Hant.js
│     ├─ en.js
│     └─ index.js
├─ styles/main.css
├─ docs/
├─ questionnaire-v4/
├─ _headers
├─ VERSIONING.md
└─ README.md
```

## Local development

ES modules need an HTTP server; don't double-click `index.html` from `file://`.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

For the questionnaire:

```text
http://localhost:8000/questionnaire-v4/
```

## Debug mode

Travel-persona normal friend link:

```text
https://your-site.example/
```

Developer view:

```text
https://your-site.example/?debug=1
```

Only debug mode shows scoring details, dynamic-question path, contradiction state, and Top persona data.

## Feedback

The travel-persona result page has a lightweight accuracy feedback card. By default, submitting feedback copies a structured JSON payload so a friend can paste it back to you in WeChat/WhatsApp/etc.

If you later create your own endpoint, put it in `src/config.js` as `FEEDBACK_ENDPOINT`; the same form will POST JSON there instead.

## Suggested Git workflow

Use `main` for the friend-testing version and a `dev` branch for experiments.

## Deployment

This repository is public for friend testing. The current questionnaire and travel-persona pages are client-side, so frontend source delivered to the browser can be inspected.

Server-side order persistence and private planning workflows will be added separately in the backend phase.
