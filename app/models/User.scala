package models

import securesocial.core.{ BasicProfile, AuthenticationMethod }

import utils.ExtendedPostgresDriver.simple._

trait AuthenticationMethodMixin {
  implicit val authMethodMapper = MappedColumnType.base[AuthenticationMethod, String](
    { _.method },
    AuthenticationMethod.apply _
  )
}

case class AuthProfile(
  userId: Long,
  providerId: String,
  providerUserId: String,
  firstName: Option[String],
  lastName: Option[String],
  fullName: Option[String],
  email: Option[String],
  avatarUrl: Option[String],
  authMethod: AuthenticationMethod
)

class AuthProfiles(tag: Tag) extends Table[AuthProfile](tag, "customers") with AuthenticationMethodMixin {
  def userId = column[Long]("userId", O.NotNull)
  def providerId = column[String]("providerId", O.NotNull)
  def providerUserId = column[String]("providerUserId", O.NotNull)
  def firstName = column[Option[String]]("firstName", O.Nullable)
  def lastName = column[Option[String]]("lastName", O.Nullable)
  def fullName = column[Option[String]]("fullName", O.Nullable)
  def email = column[Option[String]]("email", O.Nullable)
  def avatarUrl = column[Option[String]]("avatarUrl", O.Nullable)
  def authMethod = column[AuthenticationMethod]("authMethod", O.NotNull)

  def * = (
    userId,
    providerId,
    providerUserId,
    firstName,
    lastName,
    fullName,
    email,
    avatarUrl,
    authMethod
  ) <> (AuthProfile.tupled, AuthProfile.unapply _)
}

object AuthProfiles {
  val basicProfiles = TableQuery[AuthProfiles]

  def save(userId: Long, p: BasicProfile)(implicit s: Session) {
    basicProfiles
      .insert(AuthProfile(
        userId = userId,
        providerId = p.providerId,
        providerUserId = p.userId,
        firstName = p.firstName,
        lastName = p.lastName,
        fullName = p.fullName,
        email = p.email,
        avatarUrl = p.avatarUrl,
        authMethod = p.authMethod
      ))
  }
}
