# --- !Ups

create table "user" (
    "id" bigint not null,
    "username" text not null
);

# --- !Downs

drop table "user";
