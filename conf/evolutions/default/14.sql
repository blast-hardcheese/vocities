# --- !Ups

ALTER TABLE "auth_profile" ADD COLUMN "password_info" json;
ALTER TABLE "auth_profile" ADD COLUMN "oauth1info" json;
ALTER TABLE "auth_profile" ADD COLUMN "oauth2info" json;

# --- !Downs

ALTER TABLE "auth_profile" DROP COLUMN "oauth2info";
ALTER TABLE "auth_profile" DROP COLUMN "oauth1info";
ALTER TABLE "auth_profile" DROP COLUMN "password_info";
