name := """vocities"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.1"

resolvers += Resolver.sonatypeRepo("releases")

resolvers += "google-sedis-fix" at "http://pk11-scratch.googlecode.com/svn/trunk"

libraryDependencies ++= Seq(
  "org.webjars" % "jquery-ui" % "1.11.4",
  "org.webjars" % "tinymce-jquery" % "4.1.7-1",
  "com.typesafe.play.plugins" %% "play-plugins-redis" % "2.3.1",
  "org.webjars" % "font-awesome" % "4.3.0-1",
  "org.webjars" % "bootstrap" % "3.3.2-2",
  "com.github.tminglei" % "slick-pg_2.11" % "0.8.4",
  "ws.securesocial" % "securesocial_2.11" % "3.0-M3",
  "org.postgresql" % "postgresql" % "9.3-1103-jdbc41",
  "org.webjars" % "jquery" % "2.1.3",
  "org.webjars" % "react" % "0.12.2",
  "org.webjars" % "underscorejs" % "1.8.2",
  "com.typesafe.play" %% "play-slick" % "0.8.1",
  jdbc,
  anorm,
  cache,
  ws
)

ReactJsKeys.stripTypes := true

scalacOptions := Seq("-encoding", "UTF-8", "-Xlint", "-deprecation", "-unchecked", "-feature", "-language:reflectiveCalls")

TwirlKeys.templateImports += "play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}"

JsEngineKeys.engineType := JsEngineKeys.EngineType.Node
