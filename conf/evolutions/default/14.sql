# --- !Ups

ALTER TABLE "auth_profile" ADD COLUMN "password_info" json;

# --- !Downs

ALTER TABLE "auth_profile" DROP COLUMN "password_info";
