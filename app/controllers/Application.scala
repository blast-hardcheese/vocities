package controllers

import java.io.File
import java.io.{ InputStreamReader, FileReader }
import javax.script.{ ScriptEngineManager, ScriptEngine }

import play.api.Play.current
import play.api._
import play.api.db.slick._
import play.api.libs.json.{ Json, JsValue }
import play.api.mvc._
import play.twirl.api.Html

import org.webjars.WebJarAssetLocator

import models.{ Page, Template }
import models.{ UserModel, Queries }
import types._
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

object PageCache {
  private[this] def cacheKey(templateId: String, domain: String, path: Path): String = s"$templateId-$domain-${path.path}"

  def set(templateId: String, domain: String, path: Path)(html: Html): Unit = {
    cache.Cache.set(cacheKey(templateId, domain, path), html.toString)
  }

  def get(templateId: String, domain: String, path: Path)(maybeHtml: => Option[Html]): Option[Html] = {
    cache.Cache.getAs[String](cacheKey(templateId, domain, path))
      .map(Html(_))
      .orElse {
        maybeHtml.foreach(set(templateId, domain, path)(_))

        maybeHtml
      }
  }
}

object Application extends SecureController {
  import scala.language.implicitConversions
  implicit def liftEngine(e: ScriptEngine): RichScriptEngine = new RichScriptEngine(e)

  def reloadScripts(r: RichScriptEngine): Unit = {
    r.evalResource("public/javascripts/mixins.js")
    r.evalResource("public/javascripts/widgets.js")
    r.evalResource("public/javascripts/components/structure.js")
    r.evalResource("public/javascripts/templates.js")
  }

  val engine = {
    log.info("[Core] Starting Javascript engine...")
    val engineManager = new ScriptEngineManager(null)
    val r = engineManager.getEngineByName("JavaScript")

    log.debug(s"[Core]: $r")
    r.eval("var global = this;")
    r.eval("var log = function(x) { java.lang.System.out.println(x); }; var console = { warn: log, info: log, log: log };")
    r.evalWebjar("underscore", "underscore.js")
    r.evalWebjar("react", "react-with-addons.js")

    reloadScripts(r)

    r
  }

  private[this] def doRender(domain: String, path: Path)(saveUrl: Option[String] = None)(renderModel: RenderModel): Option[Html] = {
    if (Play.isDev) {
      reloadScripts(engine)
    }

    renderModel.templateId match {
      case "html5up_read_only" => Some(views.templates.html5up_read_only(engine, saveUrl)(renderModel))
      case "html5up_prologue" => Some(views.templates.html5up_prologue(engine, saveUrl)(renderModel))
      case "plain" => Some(views.templates.plain(engine, saveUrl)(renderModel))
      case _ => None
    }
  }

  private[this] def render(domain: String, path: Path)(saveUrl: Option[String] = None)(renderModel: RenderModel): Result = {
    val templateId = renderModel.templateId

    val maybeHtml = if (saveUrl.isEmpty) {
      PageCache.get(templateId, domain, path)(doRender(domain, path)(saveUrl)(renderModel))
    } else {
      doRender(domain, path)(saveUrl)(renderModel)
    }

    maybeHtml
      .map { value =>
        Ok(value)
      }
      .getOrElse {
        InternalServerError
      }
  }

  def lookup(maybeUserId: Option[UserId], domain: String, path: Path)(handler: RenderModel => Result)(implicit request: Request[_]) = {
    DB.withSession { implicit s =>
      models.Pages.lookup(maybeUserId, domain, path) map {
          case (Some(title), Some(data), Some(templateId)) => handler(RenderModel(title=title, templateId=templateId, pageData=data))
          case (None,        None,       _               ) => BadRequest("Page not found")
          case (_,           _,          None            ) => InternalServerError("Can't find template!")
          case (b,           c,          d               ) => { log.error(s"Route match failure: $b $c $d"); InternalServerError("Unknown error") }
      } getOrElse {
        BadRequest("unknown domain")
      }
    }
  }

  def route(path: Path) = Action { implicit request =>
    lookup(None, request.domain, path)(render(request.domain, path)())
  }

  def edit(domain: String, path: Path) = SecuredAction { implicit request =>
    val route = routes.Application.save(domain, path).toString
    val maybeUserId = Some(UserId(request.user.user.id))

    lookup(maybeUserId, domain, path)(render(domain, path)(saveUrl=Some(route)))
  }

  def save(domain: String, path: Path, templateId: String) = SecuredAction(parse.json) { implicit request =>
    val userId = UserId(request.user.user.id)

    val parser = models.TemplateData.byName(templateId)

    parser
      .validate(request.body)
      .map { case (title, data) =>
        DB.withSession { implicit s =>
          Queries.pageSave(userId, domain, path)(title, data)
            .map { success =>
              if (true) {
                val renderModel = RenderModel(
                  title=title,
                  templateId=templateId,
                  pageData=data
                )

                doRender(domain, path)(None)(renderModel)
                  .foreach(PageCache.set(templateId, domain, path)(_))

                Ok
              } else {
                NotFound
              }
            }
            .getOrElse(Unauthorized)
        }
      } getOrElse { BadRequest }
  }
}

case class RenderModel(
  title: String,
  templateId: String,
  pageData: JsValue
)
