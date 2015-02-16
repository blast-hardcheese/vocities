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

object BaseAction extends ActionBuilder[BaseRequest] with Results {
  def invokeBlock[A](request: Request[A], block: (BaseRequest[A]) => Future[Result]): Future[Result] = {
    val baseRequest = new BaseRequest[A](request)
    block(baseRequest)
  }
}

class BaseRequest[A](val request: Request[A]) extends WrappedRequest[A](request) {
  lazy val domainId: Option[Long] = None
}
