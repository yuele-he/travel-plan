# Privacy architecture

This repository is a **public delivery surface**, not the home for private planning logic.

## Public browser layer

The public repository may contain only files that a customer's browser must receive, for example:

- questionnaire UI;
- Final Guide renderer UI;
- CSS and presentation-only JavaScript;
- non-sensitive synthetic demo data;
- public runtime configuration such as an API base URL.

Anything delivered to a browser can be inspected. Minification or obfuscation is not a security boundary.

## Private layer

Do **not** commit the following to this repository:

- Travel Planner Skill source;
- private schemas and planning algorithms;
- destination-research working notes;
- canonical customer artifacts such as trip_profile, planning_facts, candidate_experiences, customer_choices, preference_updates, booking_requirements, customer_actions, fixed_commitments, experience_guidance, day_carry, itinerary, or qa_report;
- customer screenshots, identity information, booking confirmations, or payment information;
- API keys, CloudBase secrets, GitHub tokens, service credentials, or private repository URLs containing credentials.

These belong in a private source repository and/or private backend storage.

## Final Guide production flow

Production should use this boundary:

```text
private planner / backend
        |
        | research + planning + QA
        v
private canonical artifacts
        |
        | server-side transformation
        v
display-ready Guide View Model
        |
        | authenticated / capability-token API
        v
public /guide/ renderer
```

The public renderer should not reproduce planning decisions. In particular, lifecycle state, leave-by times, restaurant/fallback selection, visual timing, and other planning decisions should be calculated privately and returned as display-ready fields.

## Customer link

Prefer an opaque, random access token. For a static public frontend, a URL fragment can keep the token out of normal HTTP requests:

```text
https://yuele-he.github.io/travel-plan/guide/#/<opaque-token>
```

The renderer sends that token to the backend in an Authorization header.

Do not place raw customer IDs, email addresses, phone numbers, booking IDs, or predictable order numbers in a public URL.

## Current demo

`guide/demo.json` is synthetic product-demo data only. It must never be replaced with a real customer's canonical trip data.

## Repository visibility

If the owner uses a GitHub plan that supports GitHub Pages from private repositories, this repository can later be made private while the Pages site remains public. Otherwise keep this repository deployment-only and move all real source development to a separate private repository.
