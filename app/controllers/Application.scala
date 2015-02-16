package controllers

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current

object Application extends Controller {

  def index = BaseAction { request =>
    Ok
  }

  def route(path: String) = BaseAction { request =>
    DB.withSession { implicit s =>
      models.Pages.lookup(request.domain, path) map { case (domainId, pageData, template) =>
        pageData.map { data =>
          Ok(s"$domainId, $data, $template")
        } getOrElse {
          BadRequest("404")
        }
      } getOrElse {
        BadRequest("unknown domain")
      }
    }
  }

  def edit(path: String) = BaseAction { request =>
    Ok(s"edit: $path")
  }

  def testData = BaseAction { request =>
    DB.withSession { implicit s =>
      models.TestData.create()
      Ok("Might have worked")
    }
  }
}
