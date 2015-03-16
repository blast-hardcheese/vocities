import com.typesafe.config.ConfigFactory
import java.io.File
import play.api._
import play.api.mvc.Results._
import play.api.mvc._
import scala.concurrent.Future
import scala.collection.immutable.ListMap
import securesocial.core.providers.GoogleProvider

import java.lang.reflect.Constructor
import securesocial.core.{ RuntimeEnvironment, OAuth2Provider }
import service.InMemoryUserService
import models.DemoUser

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

  /**
   * The runtime environment for this sample app.
   */
  object MyRuntimeEnvironment extends RuntimeEnvironment.Default[DemoUser] {
    override implicit val executionContext = play.api.libs.concurrent.Execution.defaultContext
    override lazy val userService: InMemoryUserService = new InMemoryUserService()

    override lazy val providers = ListMap(
      include(new GoogleProvider(routes, cacheService, oauth2ClientFor(GoogleProvider.Google)))
    )
  }

  /**
   * An implementation that checks if the controller expects a RuntimeEnvironment and
   * passes the instance to it if required.
   */
  override def getControllerInstance[A](controllerClass: Class[A]): A = {
    val instance = controllerClass.getConstructors.find { c =>
      val params = c.getParameterTypes
      params.length == 1 && params(0) == classOf[RuntimeEnvironment[DemoUser]]
    }.map {
      _.asInstanceOf[Constructor[A]].newInstance(MyRuntimeEnvironment)
    }
    instance.getOrElse(super.getControllerInstance(controllerClass))
  }
}
