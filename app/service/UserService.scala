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

  private def findProfile(p: BasicProfile) = {
    users.find {
      case (key, value) if value.identities.exists(su => su.providerId == p.providerId && su.userId == p.userId) => true
      case _ => false
    }
  }

  private def updateProfile(user: BasicProfile, entry: ((ProviderId, ProviderUserId), UserModel)): Future[UserModel] = {
    val identities = entry._2.identities
    val updatedList = identities.patch(identities.indexWhere(i => i.providerId == user.providerId && i.userId == user.userId), Seq(user), 1)
    val updatedUser = entry._2.copy(identities = updatedList)
    users = users + (entry._1 -> updatedUser)
    Future.successful(updatedUser)
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

  def link(current: UserModel, to: BasicProfile): Future[UserModel] = {
    if (current.identities.exists(i => i.providerId == to.providerId && i.userId == to.userId)) {
      Future.successful(current)
    } else {
      val added = to :: current.identities
      val updatedUser = current.copy(identities = added)
      users = users + ((current.main.providerId, current.main.userId) -> updatedUser)
      Future.successful(updatedUser)
    }
  }

  override def updatePasswordInfo(user: UserModel, info: PasswordInfo): Future[Option[BasicProfile]] = {
    Future.successful {
      for (
        found <- users.values.find(_ == user);
        identityWithPasswordInfo <- found.identities.find(_.providerId == UsernamePasswordProvider.UsernamePassword)
      ) yield {
        val idx = found.identities.indexOf(identityWithPasswordInfo)
        val updated = identityWithPasswordInfo.copy(passwordInfo = Some(info))
        val updatedIdentities = found.identities.patch(idx, Seq(updated), 1)
        val updatedEntry = found.copy(identities = updatedIdentities)
        users = users + ((updatedEntry.main.providerId, updatedEntry.main.userId) -> updatedEntry)
        updated
      }
    }
  }

  override def passwordInfoFor(user: UserModel): Future[Option[PasswordInfo]] = {
    Future.successful {
      for (
        found <- users.values.find(u => u.main.providerId == user.main.providerId && u.main.userId == user.main.userId);
        identityWithPasswordInfo <- found.identities.find(_.providerId == UsernamePasswordProvider.UsernamePassword)
      ) yield {
        identityWithPasswordInfo.passwordInfo.get
      }
    }
  }

  def findByEmailAndProvider(email: String, providerId: String): Future[Option[BasicProfile]] = ???
  def deleteExpiredTokens(): Unit = ???
  def deleteToken(uuid: String): scala.concurrent.Future[Option[securesocial.core.providers.MailToken]] = ???
  def findToken(token: String): scala.concurrent.Future[Option[securesocial.core.providers.MailToken]] = ???
  def saveToken(token: securesocial.core.providers.MailToken): scala.concurrent.Future[securesocial.core.providers.MailToken] = ???
}
