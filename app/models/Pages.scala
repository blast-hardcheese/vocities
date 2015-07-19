package models

import play.api.libs.json.JsValue
import utils.ExtendedPostgresDriver.simple._

case class Page(account_id: Long, domain_id: Long, path: String, template_id: Long, title: String, data: JsValue)
case class PageInfo(account_id: Long, domain_id: Long, path: String, template_id: Long, title: String)

class PageTable(tag: Tag) extends Table[Page](tag, "pages") {
  def account_id = column[Long]("account_id")
  def domain_id = column[Long]("domain_id")
  def path = column[String]("path")
  def template_id = column[Long]("template_id")
  def title = column[String]("title")
  def data = column[JsValue]("data")

  def * = (account_id, domain_id, path, template_id, title, data) <> (Page.tupled, Page.unapply _)
  def info = (account_id, domain_id, path, template_id, title) <> (PageInfo.tupled, PageInfo.unapply _)
}

object Pages {
  val pages = TableQuery[PageTable]

  def create(p: Page)(implicit s: Session): Page = {
    pages
      .returning(pages)
      .insert(p)
  }

  type LookupResult = Option[(Long, Option[String], Option[JsValue], Option[String])]
  def lookup(domain: String, path: String)(implicit s: Session): LookupResult = {
    Domains.domains
      .filter(_.domain === domain)
      .leftJoin(pages).on({ case (d, p) => d.id === p.domain_id && p.account_id === d.account_id && p.path === path })
      .leftJoin(Templates.templates).on({ case ((d, p), t) => t.id === p.template_id })
      .map { case ((d, p), t) => (d.id, p.title.?, p.data.?, t.key.?) }
      .firstOption
  }
}
