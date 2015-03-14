package models

import scala.slick.driver.H2Driver.simple._

case class Customer(id: Long, name: String)
case class Domain(id: Long, customer_id: Long, domain: String)
case class Template(id: Long, key: String, css_template: String, css_values: String)
case class Page(customer_id: Long, domain_id: Long, path: String, template_id: Long, title: String, data: String)

class CustomerTable(tag: Tag) extends Table[Customer](tag, "customers") {
  def id = column[Long]("id", O.PrimaryKey)
  def name = column[String]("name")

  def * = (id, name) <> (Customer.tupled, Customer.unapply _)
}

object Customers {
  val customers = TableQuery[CustomerTable]

  def create(c: Customer)(implicit session: Session) = {
    customers.insert(c)
  }
}

class DomainTable(tag: Tag) extends Table[Domain](tag, "domains") {
  def id = column[Long]("id", O.PrimaryKey)
  def customer_id = column[Long]("customer_id", O.NotNull)
  def domain = column[String]("domain", O.NotNull)

  def * = (id, customer_id, domain) <> (Domain.tupled, Domain.unapply _)
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
  def css_values = column[String]("css_value", O.NotNull)

  def * = (id, key, css_template, css_values) <> (Template.tupled, Template.unapply _)
}

object Templates {
  val templates = TableQuery[TemplateTable]

  def create(t: Template)(implicit s: Session): Unit = {
    templates.insert(t)
  }
}

class PageTable(tag: Tag) extends Table[Page](tag, "pages") {
  def customer_id = column[Long]("customer_id")
  def domain_id = column[Long]("domain_id")
  def path = column[String]("path")
  def template_id = column[Long]("template_id")
  def title = column[String]("title")
  def data = column[String]("data")

  def * = (customer_id, domain_id, path, template_id, title, data) <> (Page.tupled, Page.unapply _)
}

object Pages {
  val pages = TableQuery[PageTable]

  def create(p: Page)(implicit s: Session): Unit = {
    pages.insert(p)
  }

  type LookupResult = Option[(Long, Option[String], Option[String], Option[String], Option[String], Option[String])]
  def lookup(domain: String, path: String)(implicit s: Session): LookupResult = {
    Domains.domains
      .filter(_.domain === domain)
      .leftJoin(pages).on({ case (d, p) => d.id === p.domain_id && p.customer_id === d.customer_id && p.path === path })
      .leftJoin(Templates.templates).on({ case ((d, p), t) => t.id === p.template_id })
      .map { case ((d, p), t) => (d.id, p.title.?, p.data.?, t.key.?, t.css_template.?, t.css_values.?) }
      .firstOption
  }
}

object TestData {
  val customers = Seq(
    Customer(1, "Hardchee.se"),
    Customer(2, "AmySnively"),
    Customer(3, "Barton Inc.")
  )

  val domains = Seq(
    Domain(1, 1, "devonstewart.com"),
    Domain(2, 2, "amysnively.com"),
    Domain(3, 3, "ashleybarton.com"),
    Domain(4, 1, "hardchee.se")
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
    """, """
{
  "primary_bg": "#3b5998",
  "primary_color": "#ffffff",
  "hilight_color": "#333333",
  "nav_active_bg": "white",
  "nav_active_color": "#3b5998",
  "section_banners": [
    {"url": "http://html5up.net/uploads/demos/read-only/images/banner.jpg", "section": "#first"}
  ]
}
"""),
    Template(2, "0", "", "{}")
  )

  val pages = Seq(
    Page(1, 1, "", 1, "Devon Stewart: Home", """
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
    "template": "#header { background: <%= primary_bg %>; color: <%= primary_color %>; }\n#header > nav ul li a.active { background: <%= nav_active_bg %>; color: <%= nav_active_color %> !important; }",
    "values": {
      "primary_bg": "#4acaa8",
      "primary_color": "#d1f1e9",
      "hilight_color": "#b6e9dc",
      "nav_active_bg": "white",
      "nav_active_color": "#4acaa8"
    }
  }
}
"""),
    Page(1, 4, "", 2, "index", "{\"hello\": \"Devon\", \"sc-url\": \"https://soundcloud.com/shiroyukihime/sets/jpop-anime-ost\", \"youtube\": \"gN9cIlICDt4\", \"bgColor\":\"#f8f8ff\"}"),
    Page(2, 2, "", 1, "homepage", "{}"),
    Page(3, 3, "hello/world", 1, "hello, world!", "{\"hello\": \"world\", \"sc-url\": \"https://soundcloud.com/joeljuliusbaer/sets/parov-stellar\", \"youtube\": \"04mfKJWDSzI\"}"),
    Page(3, 3, "broken", 90, "broken", "This is a broken page")
  )

  def create()(implicit session: Session) {
    Customers.customers.delete
    Domains.domains.delete
    Templates.templates.delete
    Pages.pages.delete

    customers.foreach(Customers.create)
    domains.foreach(Domains.create)
    templates.foreach(Templates.create)
    pages.foreach(Pages.create)
  }
}
