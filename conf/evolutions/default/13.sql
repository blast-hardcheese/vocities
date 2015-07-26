# --- !Ups

ALTER TABLE "accounts" ADD COLUMN "credits" int default 0;

# --- !Downs

ALTER TABLE "accounts" DROP COLUMN "credits";
