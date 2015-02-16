package controllers

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current

object Application extends Controller {

  def index = BaseAction { request =>
    Ok(request.domainId.toString)
  }

  def route(path: String) = BaseAction { request =>
    request.domainId.map { domainId =>
      DB.withSession { implicit s =>
        models.Pages.lookup(request.domain, path) map { page =>
          Ok(s"$page")
        } getOrElse {
          BadRequest("404")
        }
      }
    } getOrElse {
      MovedPermanently("http://devonstewart.com:9001/")
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
