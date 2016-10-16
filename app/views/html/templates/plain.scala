package views.templates
import controllers.{ RenderModel, routes }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}
import play.twirl.api.Html

import scalatags.Text.all._

object plain {

  def apply(engine: javax.script.ScriptEngine, saveUrl: Option[String])(renderModel: RenderModel): Html = {
    val pageData = renderModel.pageData
    val templateId = "plain"

    val templateIdJson = Html(Json.stringify(JsString(templateId)))

    val header: List[Frag] = List(
      meta(httpEquiv:="content-type", content:="text/html; charset=utf-8"),
      meta(name:="description", content:=""),
      meta(name:="keywords", content:=""),
      tag("style")(id:="dynamic", `type`:="text/css")
    )

    val afterBody: List[Frag] = List(
      script(`type`:="text/javascript")(s"""
        |var PageData = ${utils.views.encodePageData(saveUrl, renderModel.title, renderModel.pageData).render};
        |window.CloudinarySettings = ${utils.views.cloudinaryData.render};
        |
        |jQuery(function($$) {
        |
        |    var mgr = new TemplateManager(${templateIdJson}, PageData);
        |    window.mgr = mgr;
        |
        |});
        |""".stripMargin),
      raw(utils.views.createElement(templateIdJson, "#metadata", pageData)(engine))
    )

    main(renderModel.title)(header, afterBody)(List(
      div(id:="sidebar")(
        raw(utils.views.createElement(templateIdJson, "#sidebar", pageData)(engine))
      ),

      div(id:="main-content")(
        raw(utils.views.createElement(templateIdJson, "#main-content", pageData)(engine))
      ),

      section(id:="footer")(
        raw(utils.views.createElement(templateIdJson, "#footer", pageData)(engine))
      ),

      div(id:="add-popup")(
        raw(utils.views.createElement(templateIdJson, "#add-popup", pageData)(engine))
      ),

      div(id:="admin-buttons")(
        raw(utils.views.createElement(templateIdJson, "#admin-buttons", pageData)(engine))
      )
    ))
  }
}
