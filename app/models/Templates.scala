package models

import play.api.Logger
import play.api.libs.json.{ Json, JsValue, Reads, Writes }

trait ValidatableTemplateData {
  val log = Logger("application")

  type UnpackTarget

  def validate(data: JsValue)(implicit reads: Reads[UnpackTarget], writes: Writes[UnpackTarget]): Option[(String, JsValue)] = {
    data.validate[UnpackTarget].fold(
      { e => log.error(s"Unable to unpack template body: $e"); None },
      Some.apply _
    )
    .map(unpack)
  }

  def unpack(data: UnpackTarget): (String, JsValue)
}

trait HasDefaultTemplateData {
  def default: JsValue
}

object TemplateData {
  object Html5Up__sections extends ValidatableTemplateData with HasDefaultTemplateData {
    case class Header(src: String, name: String, flavortext: Option[String])
    case class Footer(copyright: String)
    case class Sidebar(header: Header)
    case class Widget(`type`: String, data: JsValue)
    case class Section(tag: String, title: String, bannerImage: Option[String], content: Widget)
    case class Social(twitter: Option[String], facebook: Option[String], instagram: Option[String], github: Option[String], email: Option[String])
    case class Css(values: JsValue)
    case class PageData(sections: List[Section], social: Social, sidebar: Sidebar, footer: Footer, css: Option[Css])

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

    def unpack(data: PostResult): (String, JsValue) = data match {
      case PostResult(title, data) => (title, Json.toJson(data))
    }

    def default = Json.toJson(
      PageData(
        sections=List.empty,
        social=Social(None, None, None, None, None),
        sidebar=Sidebar(
          header=Header(
            src="http://photos3.meetupstatic.com/photos/member/3/9/a/7/member_243074759.jpeg",
            name="Devon Stewart",
            flavortext=None
          )
        ),
        footer=Footer(
          copyright="Devon Stewart"
        ),
        css=None
      )
    )
  }

  def byName(x: String) = x match {
    case "html5up-read-only" => Html5Up__sections
    case "html5up-prologue" => Html5Up__sections
  }
}
