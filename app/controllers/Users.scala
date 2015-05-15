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
    println(s"Got: ${request.body}")
    Ok
  }
}
