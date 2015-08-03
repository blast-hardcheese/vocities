import utils.ExtendedPostgresDriver.simple._

import securesocial.core.AuthenticationMethod

package object models {
  implicit val authMethodMapper = MappedColumnType.base[AuthenticationMethod, String](_.method, AuthenticationMethod.apply _)
}
