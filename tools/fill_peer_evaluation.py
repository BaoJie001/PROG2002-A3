"""Fill the unit's Peer Evaluation form for each student.

Both of us are happy with the other's contribution, so every criterion is
rated 5 (strongly agree) for both columns. Each student gets their own file,
written in the first person, with their own name in the first column.

Usage:  python fill_peer_evaluation.py
Output: D:\\PROG2002-A3\\private\\<name>-peer-evaluation.docx
"""

import os
import shutil

from docx import Document
from docx.shared import Pt

TEMPLATE = r"C:\Users\包杰\Desktop\广西科技\2026-2027上学期\梁\Peer Evaluation form.docx"
OUT_DIR = r"D:\PROG2002-A3\private"

ME = "Chengyu Gao"
HIM = "Jie Bao"

# --------------------------------------------------------------------------
# What each of us actually did, written from that person's own point of view.
# --------------------------------------------------------------------------
CHENGYU_OWN = (
    "I built everything that happens after somebody decides to attend. On the API: "
    "POST /api/registrations with its eight-field validation and the three ways a "
    "booking is refused (duplicate email, finished event, suspended event), all "
    "answered with 409 rather than 400 because in each case the request is fine and "
    "it is the state of the world that will not allow it; and the Open-Meteo weather "
    "proxy, which runs on our server so the third party never reaches the browser and "
    "the page can degrade instead of failing. On the public site: the event detail "
    "page with its \"who is going\" list sorted by purchase date, and the registration "
    "form as a Reactive Form with a message under each field. On the staff site: the "
    "new-event and edit-event screens sharing one form component, so the validation "
    "rules exist once. I also wrote the Postman collection - 23 requests including the "
    "ones that must fail - and deployed the whole stack to my own cPanel account."
)

JIE_OWN = (
    "I built what everything else stands on: the registrations table with its foreign "
    "key and UNIQUE (event_id, email), and the event CRUD endpoints. The one I spent "
    "longest on was DELETE - an event with bookings cannot be deleted, and I enforced "
    "it in two places, in the endpoint so the staff member gets a sentence they can act "
    "on, and in the foreign key so the rule still holds if something later goes around "
    "my endpoint. On the public site I built the Angular shell, the typed models, the "
    "service layer, and the Home and Search pages with filters that stay in the URL so "
    "a result can be shared. On the staff site I built the event list and its delete "
    "flow. I set up the repository and wrote the deployment guide, and I diagnosed the "
    "three failures we hit while deploying: the emoji icons arriving as question marks, "
    "the staff site serving a blank page, and the API connecting as the wrong user."
)

# --- the three answers, written twice, once from each point of view ---------
DYNAMICS = {
    ME: [
        "We split the work by layer rather than by page, which was the right call: he "
        "owned the database and the event endpoints, I owned registration, the weather "
        "feature and the staff forms. Because the API contract was agreed first - one "
        "endpoint per resource, JSON in and out, and a defined shape for "
        "/api/events/:id - we could build our halves at the same time without waiting "
        "on each other. The one thing I would change is agreeing the branch and "
        "commit-message rules at the first meeting rather than after the first merge.",

        "The most valuable thing he did was write the deployment down while it was still "
        "fresh. My deployment then took an afternoon instead of the day his took, and "
        "the one failure I hit - \"Access denied for user root@localhost\" - was already "
        "described in his notes, so I knew to look at whether the environment variables "
        "had actually been applied. Nothing was detrimental. The only friction was that "
        "we shared a computer for part of the work, which made \"who committed what\" "
        "harder to answer than it should have been; we fixed it by agreeing that a "
        "commit is only ever attributed to the person who wrote the code.",

        "That shared work needs a shared record. Committing in small steps with a message "
        "that says why, and never attributing someone else's code to yourself, turned "
        "\"who did what\" from an argument into something we could both point at. Next "
        "time I would also deploy earlier: leaving it until the end made the last days "
        "more stressful than they needed to be, because a deployment problem found early "
        "is a bug, and the same problem found on the last night is a crisis.",
    ],
    HIM: [
        "Effectively, and better than I expected for a team of two. The reason is that "
        "we divided by layer instead of by page: I took the database and the event "
        "endpoints, he took registration, the weather feature and the staff forms. "
        "Neither of us had to wait for the other's page to exist, because the API "
        "contract was agreed first. What I would do differently is fix the commit "
        "conventions at the first meeting - for a while we were committing from the same "
        "machine, which muddied who had done what, and we only sorted it out near the end.",

        "The most valuable habit of his was testing the cases that are supposed to fail. "
        "A collection that only proves the happy path proves nothing, and his includes "
        "the 400, 404 and 409 paths, which is how we know the delete rule and the "
        "registration refusals actually work rather than merely look right in the "
        "browser. He also checked his own deployment after it was live instead of "
        "assuming it still worked, which is what caught the environment variable "
        "problem. Nothing was detrimental; if anything, we both left deployment too "
        "late, and that was my call as much as his.",

        "Two things. First, a rule enforced twice - once where the user can see it and "
        "once where nothing can bypass it - is worth the extra code, and that is now how "
        "I think about validation. Second, the record matters as much as the work: small "
        "commits with a reason, each attributed to whoever wrote the code, made \"who did "
        "what\" answerable. Next time I would deploy in the second week rather than the "
        "last, and agree the commit rules before the first commit rather than after the "
        "first disagreement.",
    ],
}


def set_paragraph(doc, index, text, size=11):
    """Replace the text of paragraph `index`, keeping its original style."""
    par = doc.paragraphs[index]
    style = par.style.name
    for run in list(par.runs):
        run._element.getparent().remove(run._element)
    run = par.add_run(text)
    run.font.size = Pt(size)
    par.style = style
    return par


def fill(owner, other, own_text, other_text, answers, out_name):
    doc = Document(TEMPLATE)
    table = doc.tables[0]

    # --- names in the header row -------------------------------------------
    table.rows[0].cells[1].text = owner
    table.rows[0].cells[2].text = other

    # --- 5 for every criterion, 30 in both totals ---------------------------
    for row in table.rows[1:-1]:
        row.cells[1].text = "5"
        row.cells[2].text = "5"
    table.rows[-1].cells[1].text = "30"
    table.rows[-1].cells[2].text = "30"

    # --- workload allocation -----------------------------------------------
    set_paragraph(doc, 8, f"[{owner}]: {own_text}")
    set_paragraph(doc, 11, f"[{other}]: {other_text}")

    # --- the three dynamics questions --------------------------------------
    set_paragraph(doc, 16, answers[0])
    set_paragraph(doc, 20, answers[1])
    set_paragraph(doc, 25 if len(doc.paragraphs) > 25 else 24, "")

    # The last question sits at index 24 with no empty paragraph after it, so
    # the answer needs a paragraph of its own appended at the end of the body.
    last = doc.paragraphs[24]
    new = doc.add_paragraph(answers[2])
    last._element.addnext(new._element)
    # move it so it lands directly after the question
    new._element.getparent().remove(new._element)
    last._element.addnext(new._element)
    new.style = "Normal"
    for run in new.runs:
        run.font.size = Pt(11)

    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, out_name)
    doc.save(out)
    return out


if __name__ == "__main__":
    a = fill(ME, HIM, CHENGYU_OWN, JIE_OWN, DYNAMICS[ME],
             "Peer-Evaluation-ChengyuGao-Team30.docx")
    print("wrote", a)

    b = fill(HIM, ME, JIE_OWN, CHENGYU_OWN, DYNAMICS[HIM],
             "Peer-Evaluation-JieBao-Team30.docx")
    print("wrote", b)
