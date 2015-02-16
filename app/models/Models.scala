package models

case class Customer(id: Long, name: String)
case class Domain(id: Long, domain: String)
case class Template(id: Long, html: String)
case class Page(customer_id: Long, domain_id: Long, path: Option[String], template_id: Long, data: String)

object Customers {
  val customers = Seq(
    Customer(1, "Hardchee.se"),
    Customer(2, "AmySnively"),
    Customer(3, "Barton Inc.")
  )
}

object Domains {
  val domains = Seq(
    Domain(1, "devonstewart.com"),
    Domain(2, "amysnively.com"),
    Domain(3, "ashleybarton.com")
  )
}

object Templates {
  val templates = Seq(
    Template(1, "<html>Hello, world!</html>")
  )
}

object Pages {
  val pages = Seq(
    Page(1, 1, None, 1, "{}"),
    Page(2, 2, None, 1, "{}")
  )
}
