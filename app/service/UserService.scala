package service

import play.api.Logger
import play.api.Play.current
import play.api.db.slick._
import securesocial.core._
import securesocial.core.providers.{ UsernamePasswordProvider, MailToken }
import scala.concurrent.Future
import securesocial.core.services.{ UserService, SaveMode }

import models.{ UserModel, AuthProfiles, MailTokens }

class PostgresUserService extends UserService[UserModel] {
  val log = Logger("application.services.UserService")

  def find(providerId: String, userId: String): Future[Option[BasicProfile]] = {
    DB.withSession { implicit s =>
      Future.successful(AuthProfiles.lookupProfile(providerId, userId))
    }
  }

  def save(profile: BasicProfile, mode: SaveMode): Future[UserModel] = {
    mode match {
      case SaveMode.SignUp =>
        log.info(s"Sign up for ${profile.fullName}")
        DB.withTransaction { implicit s =>
          Future.successful(AuthProfiles.newUser(profile))
        }
      case SaveMode.LoggedIn =>
        log.info(s"Logged in for ${profile.fullName}")
        DB.withTransaction { implicit s =>
          Future.successful(
            AuthProfiles.updateProfile(profile)
              .flatMap(AuthProfiles.lookupUser)
              .getOrElse {
                // If we couldn't find this auth, create a new user
                AuthProfiles.newUser(profile)
              }
          )
        }
      case SaveMode.PasswordChange =>
        log.info(s"Password change for ${profile.fullName}")
        DB.withSession { implicit s =>
          Future.successful(
            AuthProfiles.updateProfile(profile)
              .flatMap(AuthProfiles.lookupUser)
              .get
          )
        }
    }
  }

  def link(currentUser: UserModel, to: BasicProfile): Future[UserModel] = {
    log.info(s"Linking ${currentUser.main.fullName} to (${to.providerId}, ${to.userId})")
    DB.withTransaction { implicit s =>
      Future.successful(AuthProfiles.associateProfile(currentUser, to))
    }
  }

  def updatePasswordInfo(user: UserModel, info: PasswordInfo): Future[Option[BasicProfile]] = {
    Future.successful(
      user
        .identities
        .filter(_.providerId == UsernamePasswordProvider.UsernamePassword)
        .headOption
        .flatMap { basicProfile =>
          DB.withSession { implicit s =>
            AuthProfiles.updateProfile(
              basicProfile
                .copy(passwordInfo = Some(info))
            )
          }
        }
    )
  }

  def passwordInfoFor(user: UserModel): Future[Option[PasswordInfo]] = {
    Future.successful(
      user
        .identities
        .filter(_.providerId == UsernamePasswordProvider.UsernamePassword)
        .headOption
        .flatMap { _.passwordInfo }
    )
  }

  def findByEmailAndProvider(email: String, providerId: String): Future[Option[BasicProfile]] = {
    DB.withSession { implicit s =>
      Future.successful(AuthProfiles.lookupProfile(providerId, email))
    }
  }

  def deleteExpiredTokens(): Unit = {
    DB.withSession { implicit s =>
      MailTokens.deleteExpired()
    }
  }

  def deleteToken(token: String): scala.concurrent.Future[Option[securesocial.core.providers.MailToken]] = {
    DB.withSession { implicit s =>
      Future.successful(MailTokens.deleteToken(token))
    }
  }

  def findToken(token: String): scala.concurrent.Future[Option[securesocial.core.providers.MailToken]] = {
    DB.withSession { implicit s =>
      Future.successful(MailTokens.findByToken(token))
    }
  }

  def saveToken(token: securesocial.core.providers.MailToken): scala.concurrent.Future[securesocial.core.providers.MailToken] = {
    DB.withSession { implicit s =>
      Future.successful(MailTokens.save(token))
    }
  }
}
