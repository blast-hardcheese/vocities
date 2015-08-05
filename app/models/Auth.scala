package models

import securesocial.core.{ BasicProfile, AuthenticationMethod, PasswordInfo, OAuth1Info, OAuth2Info }

import utils.ExtendedPostgresDriver.simple._

case class UserModel(main: BasicProfile, identities: List[BasicProfile], userId: Long)

case class AuthProfile(
  userId: Long,
  providerId: String,
  providerUserId: String,
  firstName: Option[String],
  lastName: Option[String],
  fullName: Option[String],
  email: Option[String],
  avatarUrl: Option[String],
  authMethod: AuthenticationMethod,
  passwordInfo: Option[PasswordInfo]
)

class AuthProfiles(tag: Tag) extends Table[AuthProfile](tag, "auth_profile") {
  def userId = column[Long]("userId", O.NotNull)
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
    passwordInfo
  ) <> (AuthProfile.tupled, AuthProfile.unapply _)

  def basicProfile = (providerId, providerUserId, firstName, lastName, fullName, email, avatarUrl, authMethod, oAuth1Info, oAuth2Info, passwordInfo) <> (BasicProfile.tupled, BasicProfile.unapply _)
}

object AuthProfiles extends AuthProfileConverters {
  val basicProfiles = TableQuery[AuthProfiles]

  def newUser(profile: BasicProfile)(implicit s: Session): UserModel = {
    val username = profile.fullName
      .orElse(profile.firstName)
      .orElse(profile.email)
      .getOrElse("New User")

    val id = Users
      .users
      .returning(Users.users.map(_.id))
      .insert(User(username=username))

    basicProfiles
      .insert(basicToAuth(id)(profile))

    UserModel(profile, List(profile), id)
  }

  def save(userId: Long, p: BasicProfile)(implicit s: Session) {
    basicProfiles
      .insert(basicToAuth(userId)(p))
  }

  def lookupProfile(providerId: String, providerUserId: String)(implicit s: Session): Option[BasicProfile] = {
    basicProfiles
      .filter(r => r.providerId === providerId && r.providerUserId === providerUserId)
      .take(1)
      .list
      .headOption
      .map(authToBasic)
      .map(_._2)
  }

  def modelForProfile(profile: BasicProfile)(implicit s: Session): Option[UserModel] = {
    for {
      user <- (
        basicProfiles
          .innerJoin(Users.users)
          .on { case (p, u) => p.userId === u.id }
          .filter { case (p, _) => p.providerId === profile.providerId && p.providerUserId === profile.userId }
          .map { case (_, u) => u }
          .firstOption
      )

      identities = (
        basicProfiles
          .filter { _.userId === user.id }
          .map { _.basicProfile }
          .list
      )
    } yield {
      UserModel(
        main=profile,
        identities=identities,
        userId=user.id
      )
    }
  }

  def associateProfile(user: UserModel, to: BasicProfile)(implicit s: Session): UserModel = {
    basicProfiles
      .insert(basicToAuth(user.userId)(to))
    user.copy(identities = to +: user.identities)
  }

  def updatePassword(profile: BasicProfile)(implicit s: Session): Option[BasicProfile] = {
    val count = (
      basicProfiles
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
  def basicToAuth(userId: Long)(profile: BasicProfile): AuthProfile = {
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
      passwordInfo = profile.passwordInfo
    )
  }

  def authToBasic(ap: AuthProfile): (Long, BasicProfile) = {
    (ap.userId,
      BasicProfile(
        providerId = ap.providerId,
        userId = ap.providerUserId,
        firstName = ap.firstName,
        lastName = ap.lastName,
        fullName = ap.fullName,
        email = ap.email,
        avatarUrl = ap.avatarUrl,
        authMethod = ap.authMethod,
        passwordInfo = ap.passwordInfo
      )
    )
  }
}
