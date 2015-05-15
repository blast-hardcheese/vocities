package controllers

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current
import play.api.libs.json.{ Json, JsValue }

import play.twirl.api.Html

import models.{ Accounts, Page, Template, UserModel, Queries }

import securesocial.core.{ SecureSocial, RuntimeEnvironment }

object Users extends BaseController {
}

case class NewDomainForm(account_id: Long, domain: String)
case class NewPageForm(account_id: Long, domain_id: Long, path: String, name: String, template: String)

class Users(override implicit val env: RuntimeEnvironment[UserModel]) extends BaseController with SecureSocial[UserModel] {

  def index = SecuredAction { implicit request =>
    DB.withSession { implicit s =>
      val vm = Queries.accountsIndex(request.user.userId)
      Ok(views.html.account.index(vm))
    }
  }

  def edit(domain: String, path: String) = SecuredAction { implicit request =>
    DB.withSession { implicit s =>
      val userId = request.user.userId
      Queries.pageEdit(userId, domain, path)
        .map(vm => Ok(views.html.account.edit(domain, vm)))
        .getOrElse(NotFound)
    }
  }

  def save(domain: String, path: String) = SecuredAction(parse.json) { implicit request =>
    val key = "html5up-read-only"

    DB.withSession { implicit s =>
      val userId = request.user.userId

      val parser = models.TemplateData.byName(key)

      parser
        .validate(request.body)
        .map { case (title, data) => Ok(Queries.pageSave(userId, domain, path)(title, data).toString)
      } getOrElse { BadRequest }
    }
  }

  implicit val readsNewDomainForm = Json.reads[NewDomainForm]
  def newDomain = SecuredAction(parse.json[NewDomainForm]) { implicit request =>
    val json = request.body

    DB.withSession { implicit s =>
      Queries.newDomain(request.user.userId, json.account_id, json.domain).map { domain =>
        Ok(Json.obj(
          "account_id" -> domain.account_id,
          "domain" -> domain.id
        ))
      } getOrElse {
        BadRequest
      }
    }
  }

  implicit val readsNewPageForm = Json.reads[NewPageForm]
  def newPage = SecuredAction(parse.json[NewPageForm]) { implicit request =>
    val json = request.body

    DB.withSession { implicit s =>
      Queries.newPage(request.user.userId, json.account_id, json.domain_id)(json.path, json.name, json.template).map { page =>
        Ok(Json.obj(
          "account_id" -> page.account_id,
          "domain_id" -> page.domain_id,
          "path" -> page.path,
          "title" -> page.title
        ))
      } getOrElse {
        BadRequest
      }
    }
  }
}
