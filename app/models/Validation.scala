package models

import play.api.Logger
import play.api.libs.json.{ Json, JsValue, JsResult }

trait ValidatableTemplateData { self =>
  val log = Logger(self.getClass.getName)

  type UnpackTarget

  def validate(data: JsValue): Option[(String, JsValue)] = {
    fromJson(data).fold(
      { e => log.error(s"Unable to unpack template body: $e"); None },
      Some.apply _
    )
    .map(unpackResult)
  }

  def fromJson(data: JsValue): JsResult[UnpackTarget]
  def unpackResult(data: UnpackTarget): (String, JsValue)
}

trait HasDefaultTemplateData {
  def default: JsValue
}

case class GoogleAnalytics(trackingId: String)
object GoogleAnalytics {
  implicit val jsonFormatGoogleAnalytics = Json.format[GoogleAnalytics]
}

case class Metadata(ga: Option[GoogleAnalytics], custom: Option[String])
object Metadata {
  implicit val jsonFormatMetadata = Json.format[Metadata]
}

object TemplateData {
  object Html5Up__sections extends ValidatableTemplateData with HasDefaultTemplateData {
    case class Header(src: String, name: String, flavortext: Option[String])
    case class Footer(copyright: String)
    case class Sidebar(header: Header)
    case class Widget(`type`: String, data: JsValue)
    case class Section(tag: String, title: String, bannerImage: Option[String], content: Widget)
    case class Social(twitter: Option[String], facebook: Option[String], instagram: Option[String], github: Option[String], email: Option[String])
    case class Css(scheme: Int, values: Option[Map[String, String]])
    case class PageData(
      sandbox: Option[Boolean]=Option.empty,
      sections: List[Section],
      social: Social,
      sidebar: Sidebar,
      footer: Footer,
      css: Option[Css],
      metadata: Option[Metadata] = None
    )

    implicit val jsonFormatHeader = Json.format[Header]
    implicit val jsonFormatFooter = Json.format[Footer]
    implicit val jsonFormatSidebar = Json.format[Sidebar]
    implicit val jsonFormatWidget = Json.format[Widget]
    implicit val jsonFormatSection = Json.format[Section]
    implicit val jsonFormatSocial = Json.format[Social]
    implicit val jsonFormatCss = Json.format[Css]
    implicit val jsonFormatPageData = Json.format[PageData]

    case class PostResult(title: String, data: PageData)
    implicit val jsonFormatPostResult = Json.format[PostResult]

    type UnpackTarget = PostResult

    def fromJson(data: JsValue) = data.validate[PostResult]
    def unpackResult(data: PostResult) = data match {
      case PostResult(title, data) => (title, Json.toJson(data))
    }

    def default = Json.toJson(
      PageData(
        sections=List(
          Section(
            tag="welcome-to-vocities",
            title="Welcome to VOCities!",
            bannerImage=None,
            content=Widget(
              `type`="paragraph",
              data=Json.obj(
                "content" -> "<p style=\"text-align: center;\">Hey again! To get started building your site, click this text to edit it!</p>\n<p style=\"text-align: center;\">To add more content, click \"New Section\" at the bottom of the sidebar.</p>\n<p style=\"text-align: center;\">If you've got any questions or just want to chat, drop us a line at <a href=\"mailto:blast@hardchee.se\">support@vocities.com</a></p>\n<center><strong>Thanks in advance for your feedback!</strong></center>"
              )
            )
          )
        ),
        social=Social(None, None, None, None, None),
        sidebar=Sidebar(
          header=Header(
            src="http://lorempixel.com/600/600/people/",
            name="Test User",
            flavortext=None
          )
        ),
        footer=Footer(
          copyright="VOCities"
        ),
        css=None
      )
    )
  }

  def byName(x: String): HasDefaultTemplateData with ValidatableTemplateData = x match {
    case "html5up_read_only" => Html5Up__sections
    case "html5up_prologue" => Html5Up__sections
  }
}
