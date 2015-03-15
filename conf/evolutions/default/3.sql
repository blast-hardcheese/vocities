# --- !Ups

DELETE FROM "pages";
DELETE FROM "templates";

ALTER TABLE "templates" RENAME "css_value" TO "css_values";
ALTER TABLE "templates" ALTER COLUMN "css_values" TYPE json USING ("css_values" :: json);
ALTER TABLE "pages" ALTER COLUMN "data" TYPE json USING ("data" :: json);

# --- !Downs

ALTER TABLE "pages" ALTER COLUMN "data" TYPE text;
ALTER TABLE "templates" ALTER COLUMN "css_values" TYPE text;
ALTER TABLE "templates" RENAME "css_values" TO "css_value";
