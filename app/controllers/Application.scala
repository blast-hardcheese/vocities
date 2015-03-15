package controllers

import java.io.File
import java.io.FileReader
import javax.script.ScriptEngineManager

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current
import play.api.libs.json.Json

import play.twirl.api.Html

import models.{ Page, Template }

import securesocial.core.{ SecureSocial, RuntimeEnvironment }
import service.DemoUser

class Application(override implicit val env: RuntimeEnvironment[DemoUser]) extends BaseController with SecureSocial[DemoUser] {
  lazy val engine = {
    log.info("[Core] Starting Nashorn engine...")
    val r = new ScriptEngineManager(null).getEngineByName("nashorn")
    log.debug(s"[Core]: $r")
    r.eval("var global = this;")
    r.eval("var noop = function() {}; var console = { warn: noop, info: noop, log: noop };")
    r.eval(new FileReader(new File("./target/web/public/main/lib/underscorejs/underscore.js")))
    r.eval(new FileReader(new File("./target/web/public/main/lib/react/react-with-addons.js")))
    r.eval(new FileReader(new File("./target/web/reactjs/main/javascripts/widgets.js")))
    r.eval(new FileReader(new File("./target/web/public/main/javascripts/templates.js")))
    r
  }

  private[this] def render(title: String, templateId: String, data: String, css_template: String, _css_values: String) = {
    // Only here temporarily
    engine.eval(new FileReader(new File("./target/web/public/main/javascripts/templates.js")))

    val jsData = Json.parse(data)
    val css_values = Json.parse(_css_values)
    Ok(views.html.templates.html5up_read_me(engine)(title, jsData, css_template, css_values))
  }

  def lookup(path: String)(handler: (String, String, String, String, String) => Result)(implicit request: Request[_]) = {
    DB.withSession { implicit s =>
      models.Pages.lookup(request.domain, path) map {
          case (_, Some(title), Some(data), Some(templateId), Some(css_template), Some(css_values)) => handler(title, templateId, data, css_template, css_values)
          case (_, None,        None,       _,                _,                  _               ) => BadRequest("404")
          case (_, _,           _,          None,             _,                  _               ) => InternalServerError("Can't find template!")
          case (a, b,           c,          d,                e,                  f               ) => { log.error(s"Route match failure: $a $b $c $d $e $f"); InternalServerError("Unknown error") }
      } getOrElse {
        BadRequest("unknown domain")
      }
    }
  }

  def route(path: String) = Action { implicit request =>
    lookup(path)(render)
  }

  def edit(path: String) = Action { implicit request =>
    lookup(path) { case (title, templateId, data, css_template, css_values) => {
        Ok(views.html.editor(title, templateId, data, Html(engine.eval(s"React.renderToString(React.createElement(Templates['$templateId'](), $data));").toString)))
      }
    }
  }

  def save(path: String) = Action { request =>
    Redirect(routes.Application.edit(path))
  }

  def testData = Action { request =>
    DB.withSession { implicit s =>
      println(s"Seed test data")
      models.TestData.create
      Ok("Created")
    }
  }


  def currentUser = SecuredAction { implicit request =>
    Ok(s"Your id is ${request.user}")
  }
}
