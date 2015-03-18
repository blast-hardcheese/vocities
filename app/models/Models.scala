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

  def pageEdit(user_id: Long, domain_id: Long, path: String)(implicit s: Session): Option[PageEditViewModel] = {
    Accounts.accounts
      .innerJoin(Domains.domains)
      .innerJoin(Pages.pages)
      .innerJoin(Templates.templates)
      .on { case (((a, d), p), t) =>
        a.user_ids @> List(user_id) &&
        a.id === d.account_id &&
        d.id === domain_id &&
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

  def pageSave(user_id: Long, domain_id: Long, path: String)(title: String, data: JsValue)(implicit s: Session): Boolean = {
    Accounts.accounts
      .innerJoin(Domains.domains)
      .innerJoin(Pages.pages)
      .on { case ((a, d), p) =>
        a.user_ids @> List(user_id) &&
        a.id === d.account_id &&
        d.id === domain_id &&
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

object TestData {
  val accounts = Seq(
    Account(1, "Hardchee.se", List.empty),
    Account(2, "AmySnively", List.empty),
    Account(3, "Barton Inc.", List.empty)
  )

  val domains = Seq(
    Domain(1, 1, "devonstewart.com"),
    Domain(2, 2, "amysnively.com"),
    Domain(3, 3, "ashleybarton.com"),
    Domain(4, 1, "hardchee.se"),
    Domain(5, 1, "vocities.com")
  )

  val templates = Seq(
    Template(1, "html5up-read-only", """
<% for(i in section_banners) { %>
#main section<%= section_banners[i].section %>::before {
    background-image: url('<%= section_banners[i].url %>');
    background-position: top right;
    background-repeat: no-repeat;
    background-size: cover;
    content: '';
    display: block;
    height: 15em;
    width: 100%;
}
<% } %>

#header {
    background: <%= primary_bg %>;
    color: <%= primary_color %>;
}

#header > nav ul li a.active {
    background: <%= nav_active_bg %>;
    color: <%= nav_active_color %> !important;
}

#header > footer .icons li a {
    color: <%= hilight_color %>;
}

#header > nav ul li {
  border-top: solid 2px <%= accent_color %>;
}

header.major h2 {
  color: <%= primary_bg %>;
}

header.major h2 + p {
  color: <%= dark_text %>;
}

body, input, select, textarea {
  color: <%= normal_text %>;
}

.w-youtube { width: <%= youtube_width || "100%" %>; height: <%= youtube_height || "480px" %>; }
    """, Json.parse("""
{
  "youtube_width": null,
  "youtube_height": null,

  "primary_bg": "#4acaa8",
  "primary_color": "#d1f1e9",
  "hilight_color": "#b6e9dc",
  "accent_color": "#5ccfb0",
  "nav_active_bg": "white",
  "nav_active_color": "#4acaa8",

  "dark_text": "#777777",
  "normal_text": "#888888",
  "section_banners": [
    {"url": "http://html5up.net/uploads/demos/read-only/images/banner.jpg", "section": "#first"}
  ]
}
""")),
    Template(2, "0", "", Json.parse("{}"))
  )

  val pages = Seq(
    Page(1, 1, "", 1, "Devon Stewart: Home", Json.parse("""
{
  "sections": [
    {"tag": "first",  "title": "About", "content": {"type": "header", "data": {"title": "Read Only", "subtitle": "Just an incredibly simple responsive site template freebie by <a href=\"http://html5up.net/read-only\">HTML5 UP</a>.", "text": "Faucibus sed lobortis aliquam lorem blandit. Lorem eu nunc metus col. Commodo id in arcu ante lorem ipsum sed accumsan erat praesent faucibus commodo ac mi lacus. Adipiscing mi ac commodo. Vis aliquet tortor ultricies non ante erat nunc integer eu ante ornare amet commetus vestibulum blandit integer in curae ac faucibus integer non. Adipiscing cubilia elementum."}}},
    {"tag": "soundcloud",  "title": "Soundcloud", "content": {"type": "soundcloud", "data": {"url": "https://soundcloud.com/joeljuliusbaer/sets/parov-stellar"}}},
    {"tag": "second", "title": "Bio", "content": {"type": "paragraph", "data": {"content": ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse magna metus, vehicula molestie vehicula quis, mattis non odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam velit elit, pulvinar eget hendrerit id, vulputate sit amet diam. Quisque eu dolor ut velit auctor maximus. Aenean condimentum mi et metus ornare, id consequat mauris ornare. Nulla eu ligula in tortor auctor sagittis. Donec sodales elit augue, a ullamcorper nibh ultricies nec. Nam quis egestas ipsum. Etiam eu libero eu magna feugiat mattis quis luctus lectus. Fusce mollis lorem libero, in viverra tellus lacinia ut.", "Cras pharetra est purus, non tincidunt augue dignissim nec. Fusce varius dapibus enim, placerat mattis lorem lobortis in. Nulla eu sodales eros. Donec libero justo, tincidunt ut consequat sit amet, mollis at elit. Pellentesque aliquam quis tortor sit amet pulvinar. Ut pulvinar augue in nunc semper gravida. Aliquam congue odio et ligula placerat lacinia. Maecenas venenatis, est at tempor blandit, dui mi consequat magna, eget dignissim risus orci sed metus. Etiam urna nisl, tristique id elementum id, feugiat et libero."]}}},
    {"tag": "third",  "title": "YouTube", "content": {"type": "youtube", "data": {"videoId": "gN9cIlICDt4"}}}
  ],
  "social": {
    "twitter": "https://twitter.com/blast_hardchese",
    "facebook": "https://www.facebook.com/devon.stewart.982",
    "instagram": "https://instagram.com/alfredyankovic",
    "github": "https://github.com/blast-hardcheese",
    "email": "mail://blast@hardchee.se"
  },
  "sidebar": {
    "header": {
      "src": "https://s.gravatar.com/avatar/b92c6ab7d1f727643880c062d093d460?s=200",
      "name": "Devon Stewart",
      "flavortext": "Just some guy, you know?"
    }
  },
  "footer": {
    "copyright": "Devon Stewart"
  },
  "css": {
    "values": {
    }
  }
}
""")),
    Page(1, 4, "", 2, "index", Json.parse("{\"hello\": \"Devon\", \"sc-url\": \"https://soundcloud.com/shiroyukihime/sets/jpop-anime-ost\", \"youtube\": \"gN9cIlICDt4\", \"bgColor\":\"#f8f8ff\"}")),
    Page(2, 2, "", 1, "homepage", Json.parse("{}")),
    Page(3, 3, "hello/world", 1, "hello, world!", Json.parse("{\"hello\": \"world\", \"sc-url\": \"https://soundcloud.com/joeljuliusbaer/sets/parov-stellar\", \"youtube\": \"04mfKJWDSzI\"}")),
    Page(1, 5, "", 1, "VOCities", Json.parse("""
{
  "sections": [
    {"tag": "first",  "title": "About", "content": {"type": "header", "data": {"title": "Read Only", "subtitle": "Just an incredibly simple responsive site template freebie by <a href=\"http://html5up.net/read-only\">HTML5 UP</a>.", "text": "Faucibus sed lobortis aliquam lorem blandit. Lorem eu nunc metus col. Commodo id in arcu ante lorem ipsum sed accumsan erat praesent faucibus commodo ac mi lacus. Adipiscing mi ac commodo. Vis aliquet tortor ultricies non ante erat nunc integer eu ante ornare amet commetus vestibulum blandit integer in curae ac faucibus integer non. Adipiscing cubilia elementum."}}},
    {"tag": "soundcloud",  "title": "Soundcloud", "content": {"type": "soundcloud", "data": {"url": "https://soundcloud.com/joeljuliusbaer/sets/parov-stellar"}}},
    {"tag": "second", "title": "Bio", "content": {"type": "paragraph", "data": {"content": ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse magna metus, vehicula molestie vehicula quis, mattis non odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam velit elit, pulvinar eget hendrerit id, vulputate sit amet diam. Quisque eu dolor ut velit auctor maximus. Aenean condimentum mi et metus ornare, id consequat mauris ornare. Nulla eu ligula in tortor auctor sagittis. Donec sodales elit augue, a ullamcorper nibh ultricies nec. Nam quis egestas ipsum. Etiam eu libero eu magna feugiat mattis quis luctus lectus. Fusce mollis lorem libero, in viverra tellus lacinia ut.", "Cras pharetra est purus, non tincidunt augue dignissim nec. Fusce varius dapibus enim, placerat mattis lorem lobortis in. Nulla eu sodales eros. Donec libero justo, tincidunt ut consequat sit amet, mollis at elit. Pellentesque aliquam quis tortor sit amet pulvinar. Ut pulvinar augue in nunc semper gravida. Aliquam congue odio et ligula placerat lacinia. Maecenas venenatis, est at tempor blandit, dui mi consequat magna, eget dignissim risus orci sed metus. Etiam urna nisl, tristique id elementum id, feugiat et libero."]}}},
    {"tag": "third",  "title": "YouTube", "content": {"type": "youtube", "data": {"videoId": "gN9cIlICDt4"}}}
  ],
  "social": {
    "twitter": "https://twitter.com/blast_hardchese",
    "facebook": "https://www.facebook.com/devon.stewart.982",
    "instagram": "https://instagram.com/alfredyankovic",
    "github": "https://github.com/blast-hardcheese",
    "email": "mail://blast@hardchee.se"
  },
  "sidebar": {
    "header": {
      "src": "https://s.gravatar.com/avatar/b92c6ab7d1f727643880c062d093d460?s=200",
      "name": "Devon Stewart",
      "flavortext": "Just some guy, you know?"
    }
  },
  "footer": {
    "copyright": "Devon Stewart"
  },
  "css": {
    "values": {
    }
  }
}
"""))
  )

  def create()(implicit session: Session) {
    Accounts.accounts.delete
    Domains.domains.delete
    Templates.templates.delete
    Pages.pages.delete

    accounts.foreach(Accounts.create)
    domains.foreach(Domains.create)
    templates.foreach(Templates.create)
    pages.foreach(Pages.create)
  }
}
