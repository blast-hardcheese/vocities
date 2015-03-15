# --- !Ups

create table "customers" ("id" BIGINT NOT NULL PRIMARY KEY,"name" VARCHAR NOT NULL);
create table "domains" ("id" BIGINT NOT NULL PRIMARY KEY,"customer_id" BIGINT NOT NULL,"domain" VARCHAR NOT NULL);
create table "pages" ("customer_id" BIGINT NOT NULL,"domain_id" BIGINT NOT NULL,"path" VARCHAR NOT NULL,"template_id" BIGINT NOT NULL,"title" VARCHAR NOT NULL,"data" VARCHAR NOT NULL);
create table "templates" ("id" BIGINT NOT NULL PRIMARY KEY,"key" VARCHAR NOT NULL,"css_template" VARCHAR NOT NULL,"css_value" VARCHAR NOT NULL);

# --- !Downs

drop table "templates";
drop table "pages";
drop table "domains";
drop table "customers";
