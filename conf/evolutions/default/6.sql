# --- !Ups

ALTER TABLE "customers" ADD COLUMN "user_ids" bigint[];
ALTER TABLE "customers" RENAME TO "accounts";
ALTER TABLE "domains" RENAME COLUMN "customer_id" TO "account_id";
ALTER TABLE "pages" RENAME COLUMN "customer_id" TO "account_id";

# --- !Downs

ALTER TABLE "pages" RENAME COLUMN "account_id" TO "customer_id";
ALTER TABLE "domains" RENAME COLUMN "account_id" TO "customer_id";
ALTER TABLE "accounts" RENAME TO "customers";
ALTER TABLE "customers" DROP COLUMN "user_ids";
