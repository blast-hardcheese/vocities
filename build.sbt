name := """vocities"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  "org.webjars" % "jquery" % "2.1.3",
  "org.webjars" % "react" % "0.12.2",
  "com.typesafe.play" %% "play-slick" % "0.8.1",
  jdbc,
  anorm,
  cache,
  ws
)
