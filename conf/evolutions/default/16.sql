# --- !Ups

CREATE UNIQUE INDEX "template_keys_seq" ON "templates" ("key");

INSERT INTO "templates" (key) values ('plain');

# --- !Downs

DELETE FROM "templates" WHERE key='plain';

DROP INDEX "template_keys_seq";
