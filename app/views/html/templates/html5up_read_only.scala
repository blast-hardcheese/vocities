package views.templates
import controllers.{ RenderModel, routes }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}
import play.twirl.api.Html

import scalatags.Text.all._

object html5up_read_only {

  def apply(engine: javax.script.ScriptEngine, saveUrl: Option[String])(renderModel: RenderModel): Html = {

    val pageData = renderModel.pageData
    val templateId = "html5up_read_only"

    val templateIdJson = JsString(templateId)

    def sharedCssPath(path: String): String = routes.Assets.at("stylesheets/html5up/" + path).toString
    def cssPath(path: String): String = routes.Assets.at(s"stylesheets/${templateId}/${path}").toString

    val header: List[Frag] = List(
      meta(httpEquiv:="content-type", content:="text/html; charset=utf-8"),
      meta(name:="description", content:=""),
      meta(name:="keywords", content:=""),
      raw(s"""<!--[if lte IE 8]><link rel="stylesheet" href="${cssPath("ie/v8.css")}" /><![endif]-->"""),

      link(rel:="stylesheet", href:=cssPath("style.css")),
      link(rel:="stylesheet", href:=cssPath("style-xlarge.css")),
      link(rel:="stylesheet", href:=cssPath("style-large.css")),
      link(rel:="stylesheet", href:=cssPath("style-medium.css")),
      link(rel:="stylesheet", href:=cssPath("style-small.css")),
      link(rel:="stylesheet", href:=cssPath("style-xsmall.css")),
      tag("style")(id:="dynamic", `type`:="text/css"),

      tag("style")(id:="dynamic-tpl", `type`:="text/underscore")(raw("""
        |#header {
        |    background: <%= primary_bg %>;
        |    color: <%= primary_fg %>;
        |}
        |
        |#header > nav ul li a.active {
        |    background: <%= nav_active_bg %>;
        |    color: <%= nav_active_fg %> !important;
        |}
        |
        |#header > footer .icons li a {
        |    color: <%= secondary_fg %>;
        |}
        |
        |#header > nav ul li {
        |    border-top: solid 2px <%= accent %>;
        |}
        |
        |#header > header p {
        |    color: <%= primary_fg %>;
        |}
        |
        |header.major h2 {
        |    color: <%= primary_bg %>;
        |}
        |
        |header.major h2 + p {
        |    color: <%= dark_text %>;
        |}
        |
        |body, input, select, textarea {
        |    color: <%= normal_text %>;
        |}
        |
        |.widget.w-youtube .wrapper { width: 100%; height: 33em; }
        |
        |@media (max-width: 1680px) {
        |    .widget.w-youtube[data-size="normal"] > .wrapper { height: 33em; }
        |}
        |
        |@media (max-width: 1280px) {
        |    .widget.w-youtube[data-size="normal"] > .wrapper { height: 31em; }
        |
        |    #titleBar > span.toggle::before {
        |        background-color: <%= primary_bg %>;
        |    }
        |}
        |
        |@media (max-width: 1024px) {
        |    .widget.w-youtube[data-size="normal"] > .wrapper { height: 40em; }
        |    #sidePanel { background-color: <%= primary_bg %>; }
        |}
        |
        |@media (max-width: 736px) {
        |    .widget.w-youtube[data-size="normal"] > .wrapper { height: 30em; }
        |}
        |
        |@media (max-width: 480px) {
        |    .widget.w-youtube[data-size="normal"] > .wrapper { height: 19em; }
        |}
        |""".stripMargin))
      )

    val afterBody: List[Frag] = List(
      script(id:="dynamic-tpl-values", `type`:="text/json")(raw("""
        |{
        |    "css": {
        |        "scheme": 0,
        |
        |        "values": {
        |            "dark_text": "#777777",
        |            "normal_text": "#888888"
        |        },
        |
        |        "schemes": [
        |            {
        |                "primary_bg":    "#4ACAA8",
        |                "primary_fg":    "#D1F1E9",
        |                "secondary_fg":  "#B6E9DC",
        |                "accent":        "#5CCFB0",
        |                "nav_active_bg": "#FFFFFF",
        |                "nav_active_fg": "#4ACAA8"
        |            },
        |            {
        |                "primary_bg":    "#BD4ACA",
        |                "primary_fg":    "#EDD1F1",
        |                "secondary_fg":  "#DEB6E9",
        |                "accent":        "#C85CCF",
        |                "nav_active_bg": "#ffffff",
        |                "nav_active_fg": "#BD4ACA"
        |            }
        |        ]
        |    }
        |}
        |""".stripMargin)),
      script(`type`:="text/javascript")(raw(s"""
        |var PageData = ${utils.views.encodePageData(saveUrl, renderModel.title, renderModel.pageData).render};
        |window.CloudinarySettings = ${utils.views.cloudinaryData.render};
        |
        |jQuery(function($$) {
        |    new TemplateManager(${templateIdJson}, PageData);
        |});
        |""".stripMargin)),

      raw(utils.views.createElement(templateIdJson, "#metadata", pageData)(engine))
    )

    main(renderModel.title)(header, afterBody)(List(
      div(id:="add-popup")(raw(utils.views.createElement(templateIdJson, "#add-popup", pageData)(engine))),
      div(id:="wrapper")(
        div(id:="header-wrapper")(raw(utils.views.createElement(templateIdJson, "#header-wrapper", pageData)(engine))),
        div(id:="main-wrapper")(raw(utils.views.createElement(templateIdJson, "#main-wrapper", pageData)(engine))),
        div(id:="footer")(raw(utils.views.createElement(templateIdJson, "#footer", pageData)(engine))),
        div(id:="admin-buttons")(raw(utils.views.createElement(templateIdJson, "#admin-buttons", pageData)(engine)))
      )
    ))
  }
}
