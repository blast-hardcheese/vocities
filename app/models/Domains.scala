package models

import utils.ExtendedPostgresDriver.simple._

case class Domain(id: Long, account_id: Long, domain: String)

class DomainTable(tag: Tag) extends Table[Domain](tag, "domains") {
  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def account_id = column[Long]("account_id", O.NotNull)
  def domain = column[String]("domain", O.NotNull)

  def * = (id, account_id, domain) <> (Domain.tupled, Domain.unapply _)
}

object Domains {
  val domains = TableQuery[DomainTable]

  def create(d: Domain)(implicit s: Session): Domain = {
    domains
      .returning(domains)
      .insert(d)
  }
}
