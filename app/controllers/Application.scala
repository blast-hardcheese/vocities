package controllers

import java.io.File
import java.io.FileReader
import javax.script.ScriptEngineManager

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current

import play.twirl.api.Html

import models.{ Page, Template }

object Application extends BaseController {
  DB.withSession { implicit s =>
    println(s"Seed test data")
    models.TestData.create
  }

  lazy val engine = {
    log.info("[Core] Starting Nashorn engine...")
    val r = new ScriptEngineManager(null).getEngineByName("nashorn")
    log.debug(s"[Core]: $r")
    r.eval("var global = this;")
    r.eval("var console = {warn: function() { throw arguments[0]; }};")
    r.eval(new FileReader(new File("./target/web/public/main/lib/react/react-with-addons.js")))
    r.eval(new FileReader(new File("./target/web/reactjs/main/javascripts/widgets.js")))
    r.eval(new FileReader(new File("./target/web/public/main/javascripts/templates.js")))
    r
  }

  private[this] def render(templateId: String, data: String) = {
    Ok(views.html.render(templateId, data, Html(engine.eval(s"React.renderToString(React.createElement(Templates[$templateId], $data));").toString)))
  }

  def lookup(request: BaseRequest[_], path: String)(handler: (String, String) => Result) = {
    DB.withSession { implicit s =>
      models.Pages.lookup(request.domain, path) map { case (domainId, pageTitle, pageData, templateId) =>
        (pageTitle, pageData, templateId) match {
          case (Some(title), Some(data), Some(templateId)) => handler(templateId, data)
          case (None, None, _)                             => BadRequest("404")
          case (_, _, None)                                => InternalServerError("Can't find template!")
        }
      } getOrElse {
        BadRequest("unknown domain")
      }
    }
  }

  def route(path: String) = BaseAction { request =>
    lookup(request, path)(render)
  }

  def edit(path: String) = BaseAction { request =>
    lookup(request, path) { case (templateId, data) => {
        Ok(s"edit: $path, $templateId, $data")
      }
    }
  }

  def save(path: String) = BaseAction { request =>
    Redirect(routes.Application.edit(path))
  }
}
