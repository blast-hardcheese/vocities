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

class Users(override implicit val env: RuntimeEnvironment[UserModel]) extends BaseController with SecureSocial[UserModel] {

  def index = SecuredAction { implicit request =>
    DB.withSession { implicit s =>
      val vm = Queries.accountsIndex(request.user.userId)
      Ok(views.html.account.index(vm))
    }
  }

  def edit(domain_id: Long, path: String) = SecuredAction { implicit request =>
    DB.withSession { implicit s =>
      val userId = request.user.userId
      Queries.pageEdit(userId, domain_id, path)
        .map(vm => Ok(views.html.account.edit(vm)))
        .getOrElse(NotFound)
    }
  }
}
