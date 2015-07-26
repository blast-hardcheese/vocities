package models

import play.api.libs.json.JsValue
import utils.ExtendedPostgresDriver.simple._

case class Account(
  id: Long,
  name: String,
  user_ids: List[Long]
)

class Accounts(tag: Tag) extends Table[Account](tag, "accounts") {
  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def user_ids = column[List[Long]]("user_ids", O.NotNull)

  def * = (id, name, user_ids) <> (Account.tupled, Account.unapply _)
}

object Accounts {
  val accounts = TableQuery[Accounts]

  def create(c: Account)(implicit session: Session): Account = {
    accounts
      .returning(accounts)
      .insert(c)
  }
}
