import utils.ExtendedPostgresDriver.simple._

import play.api.libs.json.{ Json, JsValue }

import securesocial.core.{ AuthenticationMethod, PasswordInfo }

package object models {
  implicit val authMethodMapper = MappedColumnType.base[AuthenticationMethod, String](_.method, AuthenticationMethod.apply _)
  implicit val passwordInfoMapper = {
    implicit val formatter = Json.format[PasswordInfo]

    MappedColumnType.base[PasswordInfo, JsValue](Json.toJson(_), _.as[PasswordInfo])
  }
}
