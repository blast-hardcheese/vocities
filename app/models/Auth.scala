package models

import securesocial.core.{ BasicProfile, AuthenticationMethod, PasswordInfo, OAuth1Info, OAuth2Info }

import types._
import utils.ExtendedPostgresDriver.simple._

case class UserModel(
  main: BasicProfile,
  identities: List[BasicProfile],
  user: User
)

case class AuthProfile(
  userId: UserId,
  providerId: String,
  providerUserId: String,
  firstName: Option[String],
  lastName: Option[String],
  fullName: Option[String],
  email: Option[String],
  avatarUrl: Option[String],
  authMethod: AuthenticationMethod,
  oAuth1Info: Option[OAuth1Info],
  oAuth2Info: Option[OAuth2Info],
  passwordInfo: Option[PasswordInfo]
)

class AuthProfiles(tag: Tag) extends Table[AuthProfile](tag, "auth_profile") {
  def userId = column[UserId]("userId", O.NotNull)
  def providerId = column[String]("providerId", O.NotNull)
  def providerUserId = column[String]("providerUserId", O.NotNull)
  def firstName = column[Option[String]]("firstName", O.Nullable)
  def lastName = column[Option[String]]("lastName", O.Nullable)
  def fullName = column[Option[String]]("fullName", O.Nullable)
  def email = column[Option[String]]("email", O.Nullable)
  def avatarUrl = column[Option[String]]("avatarUrl", O.Nullable)
  def authMethod = column[AuthenticationMethod]("authMethod", O.NotNull)
  def oAuth1Info = column[Option[OAuth1Info]]("oauth1info", O.Nullable)
  def oAuth2Info = column[Option[OAuth2Info]]("oauth2info", O.Nullable)
  def passwordInfo = column[Option[PasswordInfo]]("password_info", O.Nullable)

  def * = (
    userId,
    providerId,
    providerUserId,
    firstName,
    lastName,
    fullName,
    email,
    avatarUrl,
    authMethod,
    oAuth1Info,
    oAuth2Info,
    passwordInfo
  ) <> (AuthProfile.tupled, AuthProfile.unapply _)

  def basicProfile = (providerId, providerUserId, firstName, lastName, fullName, email, avatarUrl, authMethod, oAuth1Info, oAuth2Info, passwordInfo) <> (BasicProfile.tupled, BasicProfile.unapply _)
}

object AuthProfiles extends AuthProfileConverters {
  val authProfiles = TableQuery[AuthProfiles]

  def newUser(profile: BasicProfile)(implicit s: Session): UserModel = {
    val username = profile.fullName
      .orElse(profile.firstName)
      .orElse(profile.email)
      .getOrElse("New User")

    val user = Users
      .users
      .returning(Users.users)
      .insert(User(username=username))

    authProfiles
      .insert(basicToAuth(user.id)(profile))

    UserModel(profile, List(profile), user)
  }

  def lookupProfile(providerId: String, providerUserId: String)(implicit s: Session): Option[BasicProfile] = {
    authProfiles
      .filter(r => r.providerId === providerId && r.providerUserId === providerUserId)
      .map(_.basicProfile)
      .firstOption
  }

  def lookupUser(profile: BasicProfile)(implicit s: Session): Option[UserModel] = {
    for {
      user <- (
        authProfiles
          .innerJoin(Users.users)
          .on { case (p, u) => p.userId === u.id }
          .filter { case (p, _) => p.providerId === profile.providerId && p.providerUserId === profile.userId }
          .map { case (_, u) => u }
          .firstOption
      )

      identities = (
        authProfiles
          .filter { _.userId === user.id }
          .map { _.basicProfile }
          .list
      )
    } yield {
      UserModel(
        main=profile,
        identities=identities,
        user=user
      )
    }
  }

  def associateProfile(user: UserModel, to: BasicProfile)(implicit s: Session): UserModel = {
    authProfiles
      .insert(basicToAuth(user.user.id)(to))
    user.copy(identities = to +: user.identities)
  }

  def disassociateProvider(user: UserModel, providerId: String)(implicit s: Session): UserModel = {
    assume(user.main.providerId != providerId, "Attempted to disassociate current profile")

    val count = (
      authProfiles
        .filter { p => p.providerId === providerId && p.userId === user.user.id }
        .delete
    )

    assume(count == 1, "Attempted to disassociate disassociated provider")

    user.copy(
      identities = user.identities.filterNot(_.providerId == providerId)
    )
  }

  def updateProfile(profile: BasicProfile)(implicit s: Session): Option[BasicProfile] = {
    val count = (
      authProfiles
        .filter(_.providerId === profile.providerId)
        .filter(_.providerUserId === profile.userId)
        .map(_.basicProfile)
        .update(profile)
    )

    Some(profile)
      .filter(_ => count == 1)
  }
}

trait AuthProfileConverters {
  def basicToAuth(userId: UserId)(profile: BasicProfile): AuthProfile = {
    AuthProfile(
      userId = userId,
      providerId = profile.providerId,
      providerUserId = profile.userId,
      firstName = profile.firstName,
      lastName = profile.lastName,
      fullName = profile.fullName,
      email = profile.email,
      avatarUrl = profile.avatarUrl,
      authMethod = profile.authMethod,
      oAuth1Info = profile.oAuth1Info,
      oAuth2Info = profile.oAuth2Info,
      passwordInfo = profile.passwordInfo
    )
  }
}
