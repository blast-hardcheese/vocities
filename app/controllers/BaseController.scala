package controllers

import play.api.Logger
import play.api.data.validation.ValidationError
import play.api.libs.json._
import play.api.mvc._
import play.api.db.slick._
import play.api.Play.current

import scala.concurrent.Future

trait BaseController extends Controller {
  protected val log = Logger("application")
  protected lazy val classLogger = Logger(this.getClass)
}
