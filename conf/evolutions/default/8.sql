# --- !Ups

CREATE SEQUENCE accounts_id_seq;
ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT NEXTVAL('accounts_id_seq'::regclass);
UPDATE "accounts" SET id = DEFAULT;

CREATE SEQUENCE templates_id_seq;
ALTER TABLE "templates" ALTER COLUMN "id" SET DEFAULT NEXTVAL('templates_id_seq'::regclass);
UPDATE "templates" SET id = DEFAULT;

# --- !Downs

ALTER TABLE "templates" ALTER COLUMN "id" SET DEFAULT NULL;
DROP SEQUENCE templates_id_seq;

ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT NULL;
DROP SEQUENCE accounts_id_seq;
