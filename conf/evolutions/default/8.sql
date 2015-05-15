# --- !Ups

CREATE SEQUENCE accounts_id_seq;
ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT NEXTVAL('accounts_id_seq'::regclass);
UPDATE "accounts" SET id = DEFAULT;

CREATE SEQUENCE templates_id_seq;
ALTER TABLE "templates" ALTER COLUMN "id" SET DEFAULT NEXTVAL('templates_id_seq'::regclass);
UPDATE "templates" SET id = DEFAULT;

CREATE SEQUENCE domains_id_seq;
ALTER TABLE "domains" ALTER COLUMN "id" SET DEFAULT NEXTVAL('domains_id_seq'::regclass);
UPDATE "domains" SET id = DEFAULT;

CREATE UNIQUE INDEX CONCURRENTLY ON domains (domain);
CREATE UNIQUE INDEX CONCURRENTLY ON templates (key);

INSERT INTO "templates" (key, css_template, css_values) values ('html5up-prologue', '', '{}');

# --- !Downs

DELETE FROM "templates" where key = 'html5up-prologue';

DROP INDEX templates_key_idx;
DROP INDEX domains_domain_idx;

ALTER TABLE "domains" ALTER COLUMN "id" SET DEFAULT NULL;
DROP SEQUENCE domains_id_seq;

ALTER TABLE "templates" ALTER COLUMN "id" SET DEFAULT NULL;
DROP SEQUENCE templates_id_seq;

ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT NULL;
DROP SEQUENCE accounts_id_seq;
