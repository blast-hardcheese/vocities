package controllers

import java.io.File
import java.io.{ InputStreamReader, FileReader }
import javax.script.{ ScriptEngineManager, ScriptEngine }

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current
import play.api.libs.json.{ Json, JsValue }

import play.twirl.api.Html

import models.{ Page, Template }

import securesocial.core.{ SecureSocial, RuntimeEnvironment }
import models.UserModel

class RichScriptEngine(val engine: ScriptEngine) {
  def evalResource(path: String): Object = {
    engine.eval(new InputStreamReader(Play.classloader.getResourceAsStream(path)))
  }
}

object Application extends BaseController {
  import scala.language.implicitConversions
  implicit def liftEngine(e: ScriptEngine): RichScriptEngine = new RichScriptEngine(e)

  lazy val engine = {
    log.info("[Core] Starting Nashorn engine...")
    val r = new ScriptEngineManager(null).getEngineByName("nashorn")
    log.debug(s"[Core]: $r")
    r.eval("var global = this;")
    r.eval("var noop = function() {}; var console = { warn: noop, info: noop, log: noop };")
    r.evalResource("public/lib/underscorejs/underscore.js")
    r.evalResource("public/lib/react/react-with-addons.js")
    r.evalResource("public/javascripts/widgets.js")
    r.evalResource("public/javascripts/templates.js")

    r
  }
}

class Application(override implicit val env: RuntimeEnvironment[UserModel]) extends BaseController with SecureSocial[UserModel] {
  val engine = Application.engine

  private[this] def render(title: String, templateId: String, data: JsValue, css_template: String, css_values: JsValue) = {
    // Only here temporarily
    new RichScriptEngine(engine).evalResource("public/javascripts/templates.js")

    templateId match {
      case "html5-read-only" => Ok(views.html.templates.html5up_read_only(engine)(title, data, css_template, css_values))
      case _ => NotFound
    }
  }

  def lookup(path: String)(handler: (String, String, JsValue, String, JsValue) => Result)(implicit request: Request[_]) = {
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
        Ok //(views.html.editor(title, templateId, data, Html("")))
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
    Ok(s"Your id on ${request.user.main.providerId} is ${request.user.main.userId}")
  }
}
