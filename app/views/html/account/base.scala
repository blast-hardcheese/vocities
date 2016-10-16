package views.account
import controllers.{ RenderModel, routes }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}
import models.UserModel

import scalatags.Text.all._

object base {
  def apply(pageTitle: String)(header: Frag = Seq.empty[Frag])(pageBody: Frag): Frag = {
    html(
      head(
        tag("title")(pageTitle),
        header
      ),
      body(
        pageBody
      )
    )
  }
}
