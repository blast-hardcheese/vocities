package service

import play.api.Logger
import play.api.Play.current
import play.api.db.slick._
import securesocial.core._
import securesocial.core.providers.{ UsernamePasswordProvider, MailToken }
import scala.concurrent.Future
import securesocial.core.services.{ UserService, SaveMode }

import models.UserModel

class InMemoryUserService extends UserService[UserModel] {
  type ProviderId = String
  type ProviderUserId = String

  val log = Logger("application.services.UserService")
  var users = Map.empty[(ProviderId, ProviderUserId), UserModel]

  def find(providerId: String, userId: String): Future[Option[BasicProfile]] = {
    DB.withSession { implicit s =>
      Future.successful(models.AuthProfiles.lookupProfile(providerId, userId))
    }
  }

  def save(user: BasicProfile, mode: SaveMode): Future[UserModel] = {
    val profile = user
    mode match {
      case SaveMode.SignUp =>
        log.info(s"Sign in for ${profile.fullName}")
        DB.withTransaction { implicit s =>
          Future.successful(models.AuthProfiles.newUser(profile))
        }
      case SaveMode.LoggedIn =>
        log.info(s"Logged in for ${profile.fullName}")
        DB.withTransaction { implicit s =>
          Future.successful(
            models.AuthProfiles.modelForProfile(profile).getOrElse {
              // If we couldn't find this auth, create a new user
              models.AuthProfiles.newUser(profile)
            }
          )
        }
      case SaveMode.PasswordChange => throw new Exception("Password changes unsupported")
    }
  }

  def link(currentUser: UserModel, to: BasicProfile): Future[UserModel] = {
    DB.withTransaction { implicit s =>
      Future.successful(models.AuthProfiles.associateProfile(currentUser, to))
    }
  }

  def updatePasswordInfo(user: UserModel, info: PasswordInfo): Future[Option[BasicProfile]] = ???
  def passwordInfoFor(user: UserModel): Future[Option[PasswordInfo]] = ???
  def findByEmailAndProvider(email: String, providerId: String): Future[Option[BasicProfile]] = ???
  def deleteExpiredTokens(): Unit = ???
  def deleteToken(uuid: String): scala.concurrent.Future[Option[securesocial.core.providers.MailToken]] = ???
  def findToken(token: String): scala.concurrent.Future[Option[securesocial.core.providers.MailToken]] = ???
  def saveToken(token: securesocial.core.providers.MailToken): scala.concurrent.Future[securesocial.core.providers.MailToken] = ???
}
