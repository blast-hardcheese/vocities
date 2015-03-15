name := """vocities"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.1"

resolvers += Resolver.sonatypeRepo("releases")

libraryDependencies ++= Seq(
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
