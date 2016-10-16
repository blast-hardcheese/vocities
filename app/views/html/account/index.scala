package views.account
import controllers.{ RenderModel, routes, WebJarAssets }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}
import models.UserModel

import scalatags.Text.all._

object index {
  def apply(vm: models.AccountViewModel): Frag = {
    html(
      head(
        tag("title")("VOCities - Account Home"),
        meta(httpEquiv:="content-type", content:="text/html; charset=utf-8"),
        meta(name:="viewport", content:="width=device-width, initial-scale=1"),

        link(rel:="shortcut icon", `type`:="image/png", href:=routes.Assets.at("images/favicon.png").toString),
        link(rel:="stylesheet", media:="screen", href:=routes.Assets.at("stylesheets/reset.css").toString),
        link(rel:="stylesheet", media:="screen", href:=routes.WebJarAssets.at(WebJarAssets.locate("bootstrap.css")).toString),
        link(rel:="stylesheet", media:="screen", href:=routes.WebJarAssets.at(WebJarAssets.locate("2.1.2/build/toastr.css")).toString),
        raw(s"""<!--[if lte IE 8]><script src="${routes.Assets.at("stylesheets/ie/html5shiv.js").toString}"></script><![endif]-->"""),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("jquery.min.js")).toString),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("react-with-addons.js")).toString),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("underscore.js")).toString),
        script(`type`:="text/javascript", src:=routes.WebJarAssets.at(WebJarAssets.locate("2.1.2/toastr.js")).toString)
      ),
      body(
        if (vm.accounts.isEmpty) {
          div(
            h3("No accounts found!"),
            p("If you believe this is an error, please feel free to", a(href:=securesocial.controllers.routes.LoginPage.logout.toString)("log out"), "and try again."),

            p("If you are not yet a member, please feel free to shoot an email over to", a(href:="mailto:blast@hardchee.se")("support@vocities.com"),"! We're not fully open for business quite yet, but if you're interested in a test drive, you can use the system for free until we launch!")
          )
        } else {
          List(
            div(`class`:="container accounts")(
              vm.accounts.map { account =>
                val domains = vm.domains.filter(_.account_id == account.id)
                List(
                  div(`class`:="row account")(
                    div(`class`:="col-xs-3 name")(account.name),
                    div(`class`:="col-xs-9 domains")(
                      domains.map { domain =>
                        val pages = vm.pages.filter(p => p.account_id == account.id && p.domain_id == domain.id)
                        List(
                          div(`class`:="row domain")(
                            div(`class`:="col-xs-5 name")(domain.domain),
                            div(`class`:="col-xs-7 pages")(
                              pages.map { page =>
                                div(`class`:="row page")(
                                  div(`class`:="col-xs-5 name")(page.title),
                                  div(`class`:="col-xs-5 path")(s"/${page.path.path}"),
                                  div(`class`:="col-xs-2 edit")(a(href:=routes.Users.edit(domain.domain, page.path).toString)("Edit"))
                                )
                              }
                            )
                          ),

                          if (pages.length < domain.maxPages) {
                            div(`class`:="row")(
                              form(`class`:="new-page-form", method:="POST", action:=routes.Users.newPage.toString)(
                                input(name:="domain_id", `type`:="hidden", value:=domain.id),
                                input(name:="account_id", `type`:="hidden", value:=account.id.id),
                                input(name:="path", `type`:="hidden", value:=""),
                                input(name:="name", placeholder:="Enter page name here"),
                                select(name:="template")(
                                  option(disabled:="disabled", selected:="selected")("Select a template"),
                                  option(value:="html5up_read_only")("html5up: Read Only"),
                                  option(value:="html5up_prologue")("html5up: Prologue")
                                ),
                                button(`type`:="submit")("Create Page")
                              )
                            )
                          } else {
                            div
                          }
                        )
                      }
                    )
                  ),

                  if (account.credits > domains.length) {
                    div(`class`:="row")(
                      form(`class`:="new-domain-form", method:="POST", action:=routes.Users.newDomain.toString)(
                        input(name:="account_id", `type`:="hidden", value:=account.id.id),
                        input(name:="domain", placeholder:="Enter FQDN here"),
                        select(name:="template")(
                          option(disabled:="disabled", selected:="selected")("Select a template"),
                          option(value:="html5up_read_only")("html5up: Read Only"),
                          option(value:="html5up_prologue")("html5up: Prologue")
                        ),
                        button(`type`:="submit")("Create Domain")
                      )
                    )
                  } else {
                    div
                  }
                )
              }
            ),
            script(`type`:="text/javascript")(raw("""
              |function postFactory(selector, options) {
              |  var options = _.extend({
              |    errorTitle: 'Error',
              |    parseValue: _.identity
              |  }, options);
              |
              |  return $(selector)
              |    .submit(function (event) {
              |      event.preventDefault();
              |      event.stopPropagation();
              |      var form = $(this);
              |
              |      console.info(form);
              |      var data = _.foldl(form.serializeArray(), function(a, o) {
              |        a[o.name] = options.parseValue(o.value, o.name);
              |
              |        return a;
              |      }, {});
              |
              |      $.ajax({
              |        url: form.attr('action'),
              |        data: JSON.stringify(data),
              |        type: 'POST',
              |        contentType: 'application/json',
              |        success: function(data){
              |          console.info('Success!', data);
              |          window.history.go();
              |        },
              |        error: function(jqxhr, status, err) {
              |          console.info('error:', status, err);
              |          toastr.error(status, options.errorTitle);
              |        }
              |      });
              |    });
              |}
              |
              |postFactory('.new-domain-form', {
              |  errorTitle: 'Error creating domain',
              |  parseValue: function (value, name) {
              |    var ret = value;
              |    if (name === 'account_id') {
              |      ret = Number.parseInt(ret);
              |    }
              |    return ret;
              |  }
              |});
              |
              |postFactory('.new-page-form', {
              |  errorTitle: 'Error creating page',
              |  parseValue: function (value, name) {
              |    var ret = value;
              |    if (_.contains(['account_id', 'domain_id'], name)) {
              |      ret = Number.parseInt(ret);
              |    }
              |    return ret;
              |  }
              |});
              |""".stripMargin))
          )
        }
      )
    )
  }
}
