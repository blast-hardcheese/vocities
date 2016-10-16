package views.account
import controllers.{ RenderModel, routes, WebJarAssets }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}
import models.UserModel

import scalatags.Text.all._

object edit {
  def apply(domain: String, vm: models.PageEditViewModel): Frag = {
    html(
      head(
        tag("title")("VOCities - Account Home"),
        meta(httpEquiv:="content-type", content:="text/html; charset=utf-8"),
        meta(name:="viewport", content:="width=device-width, initial-scale=1"),

        link(rel:="shortcut icon", `type`:="image/png", href:=routes.Assets.at("images/favicon.png").toString),
        link(rel:="stylesheet", media:="screen", href:=routes.Assets.at("stylesheets/reset.css").toString),
        link(rel:="stylesheet", media:="screen", href:=routes.WebJarAssets.at(WebJarAssets.locate("bootstrap.css")).toString),
        link(rel:="stylesheet", media:="screen", href:=routes.WebJarAssets.at(WebJarAssets.locate("2.1.2/build/toastr.css")).toString),
        raw(s"""<!--[if lte IE 8]><script src="${routes.Assets.at("stylesheets/ie/html5shiv.js").toString}"></script><![endif]-->"""),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("jquery.min.js")).toString),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("react-with-addons.js")).toString),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("underscore.js")).toString),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("jquery.typewatch.js")).toString),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("2.1.2/toastr.js")).toString),

        script(`type`:="text/javascript")(raw(s"""
          |PageInfo = {
          |  domain: ${Json.stringify(JsString(domain))},
          |  path: ${Json.stringify(Json.toJson(vm.page.path))},
          |  saveUrl: ${Json.stringify(JsString(routes.Application.save(domain, vm.page.path, templateId=vm.template_key).toString()))},
          |};
          |var PageData = ${utils.views.encodePageData(None, vm.page.title, vm.page.data).render};
          |""".stripMargin)),

        script(src:=routes.Assets.at("javascripts/editor.js").toString, `type`:="text/javascript")
      ),
      body(
        h3("Info"),
        div(`class`:="title")(
          label(`for`:="title")("Page title"),
          input(id:="title", name:="title", value:="")
        ),
        div(`class`:="analytics ga")(
          label(`for`:="ga-trackingId")("Google Analytics"),
          input(id:="ga-trackingId")
        ),
        div(`class`:="metadata custom-code")(
          label(`for`:="custom-code")("Custom code"),
          textarea(id:="custom-code", style:="height: 200px; width: 70%")
        ),
        form(`class`:="container")(
          textarea(name:="data", `class`:="col-xs-12", style:="display: none; height: 500px"),
          button(`type`:="submit", name:="save", style:="float: right")("Save")
        ),
        ul(
          li(a(href:=routes.Application.edit(domain, vm.page.path).toString)("Edit Page")),
          li(a(href:=routes.Users.index.toString)("Back"))
        )
      )
    )
  }
}
