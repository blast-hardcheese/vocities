# --- !Ups

update "templates" set css_template = '
<% for(i in section_banners) { %>
#main section<%= section_banners[i].section %>::before {
    background-image: url(''<%= section_banners[i].url %>'');;
    background-position: top right;;
    background-repeat: no-repeat;;
    background-size: cover;;
    content: '''';;
    display: block;;
    height: 15em;;
    width: 100%;;
}
<% } %>

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
}

@media (max-width: 1024px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 40em;; }
}

@media (max-width: 736px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 30em;; }
}

@media (max-width: 480px) {
  .widget.w-youtube[data-size="normal"] > .wrapper { height: 19em;; }
}
' where key = 'html5up-read-only';

# --- !Downs

update "templates" set css_template = '
<% for(i in section_banners) { %>
#main section<%= section_banners[i].section %>::before {
    background-image: url(''<%= section_banners[i].url %>'');;
    background-position: top right;;
    background-repeat: no-repeat;;
    background-size: cover;;
    content: '''';;
    display: block;;
    height: 15em;;
    width: 100%;;
}
<% } %>

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

header.major h2 {
  color: <%= primary_bg %>;;
}

header.major h2 + p {
  color: <%= dark_text %>;;
}

body, input, select, textarea {
  color: <%= normal_text %>;;
}

.w-youtube { width: <%= youtube_width || "100%" %>;; height: <%= youtube_height || "480px" %>;; }
' where key = 'html5up-read-only';
