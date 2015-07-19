package controllers

import scala.util.Try

import java.io.File
import java.io.{ InputStreamReader, FileReader }
import javax.script.{ ScriptEngineManager, ScriptEngine }

import play.api._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current
import play.api.libs.json.{ Json, JsValue }

import play.twirl.api.Html

import org.webjars.WebJarAssetLocator

import models.{ Page, Template }

import securesocial.core.{ SecureSocial, RuntimeEnvironment }
import models.{ UserModel, Queries }

import utils.ExtendedPostgresDriver.simple._

class RichScriptEngine(val engine: ScriptEngine) {
  def evalResource(path: String): Object = {
    engine.eval(new InputStreamReader(Play.classloader.getResourceAsStream(path)))
  }

  def evalWebjar(pkg: String, name: String): Object = {
    val path = s"${WebJarAssetLocator.WEBJARS_PATH_PREFIX}/${WebJarAssets.fullPath(pkg, name)}"
    evalResource(path)
  }
}

object Application extends BaseController {
  import scala.language.implicitConversions
  implicit def liftEngine(e: ScriptEngine): RichScriptEngine = new RichScriptEngine(e)

  val engine = {
    log.info("[Core] Starting Nashorn engine...")
    val r = new ScriptEngineManager(null).getEngineByName("nashorn")
    log.debug(s"[Core]: $r")
    r.eval("var global = this;")
    r.eval("var log = function(x) { java.lang.System.out.println(x); }; var console = { warn: log, info: log, log: log };")
    r.evalWebjar("underscore", "underscore.js")
    r.evalWebjar("react", "react-with-addons.js")

    r.evalResource("public/javascripts/mixins.js")
    r.evalResource("public/javascripts/widgets.js")
    r.evalResource("public/javascripts/components/structure.js")
    r.evalResource("public/javascripts/templates.js")

    r
  }
}

class Application(override implicit val env: RuntimeEnvironment[UserModel]) extends BaseController with SecureSocial[UserModel] {
  val engine = Application.engine

  private[this] def doRender(domain: String, path: String)(saveUrl: Option[String] = None)(title: String, templateId: String, data: JsValue): Option[String] = {
    // Only here temporarily
    var r = new RichScriptEngine(engine)
    r.evalResource("public/javascripts/mixins.js")
    r.evalResource("public/javascripts/widgets.js")
    r.evalResource("public/javascripts/components/structure.js")
    r.evalResource("public/javascripts/templates.js")

    templateId match {
      case "html5up_read_only" => Some(views.html.templates.html5up_read_only(engine, saveUrl)(title, data).toString)
      case "html5up_prologue" => Some(views.html.templates.html5up_prologue(engine, saveUrl)(title, data).toString)
      case _ => None
    }
  }

  private[this] def render(domain: String, path: String)(saveUrl: Option[String] = None)(title: String, templateId: String, data: JsValue) = {
    val cacheKey = s"$templateId-$domain-$path"

    val maybeHtml = if (saveUrl.isEmpty) {
      cache.Cache.getAs[String](cacheKey)
        .orElse {
          val maybeRendered = doRender(domain, path)(saveUrl)(title, templateId, data)

          maybeRendered
            .foreach { value =>
              cache.Cache.set(cacheKey, value)
            }

          maybeRendered
        }
    } else {
      doRender(domain, path)(saveUrl)(title, templateId, data)
    }

    maybeHtml
      .map { value: String =>
        Ok(Html(value))
      }
      .getOrElse {
        InternalServerError
      }
  }

  def lookup(domain: String, path: String)(handler: (String, String, JsValue) => Result)(implicit request: Request[_]) = {
    DB.withSession { implicit s =>
      models.Pages.lookup(domain, path) map {
          case (_, Some(title), Some(data), Some(templateId)) => handler(title, templateId, data)
          case (_, None,        None,       _               ) => BadRequest("404")
          case (_, _,           _,          None            ) => InternalServerError("Can't find template!")
          case (a, b,           c,          d               ) => { log.error(s"Route match failure: $a $b $c $d"); InternalServerError("Unknown error") }
      } getOrElse {
        BadRequest("unknown domain")
      }
    }
  }

  def route(path: String) = Action { implicit request =>
    lookup(request.domain, path)(render(request.domain, path)())
  }

  def edit(domain: String, path: String) = SecuredAction { implicit request =>
    val route = routes.Application.save(domain, path).toString

    lookup(domain, path)(render(domain, path)(saveUrl=Some(route)))
  }

  def save(domain: String, path: String, templateId: String) = SecuredAction(parse.json) { implicit request =>
    DB.withSession { implicit s =>
      val userId = request.user.userId

      val parser = models.TemplateData.byName(templateId)

      parser
        .validate(request.body)
        .map { case (title, data) =>
          val result = Ok(Queries.pageSave(userId, domain, path)(title, data).toString)

          val cacheKey = s"$templateId-$domain-$path"
          doRender(domain, path)(None)(title, templateId, data)
            .foreach { html =>
              cache.Cache.set(cacheKey, html)
            }

          result
      } getOrElse { BadRequest }
    }
  }

  def lookup(path: String) = SecuredAction { implicit request =>
    val maybeUser = DB.withSession { implicit s =>
      models.Users.users
        .filter(_.id === request.user.userId)
        .firstOption
    }

    maybeUser
      .filter(_.roles.contains(models.UserRoles.Admin))
      .map { _ =>
        val webjarPath = Try(WebJarAssets.locate(path))
        val route = webjarPath.flatMap { webjarPath => Try(routes.WebJarAssets.at(webjarPath)) }

        Ok(Html(s"<html><body><div><span>path: $webjarPath</span></div><div><span>route: $route</span></div></body></html>"))
      } getOrElse {
        NotFound
      }
  }
}
