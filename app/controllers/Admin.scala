package controllers

import scala.util.Try

import play.api._
import play.api.mvc._
import play.api.Play.current

import play.twirl.api.Html

object Admin extends SecureController {
  // Asset lookup, debugging related
  def lookup(path: String) = SecuredAction(WithRoles(models.UserRoles.Admin)) { implicit request =>
    val webjarPath = Try(WebJarAssets.locate(path))
    val route = webjarPath.flatMap { webjarPath => Try(routes.WebJarAssets.at(webjarPath)) }

    Ok(Html(s"<html><body><div><span>path: $webjarPath</span></div><div><span>route: $route</span></div></body></html>"))
  }
}
