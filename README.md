# Travel Persona / 旅游人设测试

Static, framework-free travel-personality quiz. Current product version: **V2.1 repo edition**.

## Why this repo exists

The earlier prototype was a single HTML file. This version keeps the same product logic but moves it into a normal repository structure so we can iterate without passing ZIPs around.

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
├─ _headers
└─ README.md
```

## Local development

ES modules need an HTTP server; don't double-click `index.html` from `file://`.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Debug mode

Normal friend link:

```text
https://your-site.example/
```

Developer view:

```text
https://your-site.example/?debug=1
```

Only debug mode shows scoring details, dynamic-question path, contradiction state, and Top persona data.

## Feedback

The result page has a lightweight accuracy feedback card. By default, submitting feedback copies a structured JSON payload so a friend can paste it back to you in WeChat/WhatsApp/etc.

If you later create your own endpoint, put it in `src/config.js` as `FEEDBACK_ENDPOINT`; the same form will POST JSON there instead.

## Suggested Git workflow

Use `main` for the friend-testing version and a `dev` branch for experiments.

## Deployment

This repository is public for friend testing. The current site is entirely client-side, so source code and quiz logic delivered to the browser can be inspected.

For a more defensible public launch, move scoring weights, adaptive question selection, and conflict resolution to a private API/Worker.
