# --- !Ups

CREATE TYPE userRole AS ENUM ('admin');

ALTER TABLE "user" add column "roles" userRole[] default '{}';

# --- !Downs

ALTER TABLE "user" drop column "roles";

DROP TYPE userRole;
