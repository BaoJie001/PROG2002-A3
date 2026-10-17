-- One-shot repair for the emoji icons on a cPanel database.
--
-- Root cause: CREATE TABLE in our SQL file does not state a character
-- set, so the tables inherited the database default. cPanel databases
-- are often created as utf8mb3 (three bytes per character), which
-- cannot store emoji at all - that is why both the import and the
-- hex UPDATE answered "Incorrect string value".
--
-- Step 1 upgrades the two affected tables to real utf8mb4.
-- Step 2 writes the emoji back as raw hex (this file is pure ASCII,
-- so the character set of the import session cannot damage it).

SET NAMES utf8mb4;

ALTER TABLE categories    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE organisations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

UPDATE categories    SET icon      = CONVERT(UNHEX('F09F8F83') USING utf8mb4) WHERE category_id     = 1;
UPDATE categories    SET icon      = CONVERT(UNHEX('F09FA582') USING utf8mb4) WHERE category_id     = 2;
UPDATE categories    SET icon      = CONVERT(UNHEX('F09F94A8') USING utf8mb4) WHERE category_id     = 3;
UPDATE categories    SET icon      = CONVERT(UNHEX('F09F8EB5') USING utf8mb4) WHERE category_id     = 4;
UPDATE categories    SET icon      = CONVERT(UNHEX('F09F9AB6') USING utf8mb4) WHERE category_id     = 5;
UPDATE categories    SET icon      = CONVERT(UNHEX('F09F8D9C') USING utf8mb4) WHERE category_id     = 6;

UPDATE organisations SET logo_icon = CONVERT(UNHEX('F09F8FA0') USING utf8mb4) WHERE organisation_id = 1;
UPDATE organisations SET logo_icon = CONVERT(UNHEX('F09F8E92') USING utf8mb4) WHERE organisation_id = 2;
UPDATE organisations SET logo_icon = CONVERT(UNHEX('F09F8CBF') USING utf8mb4) WHERE organisation_id = 3;
UPDATE organisations SET logo_icon = CONVERT(UNHEX('E29A95EFB88F') USING utf8mb4) WHERE organisation_id = 4;
