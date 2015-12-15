import play.api.libs.json.JsValue

package object types {

  type Tagged[U] = { type Tag = U }
  type @@[T, U] = T with Tagged[U]

  def tag[T, U](o: T): T @@ U = o.asInstanceOf[T @@ U]
  def tag[T1T, T1U, T2T, T2U, T3T, T3U](o: (Option[T1T], Option[T2T], Option[T3T])): (Option[T1T @@ T1U], Option[T2T @@ T2U], Option[T3T @@ T3U]) = (o._1.map(tag(_)), o._2.map(tag(_)), o._3.map(tag(_)))

  type UserId = Long @@ UserId.Internal
  object UserId { trait Internal; def apply(x: Long) = tag[Long, Internal](x) }

  type PageTitle = String @@ PageTitle.Internal
  object PageTitle { trait Internal; def apply(x: String) = tag[String, Internal](x) }

  type PageData = JsValue @@ PageData.Internal
  object PageData { trait Internal; def apply(x: JsValue) = tag[JsValue, Internal](x) }

  type TemplateKey = String @@ TemplateKey.Internal
  object TemplateKey { trait Internal; def apply(x: String) = tag[String, Internal](x) }
}
