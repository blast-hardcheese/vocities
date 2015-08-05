# --- !Ups

CREATE UNIQUE INDEX "auth_profile_user_unique_constraint" ON "auth_profile" ("providerId", "providerUserId");

# --- !Downs

DROP INDEX "auth_profile_user_unique_constraint";
