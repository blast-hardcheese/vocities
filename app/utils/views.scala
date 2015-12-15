package utils

import play.twirl.api._
import play.api.libs.json.{ Json, JsValue, JsObject, JsString }

import javax.script.ScriptEngine

case class PageData(saveUrl: Option[String], title: String)
object PageData {
  implicit val pageDataWrites = Json.writes[PageData]
}

package object views {
  def encodePageData(saveUrl: Option[String], title: String, data: JsValue): Html = {
    val newData: JsObject = (
      Json.obj("_meta" -> Json.toJson(PageData(saveUrl, title)).asInstanceOf[JsObject]) ++
      data.asInstanceOf[JsObject]
    )

    Html(Json.stringify(newData).replace("</script>", "<\\/script>"))
  }

  val cloudinaryData: Html = {
    val config = play.api.Play.current.configuration
    val maybeCloudinary = for {
        cloud_name <- config.getString("cloudinary.cloud_name")
        upload_preset <- config.getString("cloudinary.upload_preset")
    } yield Json.obj(
        "cloud_name" -> cloud_name,
        "upload_preset" -> upload_preset
    )

    Html(Json.stringify(maybeCloudinary getOrElse Json.obj()))
  }

  def createElement(templateId: Html, key: String, pageData: JsValue)(engine: ScriptEngine): Html = {
    Html(engine.eval(s"React.renderToString(React.createElement(Templates[$templateId].classes[${JsString(key)}], _.extend({editable: false, _meta: {}}, $pageData)));").toString)
  }
}

