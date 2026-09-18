# Versioning

## Canonical questionnaire

`questionnaire-v4/` is the single canonical implementation of the travel questionnaire.

All questionnaire fixes, UI changes, translations, validation changes, and future backend integration should be made against this directory.

Public test URL:

https://yuele-he.github.io/travel-plan/questionnaire-v4/

## Temporary deployments

Temporary test deployments may be created for short-lived debugging, but they should not become separately maintained questionnaire versions.

Once a test has been verified, either:

- merge the change into `questionnaire-v4/`; or
- delete the temporary deployment.

## Naming rule

Avoid parallel folders such as:

```text
questionnaire-final/
questionnaire-final2/
questionnaire-v4-new/
questionnaire-v4-fixed/
```

A new versioned folder should be created only when there is an intentional product/schema version change that cannot remain compatible with the current canonical implementation.

## Current persistence boundary

V4 currently stores drafts and screenshots in the customer's browser. It does not yet submit orders to a server.

The next product phase will add CloudBase-backed order links, server-side drafts/uploads, admin order views, and AI export packages without creating another parallel questionnaire frontend.
