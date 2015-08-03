import utils.ExtendedPostgresDriver.simple._

import play.api.libs.json.{ Json, JsValue }
import org.joda.time.DateTime

import securesocial.core.{ AuthenticationMethod, PasswordInfo, OAuth1Info, OAuth2Info }

package object models {
  implicit val JodaDateTimeTypeMapper = MappedColumnType.base[DateTime, Long](_.getMillis, new DateTime(_))
  implicit val authMethodMapper = MappedColumnType.base[AuthenticationMethod, String](_.method, AuthenticationMethod.apply _)
  implicit val passwordInfoMapper = {
    implicit val formatter = Json.format[PasswordInfo]

    MappedColumnType.base[PasswordInfo, JsValue](Json.toJson(_), _.as[PasswordInfo])
  }
  implicit val oauth1InfoMapper = {
    implicit val formatter = Json.format[OAuth1Info]

    MappedColumnType.base[OAuth1Info, JsValue](Json.toJson(_), _.as[OAuth1Info])
  }
  implicit val oauth2InfoMapper = {
    implicit val formatter = Json.format[OAuth2Info]

    MappedColumnType.base[OAuth2Info, JsValue](Json.toJson(_), _.as[OAuth2Info])
  }
}
