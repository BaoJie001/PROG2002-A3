"""
make_storyboard.py - build the Giving Coast storyboard from the tutor's template.

The template (Storyboard-template.docx) is one screen: a "Storyboard" heading,
a TITLE / SCREEN ID / DATE line, an "Elements:" label over a sketch area, and
a five-row table (Description / Content / Interactions / Media Creation /
Navigation). This script fills that block once per screen of the real website
- seven screens, each with a live screenshot taken from the deployed site -
and saves the result as one document.

Formatting follows the template (Comic Sans MS, Letter, 2.54 cm margins), not
the A3 report, because this document is a design artifact, not the report.

Run:  python make_storyboard.py <template> <output>
"""

import copy
import sys

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.shared import Cm, Pt
from docx.oxml.ns import qn

FONT = "Comic Sans MS"
BODY = 10
DATE = "18 October 2026"

SCREENS = [
    {
        "id": "S1",
        "title": "Home - Giving Coast public site",
        "img": "S1-home.png",
        "desc": "The landing page. Its job is to make a visitor want to attend something and get them "
                "to an event within one click. It also quietly proves the site is alive: every card is "
                "rendered from the database, so an empty home page would mean a broken back end.",
        "content": "Header with the Giving Coast mark and the menu (Home / Search / Staff admin).\n"
                   "Hero panel: eyebrow 'Gold Coast - Queensland', headline 'Charity events worth showing "
                   "up for', a two-line lead, and the 'Find an event' button.\n"
                   "'Upcoming events' - a grid of event cards, each showing the category chip with its "
                   "icon, the event name, date, time, venue and price, a one-line summary, a progress bar "
                   "of raised against goal, how many people have registered, and the running charity.\n"
                   "'Recently finished' - the same card grid for past events.\nFooter.",
        "interactions": "On load the page calls GET /api/events and GET /api/events/past and renders the "
                        "two grids from the responses; nothing on the page is hard-coded.\n"
                        "'Find an event' and the menu Search item go to the search page.\n"
                        "Clicking any card opens that event's detail page.\n"
                        "If the API is unreachable the grids show an error panel with a 'Try again' button "
                        "instead of a blank page.",
        "media": "No image assets at all. The category icons are emoji stored in the database and served "
                 "by the API (which is why the tables are utf8mb4); the card colour bands are CSS derived "
                 "from the category; the progress bar is drawn from raised_amount / goal_amount returned "
                 "by the API rather than stored in the table.",
        "navigation": "In: the site root, or 'View public site' from the staff site.\n"
                      "Out: Search (hero button and menu), Event detail (any card), Staff admin (menu).",
    },
    {
        "id": "S2",
        "title": "Search - find an event",
        "img": "S2-search.png",
        "desc": "For the visitor who already knows roughly what they want. Three filters - date, "
                "location and category - any combination of which can be used, or none at all.",
        "content": "Page title and a two-line explanation ('Leave everything blank to see everything "
                   "that is still coming up').\n"
                   "Filter bar: a date input (minimum = today), a location text input (suburb, city or "
                   "venue), a category select, and Search / Clear buttons.\n"
                   "A results heading with the number found, then the same event cards the home page "
                   "uses, so the two pages can never look or behave differently.",
        "interactions": "Search sends GET /api/events?date=&location=&category= - the filtering is done by "
                        "the API, not by downloading every event and hiding rows in the browser.\n"
                        "A past date is rejected before the request is sent, with a message instead of a "
                        "pointless round trip.\n"
                        "The API's validation message is shown verbatim if it rejects a value.\n"
                        "Clear empties the filters and forgets the previous results.",
        "media": "The category select is filled from GET /api/categories, so a new category added by "
                 "staff appears here without a rebuild. Cards reuse the home page component.",
        "navigation": "In: 'Find an event' from the home hero, or Search in the menu.\n"
                      "Out: any card opens the event detail page; the menu goes home.",
    },
    {
        "id": "S3",
        "title": "Event detail - one charity event",
        "img": "S3-detail.png",
        "desc": "Everything about one event, and the door to booking it. This is the page a visitor "
                "decides on, so it carries the practical details, the social proof and the weather in "
                "one view.",
        "content": "Breadcrumb (All events > category) and a back link.\n"
                   "The event: name, date, start and end time, venue and city, ticket price, the full "
                   "description, the progress bar, and a 'Run by' panel with the charity's details.\n"
                   "'Who is going' - the registration list with each person's name, tickets and booking "
                   "date, newest first, plus a count.\n"
                   "'Expected weather' panel for the event day.\n"
                   "The Register button.",
        "interactions": "One call to GET /api/events/:id returns the event and its registrations "
                        "together, so the page is never half-loaded and the list can never disagree with "
                        "the event.\n"
                        "The weather arrives from GET /api/weather/:eventId as a separate request, so a "
                        "slow or failing forecast never delays the page.\n"
                        "Register goes to /register?eventId=... - the event travels in the URL, not in a "
                        "JavaScript variable, so the page survives a refresh, a bookmark and a shared "
                        "link.",
        "media": "The weather panel is fed by our own API, which calls Open-Meteo with the event's "
                 "latitude and longitude and maps the numeric weather codes to words and an icon. If the "
                 "upstream service is down the panel says there is no forecast rather than showing an "
                 "empty box.",
        "navigation": "In: a card on the home or search page.\n"
                      "Out: Register (the button), back to all events (breadcrumb).",
    },
    {
        "id": "S4",
        "title": "Register - book a place",
        "img": "S4-register.png",
        "desc": "The one page where we ask the visitor for something. New in A3; the brief requires the "
                "form, the event context, validation and a confirmation.",
        "content": "Left panel: the event being booked - name, date, time, venue, price per ticket and "
                   "the charity - fetched from the API so the visitor can see what they are booking "
                   "without going back.\n"
                   "Right panel, 'Your details': first and last name, email, contact phone, number of "
                   "tickets (1-50), date of registration, and optional notes.\n"
                   "A live total (tickets x price), and the 'Complete registration' button.\n"
                   "After a successful booking the form is replaced by a confirmation panel.",
        "interactions": "Every field validates as the visitor types and again on submit, each with its "
                        "own message under the field - no generic alert.\n"
                        "Submit calls POST /api/registrations. 201 replaces the form with the "
                        "confirmation and a link back to the event. 409 shows the API's own sentence: "
                        "this email has already booked, the event is suspended, or the event has "
                        "finished. 400 names the exact field to fix.\n"
                        "The booking date cannot be in the future, and cannot be later than the event "
                        "itself - and the ceiling is checked again in the submit handler, because a max "
                        "attribute on an input is a hint to the browser, not a guarantee to the server.",
        "media": "None - this page is pure data and form. The total is computed in the component from "
                 "tickets x the event's price, never stored.",
        "navigation": "In: the Register button on the event detail page, carrying eventId in the query "
                      "string.\nOut: 'Back to the event' link; after booking, back to the event to see "
                      "your own name in the list.",
    },
    {
        "id": "S5",
        "title": "Staff - event list (admin site)",
        "img": "S5-admin-list.png",
        "desc": "The staff home page, deployed under /admin/. Every event whatever its status, with the "
                "doors to the other two staff screens. Authentication is out of scope by design - the "
                "brief says so.",
        "content": "Title and a one-sentence explanation of what the site can change.\n"
                   "'+ New event' button.\n"
                   "Status filter chips with live counts - All 13 / Active 8 / Past 4 / Suspended 1 - "
                   "taken from the rows actually on screen, so a chip can never claim a number the table "
                   "does not show.\n"
                   "The table: ID, Event (with category and charity), Date, Location, Status badge, "
                   "Ticket price, Registrations (bookings and tickets sold), and Actions.\n"
                   "Edit and Delete buttons on every row.",
        "interactions": "The chips filter the rendered list; suspended wins over past, so a cancelled "
                        "event stays visible with the reason it was cancelled.\n"
                        "Delete asks for confirmation, then calls DELETE /api/events/:id. If bookings "
                        "exist the API answers 409 and the screen says exactly why instead of failing "
                        "silently.\n"
                        "Edit opens the edit screen for that event; '+ New event' opens the create "
                        "screen; 'View public site' opens the public site in a new tab.",
        "media": "Status badges are coloured per status (active, past, suspended). No images.",
        "navigation": "In: 'Staff admin' in the public menu, or All events in the staff menu.\n"
                      "Out: New event, Edit, the public site.",
    },
    {
        "id": "S6",
        "title": "Staff - new event",
        "img": "S6-admin-new.png",
        "desc": "Create an event. The same form component the edit screen uses, empty - which is why the "
                "two screens cannot drift apart.",
        "content": "Required fields: event name, description, organisation, category, status, date, "
                   "start time, venue and city.\n"
                   "Optional: short summary, end time, suburb, ticket price, fundraising goal, raised so "
                   "far, and the venue's latitude and longitude in a separate 'Venue coordinates' group "
                   "with the note 'Used by the Open-Meteo forecast on the event page. Leave blank if "
                   "unknown.'\n"
                   "Save changes / Cancel.",
        "interactions": "The form is a Reactive Form: the Save button stays disabled until every "
                        "required field is valid, and each field shows its own message.\n"
                        "Save calls POST /api/events and returns to the list, where the new event "
                        "appears with the status it was given.\n"
                        "The organisation and category selects are filled from GET /api/organisations "
                        "and GET /api/categories - the same lists the public site shows, so a staff "
                        "member can never invent a category that does not exist.\n"
                        "Cancel discards the form and goes back without a request.",
        "media": "None. The coordinates are plain number inputs, and leaving them blank simply means the "
                 "public page shows no forecast for that event.",
        "navigation": "In: '+ New event' on the staff list.\n"
                      "Out: back to the list, either by saving or by cancelling.",
    },
    {
        "id": "S7",
        "title": "Staff - edit event",
        "img": "S7-admin-edit.png",
        "desc": "Change an event, and see who has booked it - the two things a staff member needs on one "
                "screen, which is why the registrations sit under the form rather than on a page of "
                "their own.",
        "content": "The same form as S6, pre-filled from GET /api/events/:id (in the screenshot, the "
                   "Twilight 10K: name, summary, description, organisation, category, status, date and "
                   "times, venue, city, prices, and the stored coordinates).\n"
                   "Underneath, 'Registrations for this event': the booking count and total tickets, "
                   "then each booking with name, email, phone, tickets and the date it was made.\n"
                   "And the sentence that explains the delete rule where the staff member is standing: "
                   "'Because registrations exist, this event cannot be deleted - suspend it instead.'",
        "interactions": "Save calls PUT /api/events/:id with the whole form (PUT rather than PATCH "
                        "because the screen always submits every field).\n"
                        "The coordinates saved here are what drive the weather panel on the public event "
                        "page - the two features meet in these two fields.\n"
                        "The registration list comes from the same endpoint that filled the form, so "
                        "there is no second round trip and no way for the two to disagree.",
        "media": "None beyond the data itself.",
        "navigation": "In: Edit on any row of the staff list (the breadcrumb shows Events > event name).\n"
                      "Out: Save changes or Cancel both return to the list.",
    },
]


def set_cell_text(cell, text, size=BODY):
    """Write text into a table cell in the template font. Newlines become real
    line breaks inside one paragraph."""
    par = cell.paragraphs[0]
    for extra in cell.paragraphs[1:]:
        extra._p.getparent().remove(extra._p)
    for run in list(par.runs):
        run._element.getparent().remove(run._element)
    run = par.add_run(text)
    run.font.name = FONT
    run.font.size = Pt(size)
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        from docx.oxml import OxmlElement
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs"):
        rfonts.set(qn(attr), FONT)


def set_table_borders(table):
    """The template carries no 'Table Grid' style, so draw the borders
    directly on the table."""
    from docx.oxml import OxmlElement
    tblPr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "808080")
        borders.append(el)
    tblPr.append(borders)


def add_screen(doc, screen, img_dir, first=False):
    """Append one screen to the document, mirroring the template's layout."""
    if not first:
        br = doc.add_paragraph()
        br.paragraph_format.space_after = Pt(0)
        br.add_run().add_break(WD_BREAK.PAGE)

    def par(text="", size=BODY, bold=False, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        if text:
            r = p.add_run(text)
            r.font.name = FONT
            r.font.size = Pt(size)
            r.bold = bold
            rpr = r._element.get_or_add_rPr()
            rfonts = rpr.find(qn("w:rFonts"))
            if rfonts is None:
                from docx.oxml import OxmlElement
                rfonts = OxmlElement("w:rFonts")
                rpr.append(rfonts)
            for attr in ("w:ascii", "w:hAnsi", "w:cs"):
                rfonts.set(qn(attr), FONT)
        return p

    # heading
    h = doc.add_paragraph(style="Heading 1")
    h.paragraph_format.space_after = Pt(6)
    r = h.add_run("Storyboard")
    r.font.name = FONT
    r.font.size = Pt(14)
    r.bold = True

    par(f"TITLE: {screen['title']}      SCREEN ID: {screen['id']}      DATE: {DATE}")
    par("", space_after=0)

    par("Elements:", size=14, bold=True, space_after=2)
    img_par = par("", space_after=6)
    img_par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img_par.add_run().add_picture(f"{img_dir}/{screen['img']}", width=Cm(12.5))

    table = doc.add_table(rows=5, cols=2)
    set_table_borders(table)
    labels = ["Description:", "Content:", "Interactions:", "Media Creation:", "Navigation:"]
    values = [screen["desc"], screen["content"], screen["interactions"],
              screen["media"], screen["navigation"]]
    for i, row in enumerate(table.rows):
        set_cell_text(row.cells[0], labels[i])
        set_cell_text(row.cells[1], values[i])
        row.cells[0].width = Cm(3.6)
        row.cells[1].width = Cm(12.9)
    for column, width in zip(table.columns, (Cm(3.6), Cm(12.9))):
        column.width = width


def main(template_path, out_path, img_dir):
    doc = Document(template_path)
    # start from a clean body: the template's sample block is our layout
    # reference, but we rebuild every screen with the real content.
    body = doc.element.body
    for el in list(body):
        if el.tag != qn("w:sectPr"):
            body.remove(el)

    for i, screen in enumerate(SCREENS):
        add_screen(doc, screen, img_dir, first=(i == 0))
    doc.save(out_path)
    print(f"saved {out_path} with {len(SCREENS)} screens")


if __name__ == "__main__":
    template = sys.argv[1] if len(sys.argv) > 1 else "Storyboard-template.docx"
    out = sys.argv[2] if len(sys.argv) > 2 else "storyboard.docx"
    imgs = sys.argv[3] if len(sys.argv) > 3 else "screenshots"
    main(template, out, imgs)
