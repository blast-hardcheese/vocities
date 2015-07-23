name := """vocities"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.1"

resolvers += Resolver.sonatypeRepo("releases")

resolvers += "google-sedis-fix" at "http://pk11-scratch.googlecode.com/svn/trunk"

libraryDependencies ++= Seq(
  "org.webjars" %% "webjars-play" % "2.3.0-3",
  "org.webjars" % "font-awesome" % "4.3.0-1",
  "org.webjars" % "tinymce-jquery" % "4.1.7-1",
  "org.webjars.bower" % "bootstrap" % "3.3.4",
  "org.webjars.bower" % "jquery" % "2.1.3",
  "org.webjars.bower" % "jquery-waypoints" % "3.1.1",
  "org.webjars.bower" % "reflux" % "0.2.7",
  "org.webjars.bower" % "underscore" % "1.8.3",
  "com.typesafe.play.plugins" %% "play-plugins-redis" % "2.3.1",
  "com.github.tminglei" % "slick-pg_2.11" % "0.8.4",
  "ws.securesocial" % "securesocial_2.11" % "3.0-M3",
  "org.postgresql" % "postgresql" % "9.3-1103-jdbc41",
  "org.webjars" % "react" % "0.12.2",
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

TypescriptKeys.noImplicitAny := true

includeFilter in (Assets, LessKeys.less) := "*.less"
