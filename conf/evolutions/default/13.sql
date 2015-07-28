# --- !Ups

CREATE TYPE domain_class AS ENUM ('basic', 'advanced', 'premium', 'unlimited');

ALTER TABLE "accounts" ADD COLUMN "credits" int default 0;
ALTER TABLE "domains" ADD COLUMN "class" domain_class default 'basic';

# --- !Downs

ALTER TABLE "domains" DROP COLUMN "class";
ALTER TABLE "accounts" DROP COLUMN "credits";

DROP TYPE domain_class;
