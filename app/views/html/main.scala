package views.templates
import controllers.{ RenderModel, routes }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}
import play.twirl.api.Html
import controllers.WebJarAssets
import scalatags.Text.all._

object main {
  def apply(pageTitle: String)(header: List[Frag], afterBody: List[Frag])(bodyFrags: List[Frag]): Html = {

    Html(html(
        head(
            tag("title")(pageTitle),
            meta(httpEquiv:="content-type", content:="text/html; charset=utf-8"),
            meta(name:="description", content:=""),
            meta(name:="keywords", content:=""),

            link(rel:="stylesheet", media:="screen", href:=routes.Assets.at("stylesheets/reset.css").toString),
            link(rel:="stylesheet", href:=routes.WebJarAssets.at(WebJarAssets.locate("font-awesome.min.css")).toString),

            link(rel:="stylesheet", media:="screen", href:=routes.Assets.at("stylesheets/main.css").toString),
            link(rel:="stylesheet", media:="screen", href:=routes.Assets.at("stylesheets/sc-player-standard.css").toString),
            link(rel:="shortcut icon", `type`:="image/png", href:=routes.Assets.at("images/favicon.png").toString),
            raw(s"""<!--[if lte IE 8]><script src="${routes.Assets.at("stylesheets/ie/html5shiv.js").toString}"></script><![endif]-->"""),

            raw("<!-- Edit Only below here -->"),
            link(rel:="stylesheet", media:="screen", href:=routes.WebJarAssets.at(WebJarAssets.locate("2.1.2/build/toastr.css")).toString),
            raw("<!-- End edit only section -->"),

            header
        ),
        body(
            bodyFrags,

            script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("jquery.min.js")).toString),
            script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("react-with-addons.js")).toString),
            script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("underscore.js")).toString),
            script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("tinymce.min.js")).toString),
            script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("reflux.min.js")).toString),
            script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("tinycolor.js")).toString),

            raw("<!-- Edit Only below here -->"),
            script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("2.1.2/toastr.js")).toString),
            raw("<!-- End edit only section -->"),

            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/skel.min.js").toString),
            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/skel-layers.min.js").toString),

            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/events.js").toString ),

            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/soundcloud.api.js").toString),
            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/mixins.js").toString),
            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/widgets.js").toString),
            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/components/structure.js").toString),
            script(`type`:="text/javascript", src:=routes.Assets.at("javascripts/templates.js").toString),

            afterBody
        )
    ).toString)
  }
}
