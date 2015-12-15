package models

import play.api.libs.json.JsValue

import types._
import utils.ExtendedPostgresDriver.simple._

case class Account(
  id: AccountId,
  name: String,
  user_ids: List[Long],
  credits: Int = 0
)

class Accounts(tag: Tag) extends Table[Account](tag, "accounts") {
  def id = column[AccountId]("id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def user_ids = column[List[Long]]("user_ids", O.NotNull)
  def credits = column[Int]("credits", O.NotNull)

  def * = (id, name, user_ids, credits) <> (Account.tupled, Account.unapply _)
}

object Accounts {
  val accounts = TableQuery[Accounts]

  def create(c: Account)(implicit session: Session): Account = {
    accounts
      .returning(accounts)
      .insert(c)
  }
}
