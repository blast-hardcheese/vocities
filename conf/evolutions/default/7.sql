# --- !Ups

insert into "templates" (id, key, css_values, css_template) values (1, 'html5up-read-only', 'null', '');

update "templates" set css_values = '
{
  "youtube_width": null,
  "youtube_height": null,

  "primary_bg": "#4acaa8",
  "primary_color": "#d1f1e9",
  "hilight_color": "#b6e9dc",
  "accent_color": "#5ccfb0",
  "nav_active_bg": "white",
  "nav_active_color": "#4acaa8",

  "dark_text": "#777777",
  "normal_text": "#888888",
  "section_banners": [
    {"url": "http://html5up.net/uploads/demos/read-only/images/banner.jpg", "section": "#first"}
  ]
}
' where key = 'html5up-read-only';

update "templates" set css_template = '
#header {
    background: <%= primary_bg %>;;
    color: <%= primary_color %>;;
}

#header > nav ul li a.active {
    background: <%= nav_active_bg %>;;
    color: <%= nav_active_color %> !important;;
}

#header > footer .icons li a {
    color: <%= hilight_color %>;;
}

#header > nav ul li {
  border-top: solid 2px <%= accent_color %>;;
}

#header > header p {
  color: <%= primary_color %>;;
}

header.major h2 {
  color: <%= primary_bg %>;;
}

header.major h2 + p {
  color: <%= dark_text %>;;
}

body, input, select, textarea {
  color: <%= normal_text %>;;
}

.widget.w-youtube .wrapper { width: 100%;; height: 33em;; }

@media (max-width: 1680px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 33em;; }
}

@media (max-width: 1280px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 31em;; }

  #titleBar > span.toggle::before {
    background-color: <%= primary_bg %>;;
  }
}

@media (max-width: 1024px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 40em;; }
  #sidePanel { background-color: <%= primary_bg %>;; }
}

@media (max-width: 736px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 30em;; }
}

@media (max-width: 480px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 19em;; }
}
' where key = 'html5up-read-only';

CREATE UNIQUE INDEX pages_account_domain ON pages (account_id, domain_id);

# --- !Downs

delete from "templates" where key = 'html5up-read-only';

DROP INDEX pages_account_domain;
