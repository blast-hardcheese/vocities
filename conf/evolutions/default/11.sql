# --- !Ups

CREATE TYPE userRole AS ENUM ('admin');

# --- !Downs

DROP TYPE userRole;
