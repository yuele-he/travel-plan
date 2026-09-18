# Travel Plan

This repository is the **public browser delivery layer** for the travel-planning product.

It contains interfaces that customers are allowed to receive in their browsers. Private planning logic, customer canonical data, research work, credentials, and the Travel Planner Skill must stay outside this public repository.

See [docs/PRIVACY_ARCHITECTURE.md](docs/PRIVACY_ARCHITECTURE.md).

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

## Final Guide

The customer-facing permanent guide renderer lives at:

```text
guide/
```

Public URL after deployment:

https://yuele-he.github.io/travel-plan/guide/

The public Guide is intentionally a **thin renderer**. It should receive a display-ready Guide View Model from a private backend.

The browser must not contain the private planning engine. In particular, these decisions should be calculated server-side before the page receives them:

- booking lifecycle state;
- fixed-transport leave-by time;
- restaurant primary/backup selection;
- fallback selection;
- photo/visual timing;
- routing and planning QA decisions.

`guide/demo.json` contains synthetic product-demo data only.

## Privacy boundary

Do not commit any of the following here:

- Travel Planner Skill or private schemas;
- trip_profile / planning_facts / candidate_experiences / customer_choices;
- preference_updates / booking_requirements / customer_actions;
- fixed_commitments / experience_guidance / day_carry / itinerary / qa_report;
- customer screenshots, identity or booking records;
- API keys, CloudBase credentials, GitHub tokens, or other secrets.

The production flow is:

```text
private planner + private backend
        ↓
private canonical trip data
        ↓
server-side Guide View Model
        ↓
public /guide/ renderer
```

Anything sent to a browser can be inspected. Repository privacy, backend separation, and secret handling are the actual security boundaries; minification is not.

## Existing Travel Persona prototype

The repository root still contains the earlier **Travel Persona / 旅游人设测试** frontend.

```text
travel-plan/
├─ index.html
├─ questionnaire-v4/
├─ guide/
├─ src/
├─ styles/
├─ docs/
├─ VERSIONING.md
└─ README.md
```

## Next product phase

- Tencent CloudBase backend;
- order creation and permanent customer links;
- server-side draft persistence;
- server-side screenshot storage;
- private canonical planning artifacts;
- Final Guide View Model API;
- admin order view;
- one-click AI export package.

See [VERSIONING.md](VERSIONING.md) for the repository versioning rule.

## Local development

ES modules and JSON fetches need an HTTP server; do not rely on `file://`.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/questionnaire-v4/
http://localhost:8000/guide/
```

## Suggested Git workflow

Use `main` for the deployable public version and short-lived branches for experiments. Do not create parallel canonical questionnaire or Guide folders for routine fixes.
