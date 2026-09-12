# Architecture

## Current testing architecture

Browser-only static app:

1. `data.js` stores persona/question evidence.
2. `app.js` runs adaptive question selection, scoring, contradiction handling, and rendering.
3. locale modules change presentation only; IDs and scoring stay shared.
4. `feedback.js` contains only tester feedback/share transport helpers.

This intentionally keeps deployment cheap and iteration fast while the quiz is being validated.

## Before public marketing

Move these pieces server-side:

- scoring weights
- adaptive next-question selection
- contradiction/conflict resolution
- final persona ranking
- calibration data

The client should eventually send answer IDs and receive the next question/result from an API. That won't stop someone from copying visible questions, but it prevents trivial extraction of the full decision model.
