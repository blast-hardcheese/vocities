package utils

import play.twirl.api._
import play.api.libs.json.{ Json, JsValue, JsObject }

case class PageData(saveUrl: Option[String], title: String)
object PageData {
  implicit val pageDataWrites = Json.writes[PageData]
}

package object views {
  def encodePageData(saveUrl: Option[String], title: String, data: JsValue): Html = {
    val newData: JsObject = (
      Json.toJson(PageData(saveUrl, title)).asInstanceOf[JsObject] ++
      data.asInstanceOf[JsObject]
    )

    Html(Json.stringify(newData).replace("</script>", "<\\/script>"))
  }
}

