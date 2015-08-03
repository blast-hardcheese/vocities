import com.typesafe.config.ConfigFactory
import java.io.File
import play.api._
import play.api.mvc.Results._
import play.api.mvc._
import scala.concurrent.Future
import scala.collection.immutable.ListMap
import securesocial.core.providers.{ GoogleProvider, FacebookProvider, UsernamePasswordProvider }

import java.lang.reflect.Constructor
import securesocial.core.{ RuntimeEnvironment, OAuth2Provider }
import service.PostgresUserService
import models.UserModel

object Global extends WithFilters() {
  override def onLoadConfig(config: Configuration, path: File, classloader: ClassLoader, mode: Mode.Mode): Configuration = {
    import collection.JavaConversions._

    def configToMap(config: com.typesafe.config.Config): Map[String, Object] = {
      config.entrySet.iterator.foldRight(Map.empty[String, Object]) {
        case (entry, map) => map + (entry.getKey -> entry.getValue.unwrapped)
      }
    }

    val base = configToMap(config.underlying)
    val extraName = s"application.${mode.toString.toLowerCase}.conf"
    val extraConfig = ConfigFactory.parseResourcesAnySyntax(classloader, extraName)
    val extra = configToMap(extraConfig.resolve())
    val modeSpecificConfig = Configuration(ConfigFactory.parseMap(base ++ extra))

    super.onLoadConfig(modeSpecificConfig, path, classloader, mode)
  }

  /**
   * The runtime environment for this sample app.
   */
  object MyRuntimeEnvironment extends RuntimeEnvironment.Default[UserModel] {
    override implicit val executionContext = play.api.libs.concurrent.Execution.defaultContext
    override lazy val userService: PostgresUserService = new PostgresUserService()

    override lazy val providers = ListMap(
      include(new GoogleProvider(routes, cacheService, oauth2ClientFor(GoogleProvider.Google))),
      include(new UsernamePasswordProvider[UserModel](userService, avatarService, viewTemplates, passwordHashers))
    )
  }

  /**
   * An implementation that checks if the controller expects a RuntimeEnvironment and
   * passes the instance to it if required.
   */
  override def getControllerInstance[A](controllerClass: Class[A]): A = {
    val instance = controllerClass.getConstructors.find { c =>
      val params = c.getParameterTypes
      params.length == 1 && params(0) == classOf[RuntimeEnvironment[UserModel]]
    }.map {
      _.asInstanceOf[Constructor[A]].newInstance(MyRuntimeEnvironment)
    }
    instance.getOrElse(super.getControllerInstance(controllerClass))
  }
}
