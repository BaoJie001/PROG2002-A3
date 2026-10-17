-- Fix the emoji icons after a bad import.
--
-- Every value is written as raw hex, so this file is pure ASCII and
-- cannot be damaged by the character set of the import session.
-- In phpMyAdmin: select your database, open the SQL tab, paste this
-- whole file, press Go.

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
