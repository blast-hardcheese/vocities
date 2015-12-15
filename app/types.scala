import play.api.libs.json._
import play.api.mvc.{ PathBindable, JavascriptLitteral }

package types {
  case class Path(path: String)

  trait Definitions {
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

  trait Values {
    val EmptyPath = Path("")
  }

  trait PlayBinders {
    implicit object BindPath extends PathBindable[Path] {
      def bind(key: String, value: String): Either[String, Path] = {
        implicitly[PathBindable[String]].bind(key, value).right.map(Path(_))
      }

      def unbind(key: String, path: Path): String = {
        implicitly[PathBindable[String]].unbind(key, path.path)
      }
    }

    implicit object JSLitteralPath extends JavascriptLitteral[Path] {
      def to(value: Path): String = value.path
    }
  }

  trait SlickTypes { self: Definitions =>
    import utils.ExtendedPostgresDriver.simple._

    implicit val pathColumnType = MappedColumnType.base[Path, String]({ case Path(path) => path }, Path(_))
  }

  trait JsonTypes { self: Definitions =>

    implicit val readPath = implicitly[Reads[String]].map(Path(_))
    implicit object writePath extends Writes[Path] {
      def writes(o: Path) = Json.toJson(o.path)
    }
  }
}

package object types extends Definitions with PlayBinders with SlickTypes with JsonTypes with Values
