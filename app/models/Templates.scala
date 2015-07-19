package models

import play.api.libs.json.JsValue

import utils.ExtendedPostgresDriver.simple._

case class Template(id: Long, key: String)

class TemplateTable(tag: Tag) extends Table[Template](tag, "templates") {
  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def key = column[String]("key", O.NotNull)

  def * = (id, key) <> (Template.tupled, Template.unapply _)
}

object Templates {
  val templates = TableQuery[TemplateTable]

  def create(t: Template)(implicit s: Session): Unit = {
    templates.insert(t)
  }
}
