package controllers

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current

import models.{ Page, Template }

object Application extends Controller {
  def route(path: String) = BaseAction { request =>
    DB.withSession { implicit s =>
      models.Pages.lookup(request.domain, path) map { case (domainId, pageData, template) =>
        println(s"$domainId, $pageData, $template")
        (pageData, template) match {
          case (Some(data), Some(template)) => Ok(s"$domainId, $data, $template")
          case (None, _)                    => BadRequest("404")
          case (_, None)                    => InternalServerError("Can't find template!")
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
