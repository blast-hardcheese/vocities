import play.api._
import play.api.mvc._
import play.api.mvc.Results._
import scala.concurrent.Future

object LiftedRequestFilter extends Filter {
  def apply(next: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    val result = next(request)
    println(s"$request: $result")
    result
  }
}

object Global extends WithFilters(LiftedRequestFilter)
