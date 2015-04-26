package models

import play.api.libs.json.{ Json, JsValue }
import utils.ExtendedPostgresDriver.simple._

case class Account(id: Long, name: String, user_ids: List[Long])
case class Domain(id: Long, account_id: Long, domain: String)
case class Template(id: Long, key: String, css_template: String, css_values: JsValue)
case class TemplateInfo(id: Long, key: String)
case class Page(account_id: Long, domain_id: Long, path: String, template_id: Long, title: String, data: JsValue)
case class PageInfo(account_id: Long, domain_id: Long, path: String, template_id: Long, title: String)

class Accounts(tag: Tag) extends Table[Account](tag, "accounts") {
  def id = column[Long]("id", O.PrimaryKey)
  def name = column[String]("name")
  def user_ids = column[List[Long]]("user_ids", O.NotNull)

  def * = (id, name, user_ids) <> (Account.tupled, Account.unapply _)
}

object Accounts {
  val accounts = TableQuery[Accounts]

  def create(c: Account)(implicit session: Session) = {
    accounts.insert(c)
  }
}

class DomainTable(tag: Tag) extends Table[Domain](tag, "domains") {
  def id = column[Long]("id", O.PrimaryKey)
  def account_id = column[Long]("account_id", O.NotNull)
  def domain = column[String]("domain", O.NotNull)

  def * = (id, account_id, domain) <> (Domain.tupled, Domain.unapply _)
}

object Domains {
  val domains = TableQuery[DomainTable]

  def create(d: Domain)(implicit s: Session): Unit = {
    domains.insert(d)
  }
}

class TemplateTable(tag: Tag) extends Table[Template](tag, "templates") {
  def id = column[Long]("id", O.PrimaryKey)
  def key = column[String]("key", O.NotNull)
  def css_template = column[String]("css_template", O.NotNull)
  def css_values = column[JsValue]("css_values", O.NotNull)

  def * = (id, key, css_template, css_values) <> (Template.tupled, Template.unapply _)
  def info = (id, key) <> (TemplateInfo.tupled, TemplateInfo.unapply)
}

object Templates {
  val templates = TableQuery[TemplateTable]

  def create(t: Template)(implicit s: Session): Unit = {
    templates.insert(t)
  }
}

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

  def create(p: Page)(implicit s: Session): Unit = {
    pages.insert(p)
  }

  type LookupResult = Option[(Long, Option[String], Option[JsValue], Option[String], Option[String], Option[JsValue])]
  def lookup(domain: String, path: String)(implicit s: Session): LookupResult = {
    Domains.domains
      .filter(_.domain === domain)
      .leftJoin(pages).on({ case (d, p) => d.id === p.domain_id && p.account_id === d.account_id && p.path === path })
      .leftJoin(Templates.templates).on({ case ((d, p), t) => t.id === p.template_id })
      .map { case ((d, p), t) => (d.id, p.title.?, p.data.?, t.key.?, t.css_template.?, t.css_values.?) }
      .firstOption
  }
}

case class User(id: Long = -1, username: String)

class Users(tag: Tag) extends Table[User](tag, "user") {
  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def username = column[String]("username")

  def * = (id, username) <> (User.tupled, User.unapply)
}

object Users {
  val users = TableQuery[Users]
}

case class AccountViewModel(accounts: Seq[Account], domains: Seq[Domain], pages: Seq[PageInfo], templates: Seq[TemplateInfo])
case class PageEditViewModel(page: Page, template_key: String, css_values: JsValue)

object Queries {
  def accountsIndex(user_id: Long)(implicit s: Session) = {
    val accounts = Accounts.accounts
      .filter(_.user_ids @> List(user_id))
      .run

    val accountIds = accounts.map { _.id }

    val domains = Domains.domains
      .filter(_.account_id inSetBind accountIds)
      .run

    val domainIds = domains.map { _.id }

    val pages = Pages.pages
      .filter(p => p.account_id.inSetBind(accountIds) && p.domain_id.inSetBind(domainIds))
      .map(_.info)
      .run

    val templateIds = pages.map { _.template_id }

    val templates = Templates.templates
      .filter(_.id inSetBind(templateIds))
      .map(_.info)
      .run

    AccountViewModel(accounts, domains, pages, templates)
  }

  def pageEdit(user_id: Long, domain: String, path: String)(implicit s: Session): Option[PageEditViewModel] = {
    Accounts.accounts
      .innerJoin(Domains.domains)
      .innerJoin(Pages.pages)
      .innerJoin(Templates.templates)
      .on { case (((a, d), p), t) =>
        a.user_ids @> List(user_id) &&
        a.id === d.account_id &&
        d.domain === domain &&
        p.account_id === a.id &&
        p.domain_id === d.id &&
        p.path === path &&
        p.template_id === t.id
      }
      .map { case (((a, d), p), t) =>
        (p, t.key, t.css_values)
      }
      .take(1)
      .run
      .headOption
      .map(PageEditViewModel.tupled)
  }

  def pageSave(user_id: Long, domain: String, path: String)(title: String, data: JsValue)(implicit s: Session): Boolean = {
    Accounts.accounts
      .innerJoin(Domains.domains)
      .innerJoin(Pages.pages)
      .on { case ((a, d), p) =>
        user_id.bind === a.user_ids.any &&
        a.id === d.account_id &&
        d.domain === domain &&
        p.account_id === a.id &&
        p.domain_id === d.id &&
        p.path === path
      }
      .map { case ((a, d), p) => p }
      .run
      .headOption
      .map { page =>
        Pages.pages
          .filter(p =>
            p.account_id === page.account_id &&
            p.domain_id === page.domain_id &&
            p.path === page.path
          )
          .map { p => (p.title, p.data) }
          .update((title, data))
          .run == 1
      }
      .getOrElse(false)
  }
}
