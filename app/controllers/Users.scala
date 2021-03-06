package controllers

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current
import play.api.libs.json.{ Json, JsValue }
import play.twirl.api.Html

import securesocial.core.utils._

import models.{ Accounts, Page, Template, UserModel, Queries, AuthProfiles }
import types._

case class NewDomainForm(account_id: AccountId, domain: String, template: String)
case class NewPageForm(account_id: AccountId, domain_id: Long, path: Path, name: String, template: String)

object Users extends SecureController {
  def index = SecuredAction { implicit request =>
    DB.withSession { implicit s =>
      val vm = Queries.accountsIndex(request.user.user.id)
      Ok(Html(views.account.index(vm).render))
    }
  }

  def edit(domain: String, path: Path) = SecuredAction { implicit request =>
    DB.withSession { implicit s =>
      val userId = request.user.user.id
      Queries.pageEdit(userId, domain, path)
        .map(vm => Ok(Html(views.account.edit(domain, vm).render)))
        .getOrElse(NotFound)
    }
  }

  implicit val readsNewDomainForm = Json.reads[NewDomainForm]
  def newDomain = SecuredAction(parse.json[NewDomainForm]) { implicit request =>
    // TODO: Once multi-page is supported, remove "template" parameter and initial page creation in newDomain
    val json = request.body

    DB.withSession { implicit s =>
      Queries.newDomain(request.user.user.id, json.account_id, json.domain)(json.template).map { domain =>
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
      Queries.newPage(request.user.user.id, json.account_id, json.domain_id)(json.path, json.name, json.template).map { page =>
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

  def associate = SecuredAction { implicit request =>
    Ok(Html(views.account.associate().render))
  }

  def associateResult(id: String) = SecuredAction { implicit request =>
    Ok(Html(views.account.associate().render))
  }

  def disassociate(id: String) = SecuredAction(WithSecondaryProvider(id)).async { implicit request =>
    val newUser = DB.withSession { implicit s =>
      AuthProfiles.disassociateProvider(request.user, id)
    }

    for {
      updatedAuthenticator <- request.authenticator.updateUser(newUser)
      result <- Redirect(routes.Users.associate).touchingAuthenticator(updatedAuthenticator)
    } yield {
      log.info(s"Disassociated ${newUser.main.fullName} from $id")
      result
    }
  }
}
