import securesocial.core.SecureSocial
import models.UserModel

package controllers {
  trait SecureController extends BaseController with SecureSocial[UserModel] {
    implicit val env = Global.MyRuntimeEnvironment
  }
}
