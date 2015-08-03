package models

import org.joda.time.DateTime

import securesocial.core.providers.MailToken

import utils.ExtendedPostgresDriver.simple._

class MailTokens(tag: Tag) extends Table[MailToken](tag, "mail_tokens") {
  def uuid = column[String]("uuid", O.NotNull)
  def email = column[String]("email", O.NotNull)
  def creationTime = column[DateTime]("creation_time", O.NotNull)
  def expirationTime = column[DateTime]("expiration_time", O.NotNull)
  def isSignUp = column[Boolean]("is_sign_up", O.NotNull)
  def used = column[Boolean]("used", O.NotNull)
  def expired = column[Boolean]("expired", O.NotNull)

  def valid = ! used && ! expired

  def * = (uuid, email, creationTime, expirationTime, isSignUp) <> (MailToken.tupled, MailToken.unapply)
}

object MailTokens {
  val mailTokens = TableQuery[MailTokens]

  def save(token: MailToken)(implicit s: Session): MailToken = {
    mailTokens
      .insert(token)
    token
  }

  def findByToken(token: String)(implicit s: Session): Option[MailToken] = {
    mailTokens
      .filter(_.uuid === token)
      .filter(_.valid)
      .firstOption
  }

  def deleteToken(token: String)(implicit s: Session): Option[MailToken] = {
    val query = (
      mailTokens
        .filter(_.valid)
        .filter(_.uuid === token)
    )

    if(query.map(_.used).update(true) == 1) {
      query.firstOption
    } else {
      None
    }
  }

  def deleteExpired()(implicit s: Session): Unit = {
    mailTokens
      .filter(_.valid) // Only mark unconsumed tokens as expired
      .filter(_.expirationTime < DateTime.now)
      .map(_.expired)
      .update(true)
  }
}
