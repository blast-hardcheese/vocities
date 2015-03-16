# --- !Ups

CREATE TABLE "auth_profile" (
    "userId" bigint not null,
    "providerId" text not null,
    "providerUserId" text not null,
    "firstName" text,
    "lastName" text,
    "fullName" text,
    "email" text,
    "avatarUrl" text,
    "authMethod" text
);

# --- !Downs

DROP TABLE "auth_profile";
