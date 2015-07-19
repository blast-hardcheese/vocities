package models

import utils.ExtendedPostgresDriver.simple._
import utils.ExtendedPostgresDriver.createEnumListJdbcType

import UserRoles.{ UserRole, listTypeMapper }

object UserRoles extends Enumeration {
  type UserRole = Value
  val Admin = Value("admin")

  implicit val listTypeMapper = createEnumListJdbcType("userRole", UserRoles)
}

case class User(id: Long = -1, username: String, roles: List[UserRole] = List.empty)

class UserTable(tag: Tag) extends Table[User](tag, "users") {
  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def username = column[String]("username")
  def roles = column[List[UserRole]]("roles")

  def * = (id, username, roles) <> (User.tupled, User.unapply)
}

object Users {
  val users = TableQuery[UserTable]
}
