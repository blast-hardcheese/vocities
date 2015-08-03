# --- !Ups

CREATE TABLE "mail_tokens" (
    "uuid" text not null,
    "email" text not null,
    "creation_time" bigint not null,
    "expiration_time" bigint not null,
    "is_sign_up" boolean not null,
    "used" boolean default false,
    "expired" boolean default false
);

ALTER TABLE "auth_profile" ADD COLUMN "password_info" json;
ALTER TABLE "auth_profile" ADD COLUMN "oauth1info" json;
ALTER TABLE "auth_profile" ADD COLUMN "oauth2info" json;

# --- !Downs

ALTER TABLE "auth_profile" DROP COLUMN "oauth2info";
ALTER TABLE "auth_profile" DROP COLUMN "oauth1info";
ALTER TABLE "auth_profile" DROP COLUMN "password_info";

DROP TABLE "mail_tokens";
