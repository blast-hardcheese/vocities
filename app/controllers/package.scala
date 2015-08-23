import play.api.mvc.RequestHeader
import securesocial.core.{ SecureSocial, Authorization }
import models.{ UserModel, UserRoles }

package controllers {
  trait SecureController extends BaseController with SecureSocial[UserModel] {
    implicit val env = Global.MyRuntimeEnvironment
  }

  case class WithPrimaryProvider(provider: String) extends Authorization[UserModel] {
    def isAuthorized(user: UserModel, request: RequestHeader) = {
      user.main.providerId == provider
    }
  }

  case class WithSecondaryProvider(provider: String) extends Authorization[UserModel] {
    def isAuthorized(user: UserModel, request: RequestHeader) = {
      user.identities.view
        .filter(_.providerId != user.main.providerId)
        .exists(_.providerId == provider)
    }
  }

  case class WithRoles(roles: UserRoles.UserRole*) extends Authorization[UserModel] {
    def isAuthorized(user: UserModel, request: RequestHeader) = {
      (roles.toSet diff user.user.roles.toSet).isEmpty
    }
  }
}
