package models

import play.api.libs.json.JsValue

import types._
import utils.ExtendedPostgresDriver.simple._

case class AccountViewModel(accounts: Seq[Account], domains: Seq[Domain], pages: Seq[PageInfo], templates: Seq[Template])
case class PageEditViewModel(page: Page, template_key: String)

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
      .run

    AccountViewModel(accounts, domains, pages, templates)
  }

  def pageEdit(user_id: Long, domain: String, path: Path)(implicit s: Session): Option[PageEditViewModel] = {
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
        (p, t.key)
      }
      .take(1)
      .run
      .headOption
      .map(PageEditViewModel.tupled)
  }

  def pageSave(user_id: Long, domain: String, path: Path)(title: String, data: JsValue)(implicit s: Session): Option[Boolean] = {
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
      .map { case ((a, d), p) => p.info }
      .firstOption
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
  }

  def newDomain(user_id: Long, account_id: Long, domain: String)(template_key: String)(implicit s: Session): Option[Domain] = {
    Accounts.accounts
      .filter { a =>
        a.id === account_id &&
        user_id.bind === a.user_ids.any
      }
      .map { a => a.id }
      .run
      .map { account_id =>
        val _domain = Domains.create(Domain(
          id = -1,
          account_id = account_id,
          domain = domain
        ))

        val page = newPage(user_id, account_id, _domain.id)(EmptyPath, "Empty page", template_key)

        _domain
      }
      .headOption
  }

  def newPage(user_id: Long, account_id: Long, domain_id: Long)(path: Path, name: String, template_key: String)(implicit s: Session): Option[Page] = {
    Domains.domains
      .innerJoin(Accounts.accounts)
      .innerJoin(Templates.templates)
      .on { case ((d, a), t) => d.account_id === a.id && t.key === template_key }
      .filter { case ((d, a), t) =>
        d.id === domain_id &&
        a.id === account_id &&
        user_id.bind === a.user_ids.any
      }
      .map { case ((d, a), t) => (d.id, a.id, t.id) }
      .run
      .map { case (domain_id, account_id, template_id) =>
        val defaultData = TemplateData.byName(template_key).default

        Pages.create(Page(
          account_id=account_id,
          domain_id=domain_id,
          path=path,
          template_id=template_id,
          title=name,
          data=defaultData
        ))
      }
      .headOption
  }
}
