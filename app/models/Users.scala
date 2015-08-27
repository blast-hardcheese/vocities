package models

import utils.ExtendedPostgresDriver.simple._
import utils.ExtendedPostgresDriver.createEnumListJdbcType

object UserRoles extends Enumeration {
  type UserRole = Value
  val Admin = Value("admin")
}

case class User(
  id: Long = -1,
  username: String,
  roles: List[UserRoles.Value] = List.empty
)

class UserTable(tag: Tag) extends Table[User](tag, "users") {
  implicit val listTypeMapper = createEnumListJdbcType("userRole", UserRoles)

  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def username = column[String]("username", O.NotNull)
  def roles = column[List[UserRoles.Value]]("roles", O.NotNull)

  def * = (id, username, roles) <> (User.tupled, User.unapply)
}

object Users {
  val users = TableQuery[UserTable]
}
