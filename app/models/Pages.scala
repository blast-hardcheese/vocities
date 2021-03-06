package models

import play.api.libs.json.JsValue
import utils.ExtendedPostgresDriver.simple._

import types._

case class Page(account_id: AccountId, domain_id: Long, path: Path, template_id: Long, title: String, data: JsValue)
case class PageInfo(account_id: AccountId, domain_id: Long, path: Path, template_id: Long, title: String)

class PageTable(tag: Tag) extends Table[Page](tag, "pages") {
  def account_id = column[AccountId]("account_id")
  def domain_id = column[Long]("domain_id")
  def path = column[Path]("path")
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

  type LookupResult = Option[(Option[PageTitle], Option[PageData], Option[TemplateKey])]
  def lookup(maybeUserId: Option[UserId], domain: String, path: Path)(implicit s: Session): LookupResult = {
    val domainQuery = maybeUserId.map { userId =>
      Accounts.accounts
        .filter { userId.bind === _.user_ids.any }
        .innerJoin(Domains.domains).on({ case (a, d) => d.account_id === a.id })
        .map { case (a, d) => d }
    } getOrElse {
      Domains.domains
    }

    domainQuery
      .filter(_.domain === domain)
      .leftJoin(pages).on({ case (d, p) => d.id === p.domain_id && p.account_id === d.account_id && p.path === path })
      .leftJoin(Templates.templates).on({ case ((d, p), t) => t.id === p.template_id })
      .map { case ((_, p), t) => (p.title.?, p.data.?, t.key.?) }
      .firstOption
      .map(tag)
  }
}
