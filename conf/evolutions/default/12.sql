# --- !Ups

ALTER TABLE "user" RENAME TO "users";

# --- !Downs

ALTER TABLE "users" RENAME TO "user";
