package models

import play.api.libs.json.{ Json, JsValue }

object TemplateData {
  object Html5Up_read_only {
    case class Header(src: String, name: String, flavortext: Option[String])
    case class Footer(copyright: String)
    case class Sidebar(header: Header)
    case class Widget(`type`: String, data: JsValue)
    case class Section(tag: String, title: String, content: Widget)
    case class Social(twitter: Option[String], facebook: Option[String], instagram: Option[String], github: Option[String], email: Option[String])
    case class PageData(sections: List[Section], social: Social, sidebar: Sidebar, footer: Footer)
    case class Css(values: JsValue)

    implicit val jsonFormatHeader = Json.format[Header]
    implicit val jsonFormatFooter = Json.format[Footer]
    implicit val jsonFormatSidebar = Json.format[Sidebar]
    implicit val jsonFormatWidget = Json.format[Widget]
    implicit val jsonFormatSection = Json.format[Section]
    implicit val jsonFormatSocial = Json.format[Social]
    implicit val jsonFormatPageData = Json.format[PageData]
    implicit val jsonFormatCss = Json.format[Css]

    case class PostResult(title: String, data: PageData)
    implicit val jsonFormatPostResult = Json.format[PostResult]
  }
}

