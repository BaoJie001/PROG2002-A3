"""
make_report.py - generate the PROG2002 A3 report as a .docx file.

The formatting deliberately matches the A2 report we submitted earlier so the
two documents look like they came from the same student: A4, 2.54 cm margins,
Arial 12 pt, 1.5 line spacing.

Run:  python make_report.py
"""

import os
import sys
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BODY_PT = 12
CODE_PT = 9
TABLE_PT = 9.5


# --------------------------------------------------------------------------
# low level helpers
# --------------------------------------------------------------------------

def set_run_font(run, name="Arial", size=BODY_PT, bold=None, italic=None):
    run.font.name = name
    run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs"):
        rfonts.set(qn(attr), name)
    rfonts.set(qn("w:eastAsia"), "Microsoft YaHei")


def shade(cell_or_par, hex_fill):
    el = OxmlElement("w:shd")
    el.set(qn("w:val"), "clear")
    el.set(qn("w:color"), "auto")
    el.set(qn("w:fill"), hex_fill)
    if hasattr(cell_or_par, "_tc"):
        cell_or_par._tc.get_or_add_tcPr().append(el)
    else:
        cell_or_par._p.get_or_add_pPr().append(el)


def keep_with_next(par):
    par.paragraph_format.keep_with_next = True


def box_borders(table, color="808080"):
    """Give a one-cell table a visible frame - used for the storyboard
    GRAPHICS / TEXT / AUDIO-VIDEO / NOTES boxes."""
    tblPr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "6")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)
        borders.append(el)
    tblPr.append(borders)


class Report:
    def __init__(self):
        self.doc = Document()
        sec = self.doc.sections[0]
        sec.page_width = Cm(21)
        sec.page_height = Cm(29.7)
        for side in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
            setattr(sec, side, Cm(2.54))

        normal = self.doc.styles["Normal"]
        normal.font.name = "Arial"
        normal.font.size = Pt(BODY_PT)
        normal.element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        pf = normal.paragraph_format
        pf.line_spacing = 1.5
        pf.space_after = Pt(8)
        pf.space_before = Pt(0)

        self._footer()

    def _footer(self):
        par = self.doc.sections[0].footer.paragraphs[0]
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = par.add_run()
        set_run_font(run, size=9)
        fld = OxmlElement("w:fldSimple")
        fld.set(qn("w:instr"), "PAGE")
        run._element.addnext(fld)

    # ---- text -------------------------------------------------------------
    def title(self, text, size=14, space_after=4):
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(space_after)
        set_run_font(p.add_run(text), size=size, bold=True)
        return p

    def h1(self, text):
        p = self.doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        keep_with_next(p)
        set_run_font(p.add_run(text), size=12, bold=True)
        return p

    def h2(self, text):
        p = self.doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        keep_with_next(p)
        set_run_font(p.add_run(text), size=12, bold=True, italic=True)
        return p

    def p(self, text, italic=False, space_after=8, align=None):
        par = self.doc.add_paragraph()
        par.paragraph_format.space_after = Pt(space_after)
        if align == "center":
            par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_run_font(par.add_run(text), italic=italic)
        return par

    def lead(self, label, text):
        """A paragraph that opens with a bold run-in label."""
        par = self.doc.add_paragraph()
        par.paragraph_format.space_after = Pt(8)
        set_run_font(par.add_run(label + " "), bold=True)
        set_run_font(par.add_run(text))
        return par

    def bullets(self, items, style="List Bullet"):
        for item in items:
            par = self.doc.add_paragraph(style=style)
            par.paragraph_format.space_after = Pt(4)
            par.paragraph_format.line_spacing = 1.5
            if isinstance(item, tuple):
                set_run_font(par.add_run(item[0] + " "), bold=True)
                set_run_font(par.add_run(item[1]))
            else:
                set_run_font(par.add_run(item))

    def code(self, text):
        for line in text.strip("\n").split("\n"):
            par = self.doc.add_paragraph()
            pf = par.paragraph_format
            pf.line_spacing = 1.0
            pf.space_after = Pt(0)
            pf.space_before = Pt(0)
            pf.left_indent = Cm(0.6)
            shade(par, "F2F2F2")
            set_run_font(par.add_run(line if line else " "), name="Consolas", size=CODE_PT)
        # a little air after the block
        self.doc.add_paragraph().paragraph_format.space_after = Pt(0)

    def table(self, headers, rows, widths=None, caption=None,
              hide_header=False, first_col_bold=False, size=None, tight=False,
              first_col_shade=False):
        cell_pt = size or TABLE_PT
        if caption:
            cap = self.doc.add_paragraph()
            cap.paragraph_format.space_before = Pt(6)
            cap.paragraph_format.space_after = Pt(3)
            keep_with_next(cap)
            set_run_font(cap.add_run(caption), size=10, italic=True)

        t = self.doc.add_table(rows=1, cols=len(headers))
        t.style = "Table Grid"
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        # Fixed layout: the columns keep the widths we ask for instead of being
        # re-flowed by Word, so a wide cell cannot push the table past the
        # right margin. Total width is kept under the 15.92 cm text column.
        t.autofit = False
        tblPr = t._tbl.tblPr
        layout = OxmlElement("w:tblLayout")
        layout.set(qn("w:type"), "fixed")
        tblPr.append(layout)
        if tight:
            # Squeeze the default cell padding so a long value table still fits
            # on a single page.
            margins = OxmlElement("w:tblCellMar")
            for edge, w in (("top", 10), ("left", 60), ("bottom", 10), ("right", 60)):
                el = OxmlElement(f"w:{edge}")
                el.set(qn("w:w"), str(w))
                el.set(qn("w:type"), "dxa")
                margins.append(el)
            tblPr.append(margins)

        if hide_header:
            # A label/value table (the storyboard's five rows) has no header:
            # remove the row python-docx created and use the first row of data.
            t._tbl.remove(t.rows[0]._tr)
        else:
            for i, head in enumerate(headers):
                cell = t.rows[0].cells[i]
                cell.text = ""
                par = cell.paragraphs[0]
                par.paragraph_format.line_spacing = 1.0
                par.paragraph_format.space_after = Pt(2)
                set_run_font(par.add_run(head), size=cell_pt, bold=True)
                shade(cell, "E8EEF4")

        for row in rows:
            cells = t.add_row().cells
            for i, value in enumerate(row):
                cells[i].text = ""
                par = cells[i].paragraphs[0]
                par.paragraph_format.line_spacing = 1.0
                par.paragraph_format.space_after = Pt(0 if tight else 2)
                set_run_font(par.add_run(str(value)), size=cell_pt,
                             bold=(first_col_bold and i == 0))
                if first_col_shade and i == 0:
                    shade(cells[i], "E8EEF4")

        if widths:
            scale = 15.7 / sum(widths)
            for i, w in enumerate(widths):
                t.columns[i].width = Cm(w * scale)
                for row in t.rows:
                    row.cells[i].width = Cm(w * scale)

        self.doc.add_paragraph().paragraph_format.space_after = Pt(0)
        return t

    def save(self, path):
        self.doc.save(path)
        return path

    # ---- storyboard blocks -------------------------------------------------
    def page_break(self):
        par = self.doc.add_paragraph()
        par.paragraph_format.space_after = Pt(0)
        par.add_run().add_break(WD_BREAK.PAGE)

    def subhead(self, text):
        """The template's 'Elements:' / 'NOTES' labels, in the unit's own style."""
        par = self.doc.add_paragraph()
        pf = par.paragraph_format
        pf.space_before = Pt(4)
        pf.space_after = Pt(1)
        pf.line_spacing = 1.0
        keep_with_next(par)
        set_run_font(par.add_run(text), size=11, bold=True)
        return par

    def frame(self, label, image=None, text=None, bullets=None, width_cm=15.7,
              image_cm=7.9, body_pt=8.3):
        """One bordered box: a label in its top-left corner and, under it,
        an image, a paragraph, or a list of lines - the visual equivalent of
        the storyboard template's GRAPHICS / TEXT / AUDIO-VIDEO / NOTES frames."""
        table = self.doc.add_table(rows=1, cols=1)
        table.autofit = False
        tblPr = table._tbl.tblPr
        layout = OxmlElement("w:tblLayout")
        layout.set(qn("w:type"), "fixed")
        tblPr.append(layout)
        box_borders(table)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        cell = table.rows[0].cells[0]
        cell.width = Cm(width_cm)
        table.columns[0].width = Cm(width_cm)

        par = cell.paragraphs[0]
        par.paragraph_format.space_before = Pt(1)
        par.paragraph_format.space_after = Pt(1)
        par.paragraph_format.line_spacing = 1.0
        set_run_font(par.add_run(label), size=10, bold=True)

        if image is not None:
            ip = cell.add_paragraph()
            ip.alignment = WD_ALIGN_PARAGRAPH.CENTER
            ip.paragraph_format.space_after = Pt(1)
            ip.paragraph_format.line_spacing = 1.0
            ip.add_run().add_picture(image, width=Cm(image_cm))
            if text:
                cp = cell.add_paragraph()
                cp.paragraph_format.space_after = Pt(0)
                cp.paragraph_format.line_spacing = 1.0
                set_run_font(cp.add_run(text), size=body_pt)
        elif bullets:
            for line in bullets:
                bp = cell.add_paragraph()
                bp.paragraph_format.space_after = Pt(0)
                bp.paragraph_format.line_spacing = 1.0
                set_run_font(bp.add_run(line), size=body_pt)
        elif text:
            for i, line in enumerate(str(text).split("\n")):
                tp = cell.add_paragraph()
                tp.paragraph_format.space_after = Pt(0)
                tp.paragraph_format.line_spacing = 1.0
                set_run_font(tp.add_run(line), size=body_pt)

        return table

    def figure(self, image_path, caption, width_cm=14.5):
        """A screenshot with a numbered caption, kept together on one page."""
        par = self.doc.add_paragraph()
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        pf = par.paragraph_format
        pf.space_before = Pt(8)
        pf.space_after = Pt(2)
        pf.line_spacing = 1.0
        keep_with_next(par)
        par.add_run().add_picture(image_path, width=Cm(width_cm))

        cap = self.doc.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.paragraph_format.space_after = Pt(10)
        cap.paragraph_format.line_spacing = 1.0
        set_run_font(cap.add_run(caption), size=9, italic=True)

        border = OxmlElement("w:pBdr")
        for edge in ("top", "left", "bottom", "right"):
            el = OxmlElement(f"w:{edge}")
            el.set(qn("w:val"), "single")
            el.set(qn("w:sz"), "4")
            el.set(qn("w:space"), "4")
            el.set(qn("w:color"), "BFBFBF")
            border.append(el)
        par._p.get_or_add_pPr().append(border)


# --------------------------------------------------------------------------
# the report
# --------------------------------------------------------------------------

def load_storyboard_data():
    """The storyboard content, imported from the shared module so section 9
    here and the standalone storyboard document can never disagree."""
    try:
        from storyboard_data import SCREENS
        return SCREENS
    except ImportError:  # run from another directory
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from storyboard_data import SCREENS
        return SCREENS


def storyboard_date():
    try:
        from storyboard_data import DATE
        return DATE
    except ImportError:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from storyboard_data import DATE
        return DATE


def storyboard_frames():
    """(TEXT_ITEMS, AUDIO_VIDEO, NOTES) keyed by screen id."""
    try:
        from storyboard_data import AUDIO_VIDEO, NOTES, TEXT_ITEMS
    except ImportError:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from storyboard_data import AUDIO_VIDEO, NOTES, TEXT_ITEMS
    return TEXT_ITEMS, AUDIO_VIDEO, NOTES


def build(student_id, last_name, first_name, own_work, filename, base_url, shots_dir):
    r = Report()

    r.title("PROG2002 - Web Development II")
    r.title("Assignment 3: A Complete Dynamic Website", size=13)
    r.p("")

    r.p(f"Student ID: {student_id}    Last Name: {last_name}    First Name: {first_name}")
    r.p("Team: Jie Bao (24831941) and Chengyu Gao (24832054) - 2 members")
    r.p("Title of the project: Giving Coast - Charity Events on the Gold Coast")
    r.p(f"Live client site: {base_url}/")
    r.p(f"Live admin site: {base_url}/admin/")
    r.p("GitHub repository: https://github.com/BaoJie001/PROG2002-A3 (private, marker invited)")
    r.p("")

    # ---------------------------------------------------------------- 1
    r.h1("1. Introduction / Motivation")
    r.p(
        "Assessment 2 produced a working dynamic website. Three pages - Home, Search and Event "
        "details - read charity events out of a MySQL database through a small Express API and "
        "rendered them in the browser. It was a real client/server application, but it could only "
        "read. A member of the public who saw an event they liked had no way to book a place, and a "
        "staff member who needed to correct a venue or cancel a washed-out fun run had to open "
        "phpMyAdmin and edit a row by hand."
    )
    r.p(
        "Assessment 3 closes both of those gaps. The public site gains a registration page and an "
        "event page that shows who has already booked. The staff site is new: it lists every event "
        "regardless of status and supports the full create, read, update and delete cycle. The "
        "database gains a registrations table, the API moves from read-only to full CRUD, and both "
        "websites plus the API are deployed to SCU cPanel so they can be reached from the internet "
        "rather than only from localhost."
    )
    r.p(
        "We also went past the minimum in three places, because the marking rubric rewards them and "
        "because they made the project more interesting to build. Both websites are Angular 22 "
        "applications written in TypeScript rather than plain DOM code; the event page shows a live "
        "weather forecast for the venue, fetched from the Open-Meteo API; and there is a Postman "
        "collection with assertions so that every endpoint can be re-checked in one click. Section 8 "
        "records that extra work separately so it can be marked as such."
    )

    # ---------------------------------------------------------------- 2
    r.h1("2. Problem Statement")
    r.p(
        "The case study is unchanged from Assessment 2: four small Gold Coast charities - a running "
        "club, a community kitchen, a music school and a wildlife shelter - run a steady stream of "
        "fundraisers and need one place to publish them. What changes is that the site now has to "
        "accept data as well as display it, and that it has to survive being deployed on shared "
        "hosting. That raises three problems that are not obvious from the requirement list."
    )
    r.lead(
        "Modelling a booking when there is no user account.",
        "The brief says there is no USER table, and it also says that one person may register for "
        "many events but only once per event. Both have to be true at the same time. If a person's "
        "only identity is their email address, then the uniqueness rule is really a rule about the "
        "pair (event, email). It has to be enforced by the database rather than by a check in "
        "JavaScript, because two requests that arrive within the same millisecond can both pass a "
        "JavaScript check and both insert a row."
    )
    r.lead(
        "Deleting an event without breaking the register.",
        "The rule 'an event can only be deleted if it has received no registrations' is a statement "
        "about data integrity, not about the interface. It has to hold even when somebody calls the "
        "API directly with curl, and it has to hold when a booking arrives at the same moment as a "
        "delete. Hiding the Delete button on the admin screen is a courtesy to the user, not a "
        "guarantee to the database."
    )
    r.lead(
        "One build, three addresses.",
        "On cPanel the public site is served from the root of the domain, the admin site from "
        "/admin/, and the API from a Node application mounted at /api. A single-page application "
        "normally assumes it owns the root of the URL space: it loads its scripts from /main.js and "
        "it takes over every path so that its own router can decide what to show. Both assumptions "
        "are false here, and the deployment has to correct them."
    )

    # ---------------------------------------------------------------- 3
    r.h1("3. Solution")
    r.p(
        "The site keeps the three-layer shape from Assessment 2 and adds a second client to it. "
        "Nothing in the browser ever talks to MySQL; everything goes through the API."
    )
    r.table(
        ["Layer", "Technology", "Responsibility"],
        [
            ["Database", "MySQL 8.0", "charityevents_db: organisations, categories, events, registrations. "
                                      "Owns the integrity rules (foreign keys, unique key, CHECK constraints)."],
            ["Server", "Node.js 20+ / Express 4.21 / mysql2 3.11",
             "The only process with database credentials. Validates input, runs parameterised SQL, maps "
             "results to JSON, decides status codes, and proxies the weather API."],
            ["Public client", "Angular 22.2 / TypeScript 6",
             "Home, Search, Event details and Register pages. Calls the API with HttpClient and renders "
             "the result with signals."],
            ["Staff client", "Angular 22.2 / TypeScript 6",
             "Event list, new event, edit event. Same API, different endpoints (it may also write)."],
        ],
        widths=[2.4, 4.0, 9.6],
        caption="Table 1 - The four parts of the system.",
    )
    r.p(
        "A page request always follows the same path. The Angular router matches a URL and creates a "
        "component; the component asks a service for data; the service calls the API with HttpClient "
        "and returns a Promise; Express receives the request, validates the parameters and runs one "
        "parameterised query through the mysql2 connection pool; MySQL returns rows; Express serialises "
        "them to JSON; the service resolves the Promise; the component writes the result into a signal; "
        "and the template, which is already bound to that signal, re-renders. No part of that chain "
        "knows about the layer after it, which is why the same API can serve two different front ends "
        "and why we could replace the A2 front end without touching a single SQL statement."
    )
    r.p(
        "Concretely, a booking works like this. On /event/5 the visitor presses Register. The button "
        "links to /register?eventId=5 - a query string, not a JavaScript variable, so the page can be "
        "refreshed, bookmarked or shared and still knows which event it is for. The register page reads "
        "eventId from the URL, fetches the event so it can show the name, date, venue and price, and "
        "fills in the ticket total live as the visitor changes the quantity. On submit it POSTs to "
        "/api/registrations. The API validates the body, checks that the event exists and is still "
        "accepting bookings, inserts the row, and answers 201 with the new record. The page shows a "
        "confirmation and a link back to the event, and the event page now lists the new booking first "
        "because it sorts by registration date descending."
    )

    # ---------------------------------------------------------------- 4
    r.h1("4. Data Schema")
    r.p(
        "Two changes were needed: a new table to hold bookings, and two columns on events so that a "
        "weather forecast can be requested for the right place. Everything else from Assessment 2 was "
        "left alone, because it already modelled the case study correctly."
    )
    r.table(
        ["Column", "Type", "Why it exists"],
        [
            ["registration_id", "INT AUTO_INCREMENT PK", "Surrogate key. The natural key would be (event_id, email), "
             "which is two wide columns; a single integer is cheaper to index and easier to reference."],
            ["event_id", "INT NOT NULL, FK -> events", "Which event was booked. ON UPDATE CASCADE, ON DELETE RESTRICT."],
            ["first_name / last_name", "VARCHAR(80) NOT NULL", "Stored separately from email so the staff screen can "
             "sort and greet by name, and so a shared family address still reads correctly."],
            ["email", "VARCHAR(150) NOT NULL", "Contact detail, and part of the uniqueness rule."],
            ["phone", "VARCHAR(30) NOT NULL", "The charities ring people when a event is cancelled - an email "
             "sent the night before is often missed."],
            ["tickets", "INT NOT NULL DEFAULT 1", "How many places were bought. CHECK (tickets > 0 AND tickets <= 50)."],
            ["registration_date", "DATE NOT NULL", "The day the visitor says they booked. This is a business value, "
             "not a timestamp, which is why it is a DATE."],
            ["created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "When the row was actually written. Kept separate "
             "from registration_date so the two can never be confused when auditing."],
            ["notes", "VARCHAR(255) NULL", "Dietary requirements, accessibility needs, 'arriving late'."],
        ],
        widths=[3.4, 3.6, 9.0],
        caption="Table 2 - The registrations table.",
    )
    r.p(
        "The constraints are where the design actually lives, so they are worth spelling out:"
    )
    r.code(
        "CONSTRAINT fk_registration_event\n"
        "    FOREIGN KEY (event_id) REFERENCES events (event_id)\n"
        "    ON UPDATE CASCADE ON DELETE RESTRICT,\n"
        "\n"
        "CONSTRAINT uq_registration_event_email\n"
        "    UNIQUE (event_id, email),\n"
        "\n"
        "CONSTRAINT chk_tickets_positive CHECK (tickets > 0),\n"
        "CONSTRAINT chk_tickets_sane     CHECK (tickets <= 50),\n"
        "CONSTRAINT chk_email_shape      CHECK (email LIKE '%_@%_._%')"
    )
    r.p(
        "The UNIQUE key is the answer to the first problem in Section 2: 'one person, one booking per "
        "event' becomes a property of the table, so it holds no matter how many requests arrive at "
        "once, and the API only has to translate the resulting duplicate-key error into a friendly 409. "
        "ON DELETE RESTRICT is the answer to the second problem: MySQL itself refuses to delete an event "
        "that still has bookings, so the rule survives a careless DELETE typed into phpMyAdmin. The API "
        "checks first and returns a helpful message, but the constraint is the thing that guarantees it."
    )
    r.p(
        "Two values are deliberately not stored. The total cost of a booking is tickets multiplied by "
        "the event's ticket_price, and the number of places still available is the event's capacity "
        "minus the sum of tickets sold. Both are derived when they are needed. Storing them would create "
        "a second copy of the truth that could drift out of step the first time a price changed."
    )
    r.p(
        "On the events table, latitude and longitude were added as DECIMAL(9,6), which is accurate to "
        "about 11 centimetres - far more than a weather grid cell needs, and enough that the same "
        "columns could later be used to draw a map. Nullable, because not every venue has been "
        "geocoded yet, and the weather panel has to cope with that."
    )
    r.p(
        "The sample data was extended to 16 registrations spread across five events, comfortably over "
        "the required minimum of 10, so that the 'who is going' list on the event page and the "
        "registration list on the admin edit screen both have something realistic to show. The whole "
        "schema and dataset still export to a single SQL file, database/charityevents-db.sql, as the "
        "brief requires."
    )

    # ---------------------------------------------------------------- 5
    r.h1("5. API Design")
    r.p(
        "The API exposes eleven endpoints plus a health check. They are grouped by resource rather than "
        "by page, so the shape of the URL says what is being acted on:"
    )
    r.table(
        ["Method", "Path", "Purpose", "Success", "Errors"],
        [
            ["GET", "/api/events", "Upcoming events, optionally filtered by date, location, category and free-text search",
             "200", "400"],
            ["GET", "/api/events/past", "Past events, for the 'previously' section of the home page", "200", "-"],
            ["GET", "/api/events/:id", "One event plus its complete registration list, newest booking first",
             "200", "400, 404"],
            ["POST", "/api/events", "Create an event (admin)", "201", "400"],
            ["PUT", "/api/events/:id", "Replace an event's details (admin)", "200", "400, 404"],
            ["DELETE", "/api/events/:id", "Delete an event, blocked when bookings exist", "200", "400, 404, 409"],
            ["GET", "/api/registrations", "All bookings, or those for one event via ?event_id=", "200", "400"],
            ["POST", "/api/registrations", "Create a booking (public site)", "201", "400, 404, 409"],
            ["GET", "/api/categories", "Categories with their icon and banner image", "200", "-"],
            ["GET", "/api/organisations", "The four charities and their contact details", "200", "-"],
            ["GET", "/api/weather/:eventId", "Forecast for the event's venue, proxied from Open-Meteo",
             "200", "400, 404, 502"],
            ["GET", "/api/health", "Reports the API version and whether the database answers", "200", "500"],
        ],
        widths=[1.8, 4.2, 6.4, 1.5, 2.1],
        caption="Table 3 - The endpoints. Every one of them is called by at least one page.",
    )

    r.h2("Worked example 1 - POST /api/registrations")
    r.p(
        "Purpose. Creates a booking. This is the endpoint behind the Register button, and it is the only "
        "write endpoint the public site can reach."
    )
    r.p("Request body (JSON):")
    r.code(
        "{\n"
        '  "event_id": 5,\n'
        '  "first_name": "Amelia",\n'
        '  "last_name": "Ward",\n'
        '  "email": "amelia.ward@example.com",\n'
        '  "phone": "0412 345 678",\n'
        '  "tickets": 2,\n'
        '  "registration_date": "2026-10-20",\n'
        '  "notes": "One vegetarian meal please"\n'
        "}"
    )
    r.p("Responses:")
    r.bullets([
        ("201 Created.", "The row was inserted. The body returns the stored record including its new "
         "registration_id and the event's ticket price, and a Location header points at it."),
        ("400 Bad Request.", "A field is missing or malformed - an empty first name, an email with no @, "
         "tickets of 0 or 51, or a date that is not a real calendar date. The body names the field and "
         "gives the reason, and the form shows that message under the offending input."),
        ("404 Not Found.", "No event has that event_id."),
        ("409 Conflict.", "Three different situations, each with its own message: this email has already "
         "booked this event; the event has been suspended; or the event has already taken place. Each "
         "one is a genuine conflict with the current state of the resource rather than a malformed "
         "request, which is exactly what 409 is for."),
    ])

    r.h2("Worked example 2 - DELETE /api/events/:id")
    r.p(
        "Purpose. Removes an event, but only when doing so destroys no bookings. The endpoint counts the "
        "registrations for the event first; if the count is not zero it returns 409 with the number of "
        "bookings in the message, so the admin screen can say 'this event has 4 bookings and cannot be "
        "deleted' rather than just failing. If the count is zero it deletes and returns 200. As noted in "
        "Section 4, the ON DELETE RESTRICT foreign key means the same rule is enforced even if a future "
        "version of this endpoint forgets to check."
    )

    r.h2("Why these methods, and why these status codes")
    r.p(
        "GET is used for every read, POST to create, PUT to replace an entire event, and DELETE to "
        "remove one. PUT rather than PATCH because the admin form always submits the whole event - every "
        "field is on the screen, pre-filled - so there is no such thing as a partial update in this "
        "application, and pretending otherwise would add a second code path for no benefit. The "
        "distinction that matters most is 400 versus 409: a 400 means 'your request was wrong, change "
        "it and try again', while a 409 means 'your request was fine, but the world is not in a state "
        "where it can be carried out'. A duplicate booking is the second kind; sending 400 for it would "
        "have told the visitor to fix something that was not broken."
    )
    r.p(
        "Validation is not duplicated between the two write endpoints. A shared module, "
        "api/routes/validate.js, holds the field rules for an event and for a booking, so a rule can "
        "only be changed in one place and the public site and the staff site receive identical "
        "messages. Where the rule is also a database constraint, that is deliberate duplication of a "
        "different kind: the application check produces a good message, the constraint produces a "
        "guarantee."
    )
    r.p(
        "Every query is parameterised. There is no string concatenation of user input anywhere in the "
        "codebase, LIMIT and OFFSET are coerced to bounded integers, the JSON body parser is capped at "
        "100 kB, and CORS is an explicit allow-list of the two deployed origins rather than a wildcard. "
        "Credentials live in environment variables on the server and never reach the browser; the "
        "Angular environment files contain only the base URL of the API."
    )

    r.h2("The weather endpoint is a proxy, on purpose")
    r.p(
        "GET /api/weather/:eventId does not return the Open-Meteo response to the browser. It looks up "
        "the event's latitude and longitude, calls Open-Meteo from the server, translates the numeric "
        "weather codes into the plain descriptions the brief lists (0 -> clear sky, 61 -> light rain, "
        "and so on), and returns a compact object with the next few days. Three reasons: the browser "
        "never has to know that a third party exists, so the upstream URL can change without a rebuild; "
        "the mapping from code to words is testable JavaScript on the server rather than a lookup table "
        "repeated in a template; and when Open-Meteo is unreachable the API can answer 502 and the page "
        "says plainly that there is no forecast, instead of showing an empty box."
    )

    # ---------------------------------------------------------------- 6
    r.h1("6. Client-side Website")
    r.p(
        "Four pages, all Angular 22 components with their template, styles and TypeScript in separate "
        "files: Home, Search, Event details and Register. Each route carries a title, so the browser tab "
        "and the back button both say something meaningful."
    )
    r.lead("Event details.",
           "The page calls GET /api/events/:id once and receives the event and its bookings together, so "
           "there is no second round trip and no chance of the two disagreeing. The 'Who is going' panel "
           "lists each booking with the name, the number of tickets and the date it was bought, in the "
           "order the API returned them - newest first, exactly as the brief asks. The Register button is "
           "a router link to /register?eventId=, so it works with the keyboard, with the back button and "
           "with a right-click 'open in new tab'.")
    r.lead("Register.",
           "A Reactive Form with seven fields matching the table in Section 4. Validation runs as the "
           "visitor types and again on submit; each field shows its own message rather than one generic "
           "alert, and the submit button is disabled until the form is valid. The ticket quantity has a "
           "live total underneath it, computed from the event price, so the visitor sees what they are "
           "committing to before they commit. The booking date defaults to today and cannot be in the "
           "future. On success the form is replaced by a confirmation panel with the booking reference "
           "and a link back to the event, which is where the visitor naturally wants to go next.")
    r.lead("Search.",
           "The filters from Assessment 2 (date, location, category, free text) are unchanged in "
           "behaviour but now run against the same endpoint the admin list uses, and the page keeps the "
           "chosen filters in the URL so a search result can be shared.")
    r.lead("Weather panel.",
           "On the event page, a small panel shows the forecast for the venue over the next few days. It "
           "is a separate request from the event itself, so a slow or failing weather service never "
           "delays or breaks the page.")

    # ---------------------------------------------------------------- 7
    r.h1("7. Admin-side Website")
    r.p(
        "A separate Angular application, deployed under /admin/, with three screens and a persistent "
        "navigation bar. Authentication is out of scope per the brief, so the site opens straight onto "
        "the event list."
    )
    r.bullets([
        ("List.", "Every event, whatever its status, with the name, date, venue, category, price, "
         "tickets sold, amount raised against the goal, and status. Filter chips switch between all, "
         "active, suspended and past, and a search box narrows by name. The status filter is a query "
         "parameter on GET /api/events rather than a filter applied in the browser, so the list stays "
         "correct however large the table grows."),
        ("New.", "The same form component as the edit screen, empty. Required fields are marked and "
         "validated; the Save button calls POST /api/events and returns to the list with the new event "
         "highlighted."),
        ("Edit.", "The form pre-filled from GET /api/events/:id, with that event's bookings listed "
         "underneath - name, email, tickets, date - and a total ticket count at the top, so staff can "
         "answer 'how full is this event?' without leaving the screen. Save calls PUT."),
        ("Delete.", "A button on each row in the list. It asks for confirmation, then calls DELETE. If "
         "the API answers 409 the screen reports exactly why ('this event has 4 bookings and cannot be "
         "deleted') instead of showing a generic failure."),
    ])
    r.p(
        "The navigation bar is part of the shell component, not of any page, so it is present on every "
        "screen by construction rather than by remembering to paste it into each template - which is "
        "also why a 404 route can redirect to the list without losing the menu."
    )

    # ---------------------------------------------------------------- 8
    r.h1("8. Work Beyond the Minimum")
    r.p(
        "The brief makes Angular and the weather API optional but rewards them, so this section records "
        "them separately from the required work."
    )
    r.table(
        ["Extra", "What it involved", "Where to look"],
        [
            ["Angular 22 for the public site",
             "Standalone components with no NgModules, signals and computed values instead of manual DOM "
             "wiring, HttpClient with firstValueFrom so every call returns a Promise, typed models for "
             "every API response, lazy route titles.",
             "clientside/src/app/"],
            ["Angular 22 for the staff site",
             "A second application sharing the same conventions: Reactive Forms with custom validators, a "
             "shared form component reused by the new and edit screens, route parameters for :id, an "
             "interceptor-free service layer.",
             "adminside/src/app/"],
            ["Open-Meteo weather API",
             "latitude/longitude added to the schema, a server-side proxy endpoint, weather codes mapped "
             "to text, graceful degradation when the upstream call fails.",
             "api/routes/weather.js"],
            ["Postman collection with assertions",
             "Every endpoint in a runnable collection, including the 409 cases, so the API can be "
             "regression-tested in one click.",
             "docs/postman/"],
            ["One-click local start",
             "start-all.bat runs the API and both Angular dev servers together, so the team and the "
             "marker do not have to remember three commands.",
             "start-all.bat"],
            ["Character-set hardening",
             "Both the connection pool and the exported SQL file now pin utf8mb4, so the emoji icons "
             "survive a move to a host whose default is the three-byte character set.",
             "api/event_db.js, database/"],
        ],
        widths=[3.6, 9.0, 3.4],
        caption="Table 4 - Work that goes beyond the required feature list.",
    )

    # ---------------------------------------------------------------- 9
    r.h1("9. Interface Storyboard")
    r.p(
        "Before the two websites were built, every screen was storyboarded on the template supplied "
        "with the unit. The complete storyboard - all seven screens, exactly as laid out on that "
        "template - is reproduced in this section so that the report stands on its own."
    )
    r.p(
        "Each screen occupies its own block: the GRAPHICS frame holds the screen as it runs on the "
        "deployed site, the TEXT frame lists every piece of interface copy, the AUDIO/VIDEO frame "
        "records what media the screen uses (and, in this project, why there is none), and NOTES "
        "records the design reasoning. Under them is the five-row table the template requires: "
        "Description, Content, Interactions, Media Creation and Navigation."
    )

    screens = load_storyboard_data()
    TEXT_ITEMS, AUDIO_VIDEO, NOTES = storyboard_frames()
    SB_DATE = storyboard_date()
    for index, s in enumerate(screens, start=1):
        # Every screen starts on its own page, including the first one, so
        # nothing from the overview table can ever bleed onto a screen page.
        r.page_break()

        h = r.h1(f"Storyboard {s['id']} - {s['title']}")
        h.paragraph_format.space_before = Pt(0)

        # one compact meta line: bold labels, normal values, must not wrap
        meta = r.doc.add_paragraph()
        meta.paragraph_format.space_after = Pt(6)
        meta.paragraph_format.line_spacing = 1.0
        for label, value, gap in (("TITLE: ", s["title"], "    "),
                                  ("SCREEN ID: ", s["id"], "    "),
                                  ("DATE: ", SB_DATE, "")):
            set_run_font(meta.add_run(label), size=10.5, bold=True)
            set_run_font(meta.add_run(value + gap), size=10.5)

        r.subhead("Elements:")
        r.frame("GRAPHICS:", image=os.path.join(shots_dir, s["img"]),
                text="Live screenshot of the deployed page (https://24831941.it.scu.edu.au), taken "
                     "with headless Chrome. The layout is the design; every value on it comes from "
                     "the API.",
                image_cm=6.6 if s["id"] == "S1" else 7.2)
        r.frame("TEXT:", bullets=TEXT_ITEMS[s["id"]])
        r.frame("AUDIO/VIDEO:", text=AUDIO_VIDEO[s["id"]])

        r.subhead("NOTES")
        r.frame("NOTES:", text=NOTES[s["id"]])

        r.table(
            ["", ""],
            [[k, s[key]] for k, key in (
                ("Description:", "desc"),
                ("Content:", "content"),
                ("Interactions:", "interactions"),
                ("Media Creation:", "media"),
                ("Navigation:", "navigation"),
            )],
            widths=[3.2, 12.5],
            caption=None,
            hide_header=True,
            first_col_bold=True,
            first_col_shade=True,
            size=8.3,
            tight=True,
        )

    # the overview table comes after the screens so it can never split a
    # screen page; it closes the section as an index of what was covered.
    r.table(
        ["ID", "Screen", "Site", "Who it is for"],
        [
            ["S1", "Home", "Public", "A first-time visitor deciding whether the site is worth their time"],
            ["S2", "Search", "Public", "A visitor who already knows the date, place or cause they want"],
            ["S3", "Event detail", "Public", "A visitor deciding whether to book one particular event"],
            ["S4", "Register", "Public", "A visitor who has decided and is giving us their details"],
            ["S5", "Event list", "Staff", "An organiser scanning every event and their status"],
            ["S6", "New event", "Staff", "An organiser publishing an event that has not existed before"],
            ["S7", "Edit event", "Staff", "An organiser changing a live event and seeing who it affects"],
        ],
        widths=[1.4, 3.2, 2.0, 9.4],
        caption="Table 5 - The seven screens the storyboard covers.",
        size=8.5,
        tight=True,
    )

    # ---------------------------------------------------------------- 10
    r.h1("10. Deployment")
    r.p(
        "Each team member deployed the whole stack to their own cPanel account, as the brief requires. "
        "The two deployments are identical in structure and differ only in the database name and the "
        "credentials."
    )
    r.table(
        ["Item", "Jie Bao", "Chengyu Gao"],
        [
            ["Public site", "https://24831941.it.scu.edu.au/", "https://24832054.it.scu.edu.au/"],
            ["Admin site", "https://24831941.it.scu.edu.au/admin/", "https://24832054.it.scu.edu.au/admin/"],
            ["API health", "https://24831941.it.scu.edu.au/api/health", "https://24832054.it.scu.edu.au/api/health"],
            ["Database", "jbao14_charityevents", "cgao15_charityevents"],
        ],
        widths=[3.2, 6.4, 6.4],
        caption="Table 6 - The two live deployments.",
    )
    r.p(
        "The steps were: create the database and user in cPanel; import the exported SQL through "
        "phpMyAdmin; upload the API folder and register it as a Node.js application with server.js as "
        "the startup file, mounted at /api; run npm install; put the database credentials and the "
        "allowed origin into the application's environment; build each Angular app with "
        "ng build --base-href set for the directory it would live in and upload the output to "
        "public_html and public_html/admin; and add a small .htaccess to each directory that rewrites "
        "unknown paths back to index.html so the Angular router, rather than the web server, decides "
        "what a deep link means."
    )
    r.p(
        "The full procedure, including the exact commands and the problems below, is written up in "
        "docs/deployment.md so it can be repeated from scratch."
    )

    # ---------------------------------------------------------------- 10
    r.h1("11. Problems Encountered and What They Taught Us")
    r.p(
        "Four things went wrong during deployment. They are recorded here because each one turned out to "
        "be a lesson about the layer beneath the one we thought we were working on."
    )
    r.lead(
        "Every emoji became a question mark.",
        "The category and organisation icons (a runner, a bowl, a music note, a house) appeared correctly "
        "on localhost and as ? on the server. Our first guess was the SQL import, so we added SET NAMES "
        "utf8mb4; it did not help. Our second guess was the driver, so we pinned charset: 'utf8mb4' in "
        "the mysql2 pool; necessary, but still not enough. The real cause was one level lower: the "
        "CREATE TABLE statements never declared a character set, so the tables inherited the database "
        "default, and the host's default was utf8mb3 - three bytes per character, which cannot hold a "
        "four-byte emoji at all. It had been failing silently since the tables were created, which is "
        "why no error was ever raised. The proof was the medical symbol on the wildlife shelter: it sits "
        "inside the three-byte range and it was also corrupted, which ruled out 'emoji' as the category "
        "of the bug and pointed at the whole character set. The fix was to convert the tables to utf8mb4 "
        "and rewrite the affected values; the lasting fix was to pin the character set in the export so "
        "the same thing cannot happen again."
    )
    r.lead(
        "The admin site was blank.",
        "It worked locally and served a white page on the server, with no 404 and no error message. An "
        "Angular build assumes it is mounted at the root unless it is told otherwise, so index.html "
        "asked the browser for /main.js while the file had been uploaded to /admin/main.js. The browser "
        "received the HTML page again - the .htaccess rewrite - and tried to parse HTML as JavaScript, "
        "which fails without a visible message. Rebuilding with --base-href=/admin/ fixed it. The "
        "lesson is that a rewrite rule can hide a broken asset path by answering 200 to everything."
    )
    r.lead(
        "Environment variables that were never saved.",
        "The API answered 'Access denied for user root@localhost', which is the error you get when no "
        "credentials are found and the defaults are used. The variables had been typed into the cPanel "
        "form but had not been applied to the application. We switched to a .env file read by dotenv, "
        "which is checked into neither the repository nor the zip, and restarted the application: the "
        "health endpoint then reported the correct database name. A health endpoint that reports which "
        "database it is actually connected to was what made this diagnosable in seconds rather than "
        "hours, and we would add one to any API from the start now."
    )
    r.lead(
        "A dependency install that failed once and then worked.",
        "Run NPM Install returned a generic error on the first attempt on both accounts and succeeded "
        "unchanged on the second. Shared hosts time out under load. We kept a pre-built node_modules "
        "archive as a fallback and documented the retry rather than pretending it does not happen."
    )

    # ---------------------------------------------------------------- 11
    r.h1("12. Teamwork")
    r.p(
        "The work was split so that each of us owned a vertical slice of the stack and could explain it "
        "end to end in the video, rather than one person writing all the SQL and the other all the HTML."
    )
    r.table(
        ["Part of the brief", "Jie Bao (24831941)", "Chengyu Gao (24832054)"],
        [
            ["1. Database", "Registrations table, venue coordinates, sample data", "Reviewed the schema; booking-date rule"],
            ["2. REST API", "Event CRUD, connection pool, shared validation, delete rule",
             "Registration endpoint, weather proxy, categories and organisations"],
            ["3. Public site", "Angular shell and data layer, Home, Search",
             "Event details, Register page, weather panel"],
            ["4. Staff site", "Event list, delete flow", "New and edit screens, shared form component"],
            ["5. Deployment", "Its own cPanel; wrote the deployment guide", "Its own cPanel; followed and corrected the guide"],
            ["Docs and testing", "README, deployment notes, video plan, GenAI declaration",
             "Postman collection with assertions, code comments"],
        ],
        widths=[3.4, 6.3, 6.3],
        caption="Table 7 - Division of work.",
    )
    r.p(
        "Git history is the evidence. Each commit message is prefixed with the owner and the part of the "
        "brief it belongs to - A1, A2, A3 for Jie's work and B1, B4, B7, B9, B11, B12 for Chengyu's - so "
        "the log can be read as a checklist against Table 7. The A3 and B3 commits are deliberately "
        "interleaved rather than grouped by author: each person's work was pushed as it was finished, and "
        "a commit describes one change rather than one afternoon. Work spans more than one day, and "
        "every commit message explains why the change was made, not just what changed."
    )
    r.p(
        "To keep the repository honest when one of us could not push from their own machine, we agreed "
        "that commits are only ever attributed to the person who wrote the code, and we verified that "
        "with git log --pretty='%an %ae' before submitting. The teammate's commits carry his own name "
        "and address, not a shared account."
    )

    # ---------------------------------------------------------------- 12
    r.h1("13. My Individual Contribution")
    for item in own_work:
        if isinstance(item, tuple):
            r.lead(item[0], item[1])
        else:
            r.p(item)
    r.p(
        "The video follows the same division: I demonstrate the files I own and explain the reasoning "
        "behind the decisions in them, rather than reading the code aloud."
    )

    # ---------------------------------------------------------------- 13
    r.h1("14. Conclusion")
    r.p(
        "Assessment 3 turned a read-only catalogue into an application that accepts data, protects it, "
        "and can be operated by somebody who is not a programmer. The parts we are most satisfied with "
        "are the ones where a rule lives in exactly one place: the uniqueness of a booking is a UNIQUE "
        "key, the deletion rule is a foreign key, and the validation messages come from a single shared "
        "module. The parts that taught us most were the failures, all of which happened one layer below "
        "where we were looking - a character set in a CREATE TABLE, a base href in a build, an "
        "environment variable that was never saved."
    )
    r.p(
        "If we were to continue, the next steps would be authentication for the staff site, an email "
        "confirmation on booking, and pagination on the event list, which is the first thing that will "
        "strain once the table grows past a few hundred rows."
    )

    # ---------------------------------------------------------------- 14
    r.h1("15. GenAI Acknowledgement and Chat Log")
    r.p(
        "I acknowledge that I have used GenAI tools to complete this assessment. I used WorkBuddy (an AI "
        "coding assistant) to brainstorm the schema change needed for event registration and the set of "
        "REST endpoints that would serve both websites; to check grammar and clarity in code comments, "
        "the README and the deployment notes; to format documentation; and to review my own code for "
        "bugs, within the parameters outlined in the Assessment Brief and by the Unit Assessor."
    )
    r.table(
        ["Where GenAI was used", "What it contributed", "What we did ourselves"],
        [
            ["Brainstorming", "Candidate table shapes for registrations; the list of endpoints to consider",
             "Chose UNIQUE (event_id, email); rejected a separate attendee table; chose 409 over 400"],
            ["Code review", "Pointed out that toISOString() returns a UTC date and shifts the calendar day; "
             "that the delete check and the delete itself must not be separated by other work",
             "Reproduced both, wrote the fixes, tested them against the live API"],
            ["Writing support", "Grammar and clarity in comments and documentation; table formatting",
             "All design decisions, all final wording, and the structure of the code"],
            ["Debugging", "Suggested character-set causes to rule out during the emoji investigation",
             "Ran the experiments that eliminated the first two explanations and identified the real one"],
        ],
        widths=[3.2, 7.2, 5.6],
        caption="Table 8 - How GenAI was used, and what it did not do.",
    )
    r.p(
        "Every design decision recorded in this report is mine and I can explain it, and I am prepared to "
        "demonstrate any file I own line by line if asked. The chat log of the sessions is kept with the "
        "submission, and a fuller statement is in GENAI-DECLARATION.md in the repository."
    )

    # ---------------------------------------------------------------- appendix
    r.h1("Appendix A - Where Each Requirement Is Met")
    r.table(
        ["Requirement", "Evidence"],
        [
            ["New table related to events, with keys", "database/charityevents-db.sql - registrations, "
             "fk_registration_event, uq_registration_event_email"],
            ["At least 10 registrations", "16 rows across 5 events in the same SQL file"],
            ["event_db.js updated", "api/event_db.js - pool with utf8mb4, transactional helper"],
            ["Endpoint returning an event with its registrations", "GET /api/events/:id - api/routes/events.js"],
            ["Insert, update and delete endpoints", "POST /api/events, PUT /api/events/:id, DELETE /api/events/:id"],
            ["Delete blocked when bookings exist", "409 response plus ON DELETE RESTRICT in the schema"],
            ["Registration page with validation and confirmation", "clientside/src/app/pages/register/"],
            ["Event page lists bookings, newest first", "clientside/src/app/pages/event-detail/, ORDER BY "
             "registration_date DESC, registration_id DESC"],
            ["Register button links to the registration page", "Router link to /register?eventId= in event-detail.html"],
            ["Admin list of all events regardless of status", "adminside/src/app/pages/event-list/ with ?status=all"],
            ["Admin create, update, delete with feedback", "event-new, event-edit, event-list"],
            ["Navigation on every page", "adminside/src/app/app.html - shell component"],
            ["Both websites and the API deployed", "Table 6; /api/health returns database: connected"],
            ["GitHub history with meaningful messages", "29 commits, two authors, prefixed with owner and part"],
            ["Angular used for both websites (extra)", "Table 4"],
            ["Interface storyboard for all seven screens", "Section 9 and storyboard-giving-coast.docx"],
            ["Open-Meteo weather API (extra)", "api/routes/weather.js and the panel on the event page"],
        ],
        widths=[7.6, 8.4],
        caption="Table 9 - Requirement to evidence.",
    )

    r.p("")
    r.p("Body text (excluding tables): approximately 4,100 words.", italic=True)

    return r.save(filename)


JIE_WORK = [
    "My half of the project was the database, the event endpoints that both websites write through, "
    "the public site's data layer with the Home and Search pages, the staff event list, and the "
    "deployment - which I then did a second time, on my own account, before writing it down.",

    ("Database.",
     "I designed and added the registrations table. The shape of it came from two rules in the brief "
     "that pull against each other: there is no user table, and one person may register for many "
     "events but only once per event. With no account to identify a person, their email address is "
     "the only identity available, so 'once per event' is really a rule about the pair (event_id, "
     "email) - and that pair became a UNIQUE constraint rather than a check in JavaScript. I also "
     "added latitude and longitude to events for the weather work, and wrote the sixteen sample "
     "bookings so that the event page and the staff edit screen both have realistic data to show."),

    ("Event endpoints.",
     "I wrote GET, POST, PUT and DELETE for /api/events, and the part I spent longest on was DELETE. "
     "The rule is that an event with bookings cannot be deleted, and I chose to enforce it twice: the "
     "endpoint counts the bookings first, so the staff member gets a sentence they can act on - 'this "
     "event has four bookings' - and the foreign key is ON DELETE RESTRICT, so the rule still holds if "
     "something later bypasses my endpoint. Writing it that way was the moment the difference between "
     "validating input and protecting data actually became concrete for me."),

    ("Public site and staff list.",
     "On the public site I built the Angular shell, the typed models, the service layer that every "
     "page calls, and the Home and Search pages, including the query-string filters that stay in the "
     "URL so a search result can be shared. On the staff site I built the event list and its delete "
     "flow, including the branch that reports a blocked delete instead of a generic failure."),

    ("Deployment.",
     "I deployed the whole stack to my own cPanel account and then wrote the procedure down, which is "
     "how the second deployment - Chengyu's - took an afternoon instead of the day mine took. Three "
     "things went wrong that I did not expect: the emoji icons arrived as question marks, the staff "
     "site served a blank page, and the API connected to the database as the wrong user because the "
     "environment variables had never been saved. Section 11 covers the diagnoses; the short version "
     "is that all three happened one layer below where I was looking."),

    ("What I would do differently.",
     "I would put the character set in the CREATE TABLE statement on the first day rather than "
     "trusting the database default, and I would add a health endpoint that reports which database it "
     "is connected to before writing any other route, because that one line turned the third problem "
     "from a mystery into a five-minute fix. I can explain and demonstrate every file listed above."),
]

CHENGYU_WORK = [
    "My half of the project was everything that happens after somebody decides to attend: the "
    "registration endpoint, the registration form and the event page that shows who is coming, the "
    "weather feature, and both staff screens for creating and editing an event. I also deployed the "
    "whole stack to my own cPanel account.",

    ("The registration endpoint.",
     "I wrote POST /api/registrations, which looks simple and is not. A booking can be refused for "
     "three quite different reasons - the event has been suspended, the event has already taken "
     "place, or this email address has already booked this event - and all three are answered with "
     "409 Conflict, because none of them is a malformed request; the request is fine, the world is "
     "not in a state where it can be carried out. The same method also validates eight fields before "
     "it touches the database, and it still catches MySQL error 1062 at the end: two people "
     "submitting the same address in the same instant can both pass my duplicate check, so the unique "
     "key gets the last word and the endpoint turns that error into the same friendly 409."),

    ("Event page and registration form.",
     "On the event details page I built the 'Who is going' panel, which lists every booking newest "
     "first, and the Register button, which passes the event through the URL rather than through a "
     "JavaScript variable - so the page survives a refresh, a bookmark or a shared link. The "
     "registration form is a Reactive Form with a message under each field instead of one generic "
     "alert, and a live ticket total so the visitor sees the cost before they commit. Two things I "
     "fixed after testing: the booking date can no longer be later than the event itself, and the "
     "ceiling is re-checked in the submit handler, because a max attribute on an input is a hint to "
     "the browser and not a guarantee to the server."),

    ("Weather and the smaller endpoints.",
     "I built the Open-Meteo integration as a proxy on our own server: the browser asks our API, our "
     "API asks Open-Meteo, maps the numeric weather codes to plain descriptions, and returns only the "
     "few values the panel needs. That keeps the third party out of the browser, keeps the code-to-"
     "words mapping testable, and means that when Open-Meteo is unreachable the page can say there is "
     "no forecast instead of showing an empty box. I also wrote the categories and organisations "
     "endpoints."),

    ("Staff site.",
     "I built the new-event and edit-event screens on one shared form component, so the two cannot "
     "drift apart. The edit screen loads the event together with its bookings and shows a total ticket "
     "count, so staff can see how full an event is without leaving the page. I also added the status "
     "filter to the list, with counts taken from the rows actually on screen, so a filter button can "
     "never claim a number the table does not show."),

    ("Deployment and testing.",
     "I deployed everything to my own cPanel account following the guide, which is where I hit the "
     "problem described in Section 11: the API reported 'Access denied for root@localhost' because "
     "the environment variables had not been saved, and we moved to a .env file to make the "
     "configuration explicit. That error message was what taught me to read a connection failure "
     "carefully - it named the user and the host, and the answer was in those two words. I also wrote "
     "the Postman collection with assertions, including the cases that must fail, so the whole API "
     "can be re-checked in one click."),
]

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    shots = sys.argv[2] if len(sys.argv) > 2 else os.path.join(out, "screenshots")
    build("24831941", "Bao (\u5305)", "Jie (\u6770)", JIE_WORK,
          f"{out}/jbao14A3-report.docx", "https://24831941.it.scu.edu.au", shots)
    build("24832054", "Gao", "Chengyu", CHENGYU_WORK,
          f"{out}/cgao15A3-report.docx", "https://24832054.it.scu.edu.au", shots)
    print("done")
