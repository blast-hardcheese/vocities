package models

import utils.ExtendedPostgresDriver.simple._
import utils.ExtendedPostgresDriver.createEnumJdbcType

object DomainClasses extends Enumeration {
  val Basic = Value("basic")
  val Advanced = Value("advanced")
  val Premium = Value("premium")
  val Unlimited = Value("unlimited")

  implicit val typeMapper = createEnumJdbcType("domain_class", DomainClasses)
}
import DomainClasses.{ Value => _, _ }

case class Domain(
  id: Long,
  account_id: Long,
  domain: String,
  domainClass: DomainClasses.Value = Basic
) {
  val maxPages = domainClass match {
    case Basic => 1
    case Advanced => 3
    case Premium => 10
    case Unlimited => 65535 // Should be enough pages for anybody
  }
}

class DomainTable(tag: Tag) extends Table[Domain](tag, "domains") {
  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def account_id = column[Long]("account_id", O.NotNull)
  def domain = column[String]("domain", O.NotNull)
  def domain_class = column[DomainClasses.Value]("class", O.NotNull)

  def * = (id, account_id, domain, domain_class) <> (Domain.tupled, Domain.unapply _)
}

object Domains {
  val domains = TableQuery[DomainTable]

  def create(d: Domain)(implicit s: Session): Domain = {
    domains
      .returning(domains)
      .insert(d)
  }
}
