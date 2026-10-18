-- ---------------------------------------------------------------------------
-- cPanel import version (v2): emoji-safe + re-runnable
--   SET NAMES utf8mb4        -> the import session speaks utf8mb4, so the
--                               category/organisation emoji survive the trip
--   DROP TABLE IF EXISTS     -> the file can be imported again over a broken
--                               attempt without 'table already exists' errors
-- ---------------------------------------------------------------------------
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;
DROP VIEW IF EXISTS v_event_summary;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS organisations;

-- ---------------------------------------------------------------------------
-- organisations
-- Holds the details of each charity that runs fundraising events.
-- ---------------------------------------------------------------------------
CREATE TABLE organisations (
    organisation_id INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    mission         TEXT         NOT NULL,
    description     TEXT,
    contact_email   VARCHAR(150),
    contact_phone   VARCHAR(50),
    website         VARCHAR(255),
    logo_icon       VARCHAR(10)      -- emoji shown in place of a logo image
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- categories
-- Lookup table used by the search page filter.
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL UNIQUE,
    description VARCHAR(255),
    icon        VARCHAR(10),         -- emoji shown next to the category name
    image_url   VARCHAR(255)         -- banner image used on the event cards
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- events
-- The central table.
--   status       = 'suspended' hides an event from the public website, but the
--                  admin-side must still be able to see and manage it.
--   event_date   compared with CURDATE() decides 'upcoming' or 'past'.
--   latitude /
--   longitude    coordinates of the venue, sent to the Open-Meteo forecast API
--                 to show the expected weather on the event day.
-- ---------------------------------------------------------------------------
CREATE TABLE events (
    event_id        INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT            NOT NULL,
    category_id     INT            NOT NULL,
    name            VARCHAR(150)   NOT NULL,
    summary         VARCHAR(255),
    description     TEXT           NOT NULL,
    event_date      DATE           NOT NULL,
    start_time      TIME           NOT NULL,
    end_time        TIME,
    venue           VARCHAR(150)   NOT NULL,
    suburb          VARCHAR(80),
    city            VARCHAR(80)    NOT NULL,
    state           VARCHAR(20)    NOT NULL DEFAULT 'QLD',
    latitude        DECIMAL(9,6),              -- NEW in A3, for the weather API
    longitude       DECIMAL(9,6),              -- NEW in A3, for the weather API
    ticket_price    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    goal_amount     DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    raised_amount   DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    status          ENUM('active','suspended') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_organisation
        FOREIGN KEY (organisation_id) REFERENCES organisations (organisation_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_event_category
        FOREIGN KEY (category_id) REFERENCES categories (category_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    -- stop nonsense data entering the database
    CONSTRAINT chk_price_not_negative  CHECK (ticket_price  >= 0),
    CONSTRAINT chk_goal_not_negative   CHECK (goal_amount   >= 0),
    CONSTRAINT chk_raised_not_negative CHECK (raised_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- registrations                                                  (NEW IN A3)
-- Records one person attending one event.
--
-- There is deliberately NO users table (the brief says it is not required),
-- so the person is identified by their contact details. The UNIQUE key on
-- (event_id, email) is what makes "one user may register for many events but
-- only once per event" a database guarantee rather than a hope.
-- ---------------------------------------------------------------------------
CREATE TABLE registrations (
    registration_id   INT AUTO_INCREMENT PRIMARY KEY,
    event_id          INT           NOT NULL,
    first_name        VARCHAR(80)   NOT NULL,
    last_name         VARCHAR(80)   NOT NULL,
    email             VARCHAR(150)  NOT NULL,
    phone             VARCHAR(30)   NOT NULL,
    tickets           INT           NOT NULL DEFAULT 1,
    registration_date DATE          NOT NULL,   -- day the tickets were bought
    notes             VARCHAR(255),
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_registration_event
        FOREIGN KEY (event_id) REFERENCES events (event_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,   -- an event with registrations cannot be deleted

    CONSTRAINT uq_registration_event_email
        UNIQUE (event_id, email),   -- the same email cannot book twice

    CONSTRAINT chk_tickets_positive CHECK (tickets > 0),
    CONSTRAINT chk_tickets_sane     CHECK (tickets <= 50),
    CONSTRAINT chk_email_shape      CHECK (email LIKE '%_@%_._%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes: the home page filters by date/category/city, the event page and the
-- admin list both look registrations up by event, and the event page sorts
-- registrations newest-first.
CREATE INDEX idx_event_date     ON events (event_date);
CREATE INDEX idx_event_category ON events (category_id);
CREATE INDEX idx_event_city     ON events (city);
CREATE INDEX idx_reg_event      ON registrations (event_id);
CREATE INDEX idx_reg_date       ON registrations (registration_date);

-- ---------------------------------------------------------------------------
-- v_event_summary                                                (NEW IN A3)
-- The admin dashboard needs "how many people / how many tickets" for every
-- event, including the ones with zero registrations. Doing it in one view
-- keeps that to a single round trip instead of N+1 queries.
-- ---------------------------------------------------------------------------
CREATE VIEW v_event_summary AS
    SELECT e.event_id,
           e.name,
           e.event_date,
           e.city,
           e.suburb,
           e.venue,
           e.status,
           e.ticket_price,
           e.goal_amount,
           e.raised_amount,
           e.category_id,
           e.organisation_id,
           e.latitude,
           e.longitude,
           COUNT(r.registration_id) AS registration_count,
           COALESCE(SUM(r.tickets), 0) AS tickets_sold
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.event_id
     GROUP BY e.event_id, e.name, e.event_date, e.city, e.suburb, e.venue,
              e.status, e.ticket_price, e.goal_amount, e.raised_amount,
              e.category_id, e.organisation_id, e.latitude, e.longitude;

-- ===========================================================================
--  Sample data
-- ===========================================================================

INSERT INTO organisations (name, mission, description, contact_email, contact_phone, website, logo_icon) VALUES
('Hope Together Foundation',
 'To give every family in our city a safe place to call home.',
 'Founded in 2009, Hope Together Foundation funds emergency housing, meals and counselling for families experiencing hardship across the Gold Coast region.',
 'hello@hopetogether.org.au', '(07) 5500 1200', 'www.hopetogether.org.au', '🏠'),

('Bright Futures Children''s Trust',
 'Every child deserves a fair start in life.',
 'Bright Futures provides school supplies, tutoring and health checks to children from low income households, so that no student is left behind because of money.',
 'info@brightfutures.org.au', '(07) 5500 3480', 'www.brightfutures.org.au', '🎒'),

('Green Coast Conservation',
 'Protecting the coastline we all share.',
 'A volunteer driven charity running dune restoration, turtle monitoring and clean-up programs along 40 kilometres of coastline.',
 'contact@greencoast.org.au', '(07) 5500 7720', 'www.greencoast.org.au', '🌿'),

('Harbour Care Alliance',
 'Health care close to home for everyone.',
 'Harbour Care Alliance raises money for mobile health clinics and medical equipment serving regional and coastal communities.',
 'admin@harbourcare.org.au', '(07) 5500 9040', 'www.harbourcare.org.au', '⚕️');

INSERT INTO categories (name, description, icon, image_url) VALUES
('Fun Run',          'Running and jogging events where participants collect sponsorship per lap.',        '🏃', 'assets/img/fun-run.svg'),
('Gala Dinner',      'Formal evening events with dinner, speakers and a fundraising auction.',            '🥂', 'assets/img/gala-dinner.svg'),
('Silent Auction',   'Donated goods are displayed and bid on in writing throughout the event.',           '🔨', 'assets/img/silent-auction.svg'),
('Charity Concert',  'Live music performances where all proceeds support the cause.',                     '🎵', 'assets/img/charity-concert.svg'),
('Community Walk',   'Family friendly walks that raise awareness as well as funds.',                      '🚶', 'assets/img/community-walk.svg'),
('Food Festival',    'Food stalls and cooking demonstrations donating their takings to charity.',         '🍜', 'assets/img/food-festival.svg');

-- ---------------------------------------------------------------------------
-- Events. Dates are deliberately spread so that some are already past and
-- some are still upcoming - that is what the home page uses to label them.
-- One upcoming event is 'suspended' to show that policy-breaking events are
-- hidden from the public site but still visible to the admin.
-- latitude/longitude are the real coordinates of each Gold Coast venue.
-- ---------------------------------------------------------------------------
INSERT INTO events
(organisation_id, category_id, name, summary, description, event_date, start_time, end_time, venue, suburb, city, state, latitude, longitude, ticket_price, goal_amount, raised_amount, status) VALUES

-- ---- already finished (these appear under "Past events") ----
(1, 1, 'Sunrise Fun Run for Housing',
 'A 5 km run along the beachfront raising money for emergency accommodation.',
 'Join hundreds of runners at first light for a 5 km beachfront fun run. Every dollar raised goes directly into the Foundation''s emergency accommodation fund, which keeps families off the street while they get back on their feet. Walkers, joggers and prams are all welcome - the course is flat and fully sealed.',
 '2026-06-20', '06:30:00', '10:00:00', 'Kurrawa Parklands', 'Broadbeach', 'Gold Coast', 'QLD',
 -28.033300, 153.433300,
 25.00, 60000.00, 68420.00, 'active'),

(3, 5, 'Dune to Dune Community Walk',
 'An 8 km guided walk through the restored dune system.',
 'A gentle 8 km walk from Miami to Burleigh led by our conservation volunteers. Along the way you will hear how the dune system was rebuilt after the 2024 storms and see the nesting sites now being monitored. Suitable for all ages; the last 2 km are wheelchair accessible.',
 '2026-07-18', '08:00:00', '12:00:00', 'Miami Shoreline', 'Miami', 'Gold Coast', 'QLD',
 -28.066700, 153.466700,
 15.00, 25000.00, 27180.00, 'active'),

(2, 2, 'Midwinter Gala Dinner',
 'Black-tie dinner and auction supporting school supplies for 1,200 children.',
 'Our flagship winter event. A three-course dinner, a keynote from a former scholarship student, and a live auction featuring holidays, artwork and a signed jersey. Funds raised in 2026 equipped 1,200 children with the full year''s stationery and textbooks.',
 '2026-08-15', '18:30:00', '22:30:00', 'Southport Community Hall', 'Southport', 'Gold Coast', 'QLD',
 -27.966700, 153.400000,
 120.00, 150000.00, 163450.00, 'active'),

(4, 3, 'Harbour Care Silent Auction',
 'A silent auction of donated art, wine and experiences for the mobile clinic.',
 'More than sixty lots donated by local businesses and artists, displayed in the gallery for two weeks with written bidding throughout. Proceeds purchased a portable ultrasound machine for the mobile health clinic that visits eight coastal towns each month.',
 '2026-09-12', '17:00:00', '21:00:00', 'Harbour Gallery', 'Main Beach', 'Gold Coast', 'QLD',
 -27.983300, 153.433300,
 0.00, 45000.00, 41890.00, 'active'),

-- ---- still to come (these appear under "Upcoming events") ----
(1, 1, 'Twilight 10K for Families',
 'A 10 km twilight run finishing with a community BBQ.',
 'Our biggest running event of the year. The 10 km course starts at the Spit and finishes back at the park for a free community BBQ and live music. Chip timing, medals for every finisher, and a dedicated 2 km kids dash at 5 pm before the main race.',
 '2026-10-24', '17:00:00', '21:00:00', 'The Spit', 'Main Beach', 'Gold Coast', 'QLD',
 -27.983300, 153.433300,
 35.00, 90000.00, 31500.00, 'active'),

(3, 6, 'Coastal Food Festival',
 'Thirty stalls, cooking demos and all takings donated to dune restoration.',
 'Two days of food from thirty coastal kitchens, with cooking demonstrations from three local chefs and a kids'' tasting tent. Every stall donates its takings, and last year''s festival funded 4,000 new dune plants.',
 '2026-11-07', '10:00:00', '18:00:00', 'Broadwater Parklands', 'Southport', 'Gold Coast', 'QLD',
 -27.966700, 153.400000,
 10.00, 55000.00, 8200.00, 'active'),

(2, 4, 'Voices for Kids Charity Concert',
 'An evening of live music with all proceeds funding tutoring programs.',
 'Four local acts, one stage, one cause. The concert funds our after-school tutoring program, which pairs volunteer teachers with students who have fallen behind. Bring a picnic rug; gates open an hour before the first act.',
 '2026-11-21', '19:00:00', '22:00:00', 'Robina Community Stage', 'Robina', 'Gold Coast', 'QLD',
 -28.066700, 153.383300,
 45.00, 40000.00, 12600.00, 'active'),

(4, 2, 'White Coat Ball',
 'Formal ball raising funds for two new mobile health clinics.',
 'Now in its sixth year, the White Coat Ball brings together clinicians, donors and community leaders for an evening of dinner, dancing and a raffle. This year''s target will fund two additional mobile clinics for the northern beaches.',
 '2026-12-05', '18:00:00', '23:00:00', 'Surfers Paradise Ballroom', 'Surfers Paradise', 'Gold Coast', 'QLD',
 -28.000000, 153.433300,
 150.00, 200000.00, 47300.00, 'active'),

(1, 5, 'Christmas Eve Community Walk',
 'A free, family friendly walk on Christmas Eve with carols.',
 'A free one-hour walk through the parklands ending with carols and a shared supper. No registration fee - donations are welcome on the night and go towards our Christmas hamper program, which delivered 900 hampers last December.',
 '2026-12-19', '18:30:00', '20:30:00', 'Cascade Gardens', 'Broadbeach', 'Gold Coast', 'QLD',
 -28.033300, 153.433300,
 0.00, 20000.00, 2450.00, 'active'),

(3, 1, 'New Year Turtle Run',
 'Start the year with a 5 km run that protects nesting sites.',
 'Start 2027 on the sand. This 5 km run follows the beach north from the life saving club and finishes with coffee vans and a volunteer briefing on the summer turtle monitoring season. Early bird entries close 20 December.',
 '2027-01-16', '07:00:00', '10:30:00', 'Burleigh Heads SLSC', 'Burleigh Heads', 'Gold Coast', 'QLD',
 -28.100000, 153.450000,
 30.00, 50000.00, 0.00, 'active'),

(2, 3, 'Back to School Auction',
 'Silent auction of school essentials and local experiences.',
 'Held the week before term starts, this auction features laptops, bikes, tutoring packages and weekend getaways. Every lot funds a specific, costed item in our back-to-school catalogue, so bidders can see exactly what they are paying for.',
 '2027-02-20', '18:00:00', '21:00:00', 'Robina Community Centre', 'Robina', 'Gold Coast', 'QLD',
 -28.066700, 153.383300,
 0.00, 35000.00, 0.00, 'active'),

(4, 4, 'Sounds of the Harbour',
 'A free outdoor concert supporting the mental health program.',
 'A free afternoon concert on the lawn with three acts and a youth showcase. Donations collected on the day support our mental health outreach program, which now runs four evenings a week.',
 '2027-03-13', '15:00:00', '20:00:00', 'Harbour Foreshore Lawn', 'Main Beach', 'Gold Coast', 'QLD',
 -27.983300, 153.433300,
 0.00, 30000.00, 0.00, 'active'),

-- ---- suspended: breaks the organisation's policy, so the public site hides
-- ---- it, but the admin-side must still list it. No registrations on purpose:
-- ---- this is the event used to demonstrate a successful delete.
(1, 6, 'Late Night Street Food Night',
 'Suspended - the proposed venue does not meet our safety policy.',
 'This event was proposed by an external promoter and has been suspended pending a venue safety review. It is stored in the database but is deliberately not shown on the public website.',
 '2026-11-28', '21:00:00', '01:00:00', 'Proposed: Surfers Paradise Mall', 'Surfers Paradise', 'Gold Coast', 'QLD',
 -28.000000, 153.433300,
 20.00, 15000.00, 0.00, 'suspended');

-- ---------------------------------------------------------------------------
-- Registrations (16 rows - the brief asks for at least 10).
-- Spread across past and upcoming events so that:
--   * the event detail page has a real list to sort (newest purchase first),
--   * the admin "delete" button has both outcomes to show:
--       - event 12 / 13 have no registrations  -> delete succeeds
--       - events 1,2,3,5,... have registrations -> delete is blocked (409).
-- Every email is unique per event, which the UNIQUE key guarantees.
-- ---------------------------------------------------------------------------
INSERT INTO registrations
(event_id, first_name, last_name, email, phone, tickets, registration_date, notes) VALUES

-- Sunrise Fun Run for Housing (event 1, 2026-06-20)
(1, 'Ava',     'Thompson', 'ava.thompson@example.com',   '0412 334 118', 2, '2026-05-12', 'Running with my two teenagers.'),
(1, 'Noah',    'Williams', 'noah.williams@example.com',  '0423 771 902', 4, '2026-06-02', 'Bringing the whole family.'),

-- Dune to Dune Community Walk (event 2, 2026-07-18)
(2, 'Mia',     'Chen',     'mia.chen@example.com',       '0431 220 884', 2, '2026-06-25', NULL),
(2, 'Liam',    'O''Connor','liam.oconnor@example.com',   '0445 906 331', 6, '2026-07-10', 'School group booking.'),

-- Midwinter Gala Dinner (event 3, 2026-08-15)
(3, 'Sophie',  'Nguyen',   'sophie.nguyen@example.com',  '0401 558 273', 2, '2026-07-01', 'Table near the stage if possible.'),
(3, 'Ethan',   'Brown',    'ethan.brown@example.com',    '0418 664 507', 10, '2026-08-02', 'Corporate table of ten.'),
(3, 'Olivia',  'Davis',    'olivia.davis@example.com',   '0440 129 776', 4, '2026-08-11', NULL),

-- Twilight 10K for Families (event 5, 2026-10-24)
(5, 'Jack',    'Miller',   'jack.miller@example.com',    '0455 318 640', 3, '2026-09-15', 'First fun run - very excited.'),
(5, 'Chloe',   'Wilson',   'chloe.wilson@example.com',   '0466 204 915', 1, '2026-10-01', NULL),
(5, 'Priya',   'Nair',     'priya.nair@example.com',     '0477 883 052', 2, '2026-10-16', 'Registered on the day entries opened.'),

-- Coastal Food Festival (event 6, 2026-11-07)
(6, 'Daniel',  'Kim',      'daniel.kim@example.com',     '0488 445 190', 5, '2026-10-05', 'Vegetarian stall please.'),

-- Voices for Kids Charity Concert (event 7, 2026-11-21)
(7, 'Emily',   'Carter',   'emily.carter@example.com',   '0402 991 337', 2, '2026-10-08', NULL),

-- White Coat Ball (event 8, 2026-12-05)
(8, 'Marcus',  'Reid',     'marcus.reid@example.com',    '0413 772 468', 2, '2026-09-28', 'Clinician guest.'),

-- Christmas Eve Community Walk (event 9, 2026-12-19)
(9, 'Isla',    'Ferguson', 'isla.ferguson@example.com',  '0427 660 284', 4, '2026-10-12', 'Bringing grandparents along.'),

-- New Year Turtle Run (event 10, 2027-01-16)
(10, 'Grace',  'Liu',      'grace.liu@example.com',      '0491 553 720', 2, '2026-10-14', NULL),

-- Back to School Auction (event 11, 2027-02-20)
(11, 'Thomas', 'Baker',    'thomas.baker@example.com',   '0439 118 605', 1, '2026-10-15', 'Interested in the laptop lots.');

-- ===========================================================================
--  End of export
-- ===========================================================================

SET FOREIGN_KEY_CHECKS=1;
