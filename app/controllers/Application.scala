package controllers

import java.io.File
import java.io.FileReader
import javax.script.ScriptEngineManager

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current

import models.{ Page, Template }

object Application extends Controller {
  lazy val engine = {
    val r = new ScriptEngineManager(null).getEngineByName("nashorn")
    r.eval("var global = this;")
    r.eval(new FileReader(new File("./target/web/public/main/lib/react/react-with-addons.js")))
    r.eval(new FileReader(new File("public/javascripts/templates.js")))
    r
  }

  private[this] def render(templateId: String, data: String) = {
    Ok(play.twirl.api.Html(engine.eval(s"React.renderToString(React.createElement(Templates[$templateId], $data));").toString))
  }

  def route(path: String) = BaseAction { request =>
    DB.withSession { implicit s =>
      models.Pages.lookup(request.domain, path) map { case (domainId, pageData, template) =>
        (pageData, template) match {
          case (Some(data), Some(template)) => render(template, data)
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
