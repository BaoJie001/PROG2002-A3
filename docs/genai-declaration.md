# GenAI Use Declaration — Assessment 3

**Level 2 — Purpose-Specific GenAI Use Permitted.**

## Statement to include in the submission

> I acknowledge that I have used GenAI tools to complete this assessment. I
> used **WorkBuddy (an AI coding assistant)** to:
>
> * **brainstorm** the schema change needed for event registration and the set
>   of REST endpoints that would serve both websites;
> * **check grammar and clarity** in the code comments, the README and the
>   deployment notes;
> * **format** the documentation (headings, tables, code blocks) and lay out the
>   report pages;
> * **review** my own code for bugs — for example the date-handling code that
>   had to use local calendar dates instead of `toISOString()`, and the
>   read-then-write sequence in the delete rule.
>
> within the parameters outlined in the Assessment Brief and by the Unit
> Assessor.

## What the AI did *not* do

The Assessment Brief says GenAI must not be used to *create the report* or to
*generate code that is copied and pasted without understanding*. Accordingly:

* every design decision recorded here was made and checked by me — the
  `UNIQUE (event_id, email)` rule, the 409 response on a blocked delete, the
  decision to proxy Open-Meteo through our own API, and the choice of
  `?status=all&period=all` for the admin list;
* I can explain any file in this repository line by line, and I am prepared to
  demonstrate that in an interview;
* the sample data, the wording of the site and the structure of the video all
  reflect my own choices about the case study.

## Evidence

Screenshots of the working conversation (prompts and responses together) are
kept in `docs/genai-screenshots/`. Each one shows the question I asked and the
answer I received, so the use above can be verified.

## Chat log summary

| # | My request | What came back | How it was used |
|---|---|---|---|
| 1 | "Read the A3 brief and tell me what is required" | A breakdown of the six parts and the rubric | Planning; confirmed the Angular route for the higher grade band |
| 2 | "Design the registrations table" | Schema with FK, UNIQUE and CHECK constraints | Implemented in `charityevents-db.sql`, reviewed line by line |
| 3 | "Add CRUD endpoints and keep the delete safe" | POST/PUT/DELETE with validation and a 409 guard | Implemented in `api/routes/events.js`; tested with Postman |
| 4 | "Build the client site in Angular 22 + TypeScript" | Component/service/model scaffolding | Rewritten into the final pages; every file read and adjusted |
| 5 | "Build the admin site" | List/new/edit/delete screens | Same process |
| 6 | "Weather API integration" | Open-Meteo call with caching and graceful failure | Implemented in `api/routes/weather.js` |
| 7 | "Format docs / check grammar" | Edited README, deployment guide, video plan | Accepted as formatting and wording help |
