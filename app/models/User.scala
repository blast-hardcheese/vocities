package models

import securesocial.core.{ BasicProfile, AuthenticationMethod, OAuth1Info, OAuth2Info, PasswordInfo }

import utils.ExtendedPostgresDriver.simple._

trait AuthenticationMethodMixin {
  implicit val authMethodMapper = MappedColumnType.base[AuthenticationMethod, String](
    { _.method },
    AuthenticationMethod.apply _
  )

  implicit val oauth1mapper = MappedColumnType.base[OAuth1Info, String](
    { _ => "dummy data" },
    { _ => OAuth1Info("dummy", "data") }
  )

  implicit val oauth2mapper = MappedColumnType.base[OAuth2Info, String](
    { _ => "dummy data" },
    { _ => OAuth2Info("dummy data") }
  )

  implicit val passwordMapper = MappedColumnType.base[PasswordInfo, String](
    { _ => "dummy data" },
    { _ => PasswordInfo("dummy", "data") }
  )
}

class BasicProfiles(tag: Tag) extends Table[BasicProfile](tag, "customers") with AuthenticationMethodMixin {
  def providerId = column[String]("providerId", O.NotNull)
  def providerUserId = column[String]("providerUserId", O.NotNull)
  def firstName = column[Option[String]]("firstName", O.Nullable)
  def lastName = column[Option[String]]("lastName", O.Nullable)
  def fullName = column[Option[String]]("fullName", O.Nullable)
  def email = column[Option[String]]("email", O.Nullable)
  def avatarUrl = column[Option[String]]("avatarUrl", O.Nullable)
  def authMethod = column[AuthenticationMethod]("authMethod", O.NotNull)
  def oAuth1Info = column[Option[OAuth1Info]]("oAuth1Info", O.Nullable)
  def oAuth2Info = column[Option[OAuth2Info]]("oAuth2Info", O.Nullable)
  def passwordInfo = column[Option[PasswordInfo]]("passwordInfo", O.Nullable)

  def * = (
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
  ) <> (BasicProfile.tupled, BasicProfile.unapply _)
}

object BasicProfiles {
  val basicProfiles = TableQuery[BasicProfiles]

  def save(userId: Long, p: BasicProfile)(implicit s: Session) {
    basicProfiles
      .insert(p)
  }
}
