# Versioning

## Canonical questionnaire

`questionnaire-v4/` is the single canonical implementation of the travel questionnaire.

All questionnaire fixes, UI changes, translations, validation changes, and future backend integration should be made against this directory.

Public test URL:

https://yuele-he.github.io/travel-plan/questionnaire-v4/

## Canonical Final Guide renderer

`guide/` is the single public Final Guide renderer.

Do not create routine parallel copies such as:

```text
guide-v2/
guide-final/
guide-new/
guide-fixed/
```

Normal fixes should update `guide/`.

A new public Guide path should be created only for an intentional incompatible browser contract, not for ordinary UI changes.

## Public/private boundary

This repository is a browser-delivery surface.

Private planning source is versioned separately and must not be copied into this public repository. This includes:

- Travel Planner Skill source;
- private planning schemas and algorithms;
- canonical customer trip artifacts;
- destination-research working files;
- credentials and secrets.

The public `guide/` contract is a **display-ready Guide View Model**. The browser renderer should not calculate private planning decisions that can be calculated server-side.

If a new planner/schema version changes the Guide View Model, update the renderer compatibly where possible. Only introduce a new incompatible Guide contract when backward compatibility is not practical.

## Temporary deployments

Temporary test deployments may be created for short-lived debugging, but they should not become separately maintained product versions.

Once verified, either:

- merge the change into the canonical directory; or
- delete the temporary deployment.

## Naming rule

Avoid parallel folders such as:

```text
questionnaire-final/
questionnaire-final2/
questionnaire-v4-new/
questionnaire-v4-fixed/
guide-final/
guide-final2/
```

## Current persistence boundary

The questionnaire currently stores drafts and screenshots in the customer's browser. It does not yet submit orders to a server.

The Final Guide currently has a synthetic public demo View Model. Real customer canonical trip data must not be committed to GitHub.

The backend phase will add:

- CloudBase-backed order links;
- server-side drafts/uploads;
- private canonical trip data;
- authenticated/capability-token Guide View Model delivery;
- admin order views;
- AI export packages.

## Deployment rule

`main` should remain deployable.

Any file committed to `main` must be assumed publicly inspectable when delivered through GitHub Pages. No secret may rely on obscurity, minification, or an unlinked URL.
