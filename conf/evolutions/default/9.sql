# --- !Ups

ALTER TABLE templates DROP COLUMN css_template;
ALTER TABLE templates DROP COLUMN css_values;

# --- !Downs

ALTER TABLE templates ADD COLUMN css_values json NOT NULL DEFAULT '{}';
ALTER TABLE templates ADD COLUMN css_template varchar NOT NULL DEFAULT '';
