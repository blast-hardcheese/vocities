# --- !Ups

DELETE FROM "user";
CREATE SEQUENCE "user_id_seq";
ALTER TABLE "user" ALTER "id" SET DEFAULT nextval('user_id_seq');
SELECT SETVAL('user_id_seq', 1 );

# --- !Downs

ALTER TABLE "user" ALTER "id" SET DEFAULT NULL;
DROP SEQUENCE "user_id_seq";
