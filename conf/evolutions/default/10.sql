# --- !Ups

UPDATE "templates" SET key='html5up_read_only' WHERE key='html5up-read-only';
UPDATE "templates" SET key='html5up_prologue' WHERE key='html5up-prologue';

# --- !Downs

UPDATE "templates" SET key='html5up-read-only' WHERE key='html5up_read_only';
UPDATE "templates" SET key='html5up-prologue' WHERE key='html5up_prologue';
