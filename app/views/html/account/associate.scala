package views.account
import controllers.{ RenderModel, routes }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}
import models.UserModel

import scalatags.Text.all._

object associate {

  def apply()(implicit request: controllers.Users.SecuredRequest[_], env: securesocial.core.RuntimeEnvironment[UserModel]) = {

    val providers = (
      env.providers
          .values
          .filter(_.id != request.user.main.providerId)
          .filter(_.id != securesocial.core.providers.UsernamePasswordProvider.UsernamePassword)
    )

    base("Auth - Link")()(List(
        h3("Link accounts")
      ) ++ (
        if (providers.isEmpty) {
          Seq(p("No alternate authentication providers have been defined"))
        } else {
          providers.map { provider =>
            if (request.user.identities.exists(_.providerId == provider.id)) {
              a(href:=routes.Users.disassociate(provider.id).toString)(s"Disassociate ${provider.id}")
            } else {
              a(href:=env.routes.authenticationUrl(provider.id, Some(routes.Users.associateResult(provider.id).toString)).toString
               )(s"Associate your ${provider.id} account")
            }
          }
        }
      )
    )
  }
}
