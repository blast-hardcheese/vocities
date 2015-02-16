package models

import scala.slick.driver.H2Driver.simple._

case class Customer(id: Long, name: String)
case class Domain(id: Long, domain: String)
case class Template(id: Long, html: String)
case class Page(customer_id: Long, domain_id: Long, path: Option[String], template_id: Long, data: String)

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
  def domain = column[String]("domain", O.NotNull)

  def * = (id, domain) <> (Domain.tupled, Domain.unapply _)
}

object Domains {
  val domains = TableQuery[DomainTable]

  def create(d: Domain)(implicit s: Session): Unit = {
    domains.insert(d)
  }
}

class TemplateTable(tag: Tag) extends Table[Template](tag, "templates") {
  def id = column[Long]("id", O.PrimaryKey)
  def html = column[String]("html", O.NotNull)

  def * = (id, html) <> (Template.tupled, Template.unapply _)
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
  def path = column[Option[String]]("path")
  def template_id = column[Long]("template_id")
  def data = column[String]("data")

  def * = (customer_id, domain_id, path, template_id, data) <> (Page.tupled, Page.unapply _)
}

object Pages {
  val pages = TableQuery[PageTable]

  def create(p: Page)(implicit s: Session): Unit = {
    pages.insert(p)
  }

  def lookup(domainId: Long, path: String)(implicit s: Session): Option[Page] = {
    pages
      .filter(_.domain_id === domainId)
      .filter(_.path === path)
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
    Domain(1, "devonstewart.com"),
    Domain(2, "amysnively.com"),
    Domain(3, "ashleybarton.com")
  )

  val templates = Seq(
    Template(1, "<html>Hello, world!</html>")
  )

  val pages = Seq(
    Page(1, 1, Some(""), 1, "{}"),
    Page(2, 2, Some(""), 1, "{}"),
    Page(3, 3, Some("hello/world"), 1, "{\"hello\": \"world\"}")
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
