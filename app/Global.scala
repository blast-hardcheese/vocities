import com.typesafe.config.ConfigFactory
import java.io.File
import play.api._
import play.api.mvc.Results._
import play.api.mvc._
import scala.concurrent.Future
import scala.collection.immutable.ListMap
import scala.collection.mutable.{ Set => MutableSet }
import securesocial.core.providers._

import java.lang.reflect.Constructor
import securesocial.core.RuntimeEnvironment
import service.PostgresUserService
import models.UserModel

object Global extends WithFilters() {
  val enabledProviders: MutableSet[String] = MutableSet.empty

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

  override def onStart(app: Application) {
    val maybeProviders: Option[String] = app.configuration.getString("securesocial.providers")
    val providers: Seq[String] = maybeProviders.map(_.split(',').toSeq).getOrElse(Seq.empty)

    enabledProviders ++= providers
  }

  /**
   * The runtime environment for this sample app.
   */
  object MyRuntimeEnvironment extends RuntimeEnvironment.Default[UserModel] {
    override implicit val executionContext = play.api.libs.concurrent.Execution.defaultContext
    override lazy val userService: PostgresUserService = new PostgresUserService()

    private[this] def availableProviders: ListMap[String, securesocial.core.IdentityProvider] = ListMap(
      // oauth 2 client providers
      include(new FacebookProvider(routes, cacheService, oauth2ClientFor(FacebookProvider.Facebook))),
      include(new FoursquareProvider(routes, cacheService, oauth2ClientFor(FoursquareProvider.Foursquare))),
      include(new GitHubProvider(routes, cacheService, oauth2ClientFor(GitHubProvider.GitHub))),
      include(new GoogleProvider(routes, cacheService, oauth2ClientFor(GoogleProvider.Google))),
      include(new InstagramProvider(routes, cacheService, oauth2ClientFor(InstagramProvider.Instagram))),
      include(new ConcurProvider(routes, cacheService, oauth2ClientFor(ConcurProvider.Concur))),
      include(new SoundcloudProvider(routes, cacheService, oauth2ClientFor(SoundcloudProvider.Soundcloud))),
      //include(new LinkedInOAuth2Provider(routes, cacheService,oauth2ClientFor(LinkedInOAuth2Provider.LinkedIn))),
      include(new VkProvider(routes, cacheService, oauth2ClientFor(VkProvider.Vk))),
      include(new DropboxProvider(routes, cacheService, oauth2ClientFor(DropboxProvider.Dropbox))),
      include(new WeiboProvider(routes, cacheService, oauth2ClientFor(WeiboProvider.Weibo))),
      include(new ConcurProvider(routes, cacheService, oauth2ClientFor(ConcurProvider.Concur))),
      // oauth 1 client providers
      include(new LinkedInProvider(routes, cacheService, oauth1ClientFor(LinkedInProvider.LinkedIn))),
      include(new TwitterProvider(routes, cacheService, oauth1ClientFor(TwitterProvider.Twitter))),
      include(new XingProvider(routes, cacheService, oauth1ClientFor(XingProvider.Xing))),
      // username password
      include(new UsernamePasswordProvider[UserModel](userService, avatarService, viewTemplates, passwordHashers))
    )

    override lazy val providers: ListMap[String, securesocial.core.IdentityProvider] = {
      availableProviders
        .filter(enabledProviders contains _._1)
    }
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
