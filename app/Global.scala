import com.typesafe.config.ConfigFactory
import java.io.File
import play.api._
import play.api.mvc.Results._
import play.api.mvc._
import scala.concurrent.Future

object LiftedRequestFilter extends Filter {
  def apply(next: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    val result = next(request)
    println(s"$request: $result")
    result
  }
}

object Global extends WithFilters(LiftedRequestFilter) {
  override def onLoadConfig(config: Configuration, path: File, classloader: ClassLoader, mode: Mode.Mode): Configuration = {
    val modeSpecificConfig = config ++ Configuration(ConfigFactory.load(s"application.${mode.toString.toLowerCase}.conf"))
    super.onLoadConfig(modeSpecificConfig, path, classloader, mode)
  }
}
