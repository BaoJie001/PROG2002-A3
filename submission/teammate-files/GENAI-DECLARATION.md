# GenAI Use Declaration — PROG2002 Assessment 3

**Student:** Chengyu Gao
**Student ID:** 24832054
**Unit:** PROG2002 Web Development II · Assessment 3 (Group of two)
**GenAI Use Level:** Level 2 — Purpose-Specific GenAI Use Permitted

> This declaration is personal. Each team member submits their own copy with
> their own name on it, even though the code in the three zip files is shared.

---

## Statement (as required by the Assessment Brief)

> I acknowledge that I have used GenAI tools to complete this assessment. I
> used **WorkBuddy (an AI coding assistant)** to:
>
> * **brainstorm** the rules the booking endpoint needed — what should happen
>   when the same person books twice, when the event is suspended, and when it
>   has already finished;
> * **check grammar and clarity** in the code comments, the Postman
>   descriptions and the notes I wrote for the video;
> * **format** the documentation (headings, tables, code blocks);
> * **review** my own code for bugs — for example the booking-date rule, which
>   had to reject a date later than either today or the event date, and the
>   status filter on the admin list, which had to count suspended events
>   separately from past ones;
>
> within the parameters outlined in the Assessment Brief and by the Unit
> Assessor.

## What the AI did not do

The Assessment Brief says GenAI must not be used to *create the report* or to
*generate code that is copied and pasted without understanding*. Accordingly:

* every design decision in the parts I own was made and checked by me — the
  three 409 responses from the booking endpoint, caching the Open-Meteo forecast
  for ten minutes instead of calling it on every page load, and sorting the
  attendee list by the date the tickets were bought;
* I can explain my files line by line (`api/routes/registrations.js`,
  `api/routes/weather.js`, `api/routes/categories.js`,
  `api/routes/organisations.js`, the event detail page, the register page, the
  event card, the admin edit screen and the shared event form), and I am
  prepared to demonstrate that in an interview;
* the Postman collection, the sample bookings and the wording of my video all
  reflect my own choices about the case study.

## Evidence

Screenshots of the working conversation (prompts and responses together) are
kept in `docs/genai-screenshots/`. Each one shows the question I asked and the
answer I received, so the use described above can be verified.

## GenAI use level in this unit

Level 2 permits GenAI for brainstorming, grammar checking, paraphrasing,
formatting and layout templates. It does **not** permit GenAI to create the
report or to generate code that is pasted in without understanding. My use
stayed inside those bounds; the work I submit is mine and I can defend it.
