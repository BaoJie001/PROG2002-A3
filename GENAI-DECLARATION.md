# GenAI Use Declaration — PROG2002 Assessment 3

**Student:** Jie Bao (包杰) — _(add your student ID here)_
**Unit:** PROG2002 Web Development II · Assessment 3 (Group of two)
**GenAI Use Level:** Level 2 — Purpose-Specific GenAI Use Permitted

> This declaration is personal. Each team member submits their own copy with
> their own name on it, even though the code in the three zip files is shared.

---

## Statement (as required by the Assessment Brief)

> I acknowledge that I have used GenAI tools to complete this assessment. I
> used **WorkBuddy (an AI coding assistant)** to:
>
> * **brainstorm** the schema change needed for event registration and the set
>   of REST endpoints that would serve both websites;
> * **check grammar and clarity** in the code comments, the README and the
>   deployment notes;
> * **format** the documentation (headings, tables, code blocks);
> * **review** my own code for bugs — for example the date-handling code that
>   had to use local calendar dates instead of `toISOString()`, and the
>   read-then-write sequence in the delete rule;
>
> within the parameters outlined in the Assessment Brief and by the Unit
> Assessor.

## What the AI did not do

The Assessment Brief says GenAI must not be used to *create the report* or to
*generate code that is copied and pasted without understanding*. Accordingly:

* every design decision recorded in `docs/` was made and checked by me — the
  `UNIQUE (event_id, email)` rule, the 409 response on a blocked delete, the
  decision to proxy Open-Meteo through our own API, and the choice of
  `?status=all&period=all` for the admin list;
* I can explain the files I own line by line (the database, the event CRUD
  endpoints, the client-site shell, home and search pages, and the admin list
  and new-event screens), and I am prepared to demonstrate that in an interview;
* the sample data, the wording of the site and the structure of my video all
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
