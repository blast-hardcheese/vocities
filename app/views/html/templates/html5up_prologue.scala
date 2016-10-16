package views.templates
import controllers.{ RenderModel, routes }
import play.api.libs.json.{Json, JsValue, JsObject, JsNull, JsString}

import scalatags.Text.all._

object html5up_prologue {
  def apply(engine: javax.script.ScriptEngine, saveUrl: Option[String])(renderModel: RenderModel): Frag = {

    val pageData = renderModel.pageData
    val templateId = "html5up_prologue"

    val templateIdJson = JsString(templateId)

    def sharedCssPath(path: String) = routes.Assets.at("stylesheets/html5up/" + path).toString
    def cssPath(path: String) = routes.Assets.at(s"stylesheets/$templateId/" + path).toString

    val header: List[Frag] = List(
      meta(httpEquiv:="content-type", content:="text/html; charset=utf-8"),
      meta(name:="description", content:=""),
      meta(name:="keywords", content:=""),

      raw(s"""<!--[if lte IE 8]><link rel="stylesheet" href="${cssPath("ie/v8.css")}" /><![endif]-->"""),

      tag("style")(`type`:="text/css")("""
        |#skel-layers-hiddenWrapper {
        |    display: none; // Why is this necessary?!
        |}""".stripMargin),

      tag("style")(id:="dynamic-tpl", `type`:="text/underscore")("")
    )

    val afterBody: List[Frag] = List(
      script(id:="dynamic-tpl-values", `type`:="text/json")(raw("""
      |{
      |  "css": {
      |    "scheme": 0,
      |    "schemes": [
      |      {}
      |    ]
      |  }
      |}
      |""".stripMargin)),
      script(`type`:="text/javascript")(raw(s"""
        |var PageData = ${utils.views.encodePageData(saveUrl, renderModel.title, renderModel.pageData).render};
        |window.CloudinarySettings = ${utils.views.cloudinaryData.render};
        |
        |jQuery(function($$) {
        |
        |    new TemplateManager(${templateIdJson}, PageData);
        |
        |    skel.init({
        |            reset: 'full',
        |            breakpoints: {
        |                    'global':   { range: '*',        href: '${cssPath("style.css")}', containers: 1400, grid: { gutters: 40 }, viewport: { scalable: false } },
        |                    'wide':     { range: '961-1880', href: '${cssPath("style-wide.css")}', containers: 1200, grid: { gutters: 40 } },
        |                    'normal':   { range: '961-1620', href: '${cssPath("style-normal.css")}', containers: 960, grid: { gutters: 40 } },
        |                    'narrow':   { range: '961-1320', href: '${cssPath("style-narrow.css")}', containers: '100%', grid: { gutters: 20 } },
        |                    'narrower': { range: '-960',     href: '${cssPath("style-narrower.css")}', containers: '100%', grid: { gutters: 20 } },
        |                    'mobile':   { range: '-736',     href: '${cssPath("style-mobile.css")}', containers: '100%!', grid: { collapse: true } }
        |            },
        |            plugins: {
        |                    layers: {
        |                            config: {
        |                                    mode: 'transform'
        |                            },
        |                            sidePanel: {
        |                                    hidden: true,
        |                                    breakpoints: 'narrower',
        |                                    position: 'top-left',
        |                                    side: 'left',
        |                                    animation: 'pushX',
        |                                    width: 240,
        |                                    height: '100%',
        |                                    clickToHide: true,
        |                                    html: '<div data-action="moveElement" data-args="header"></div>',
        |                                    orientation: 'vertical'
        |                            },
        |                            sidePanelToggle: {
        |                                    breakpoints: 'narrower',
        |                                    position: 'top-left',
        |                                    side: 'top',
        |                                    height: '4em',
        |                                    width: '5em',
        |                                    html: '<div data-action="toggleLayer" data-args="sidePanel" class="toggle"></div>'
        |                            }
        |                    }
        |            }
        |    });
        |
        |    // Forms (IE<10).
        |        var $$form = $$('form');
        |        if ($$form.length > 0) {
        |
        |            $$form.find('.form-button-submit')
        |                .on('click', function() {
        |                    $$(this).parents('form').submit();
        |                    return false;
        |                });
        |
        |            if (skel.vars.IEVersion < 10) {
        |                $$.fn.n33_formerize=function(){var _fakes=new Array(),_form = $$(this);_form.find('input[type=text],textarea').each(function() { var e = $$(this); if (e.val() == '' || e.val() == e.attr('placeholder')) { e.addClass('formerize-placeholder'); e.val(e.attr('placeholder')); } }).blur(function() { var e = $$(this); if (e.attr('name').match(/_fakeformerizefield$$/)) return; if (e.val() == '') { e.addClass('formerize-placeholder'); e.val(e.attr('placeholder')); } }).focus(function() { var e = $$(this); if (e.attr('name').match(/_fakeformerizefield$$/)) return; if (e.val() == e.attr('placeholder')) { e.removeClass('formerize-placeholder'); e.val(''); } }); _form.find('input[type=password]').each(function() { var e = $$(this); var x = $$($$('<div>').append(e.clone()).remove().html().replace(/type="password"/i, 'type="text"').replace(/type=password/i, 'type=text')); if (e.attr('id') != '') x.attr('id', e.attr('id') + '_fakeformerizefield'); if (e.attr('name') != '') x.attr('name', e.attr('name') + '_fakeformerizefield'); x.addClass('formerize-placeholder').val(x.attr('placeholder')).insertAfter(e); if (e.val() == '') e.hide(); else x.hide(); e.blur(function(event) { event.preventDefault(); var e = $$(this); var x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]'); if (e.val() == '') { e.hide(); x.show(); } }); x.focus(function(event) { event.preventDefault(); var x = $$(this); var e = x.parent().find('input[name=' + x.attr('name').replace('_fakeformerizefield', '') + ']'); x.hide(); e.show().focus(); }); x.keypress(function(event) { event.preventDefault(); x.val(''); }); });  _form.submit(function() { $$(this).find('input[type=text],input[type=password],textarea').each(function(event) { var e = $$(this); if (e.attr('name').match(/_fakeformerizefield$$/)) e.attr('name', ''); if (e.val() == e.attr('placeholder')) { e.removeClass('formerize-placeholder'); e.val(''); } }); }).bind("reset", function(event) { event.preventDefault(); $$(this).find('select').val($$('option:first').val()); $$(this).find('input,textarea').each(function() { var e = $$(this); var x; e.removeClass('formerize-placeholder'); switch (this.type) { case 'submit': case 'reset': break; case 'password': e.val(e.attr('defaultValue')); x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]'); if (e.val() == '') { e.hide(); x.show(); } else { e.show(); x.hide(); } break; case 'checkbox': case 'radio': e.attr('checked', e.attr('defaultValue')); break; case 'text': case 'textarea': e.val(e.attr('defaultValue')); if (e.val() == '') { e.addClass('formerize-placeholder'); e.val(e.attr('placeholder')); } break; default: e.val(e.attr('defaultValue')); break; } }); window.setTimeout(function() { for (x in _fakes) _fakes[x].trigger('formerize_sync'); }, 10); }); return _form; };
        |                $$form.n33_formerize();
        |            }
        |        }
        |});
        |""".stripMargin)),

        raw(utils.views.createElement(templateIdJson, "#metadata", pageData)(engine))
      )

    main(renderModel.title)(header, afterBody)(List(
      div(id:="add-popup")(
          raw(utils.views.createElement(templateIdJson, "#add-popup", pageData)(engine))
      ),

      div(id:="wrapper")(
        div(id:="header-wrapper", `class`:="skel-layers-fixed")(
          raw(utils.views.createElement(templateIdJson, "#header-wrapper", pageData)(engine))
        ),

        div(id:="main-wrapper")(
          raw(utils.views.createElement(templateIdJson, "#main-wrapper", pageData)(engine))
        ),

        section(id:="footer")(
          raw(utils.views.createElement(templateIdJson, "#footer", pageData)(engine))
        ),

        div(id:="admin-buttons")(
          raw(utils.views.createElement(templateIdJson, "#admin-buttons", pageData)(engine))
        )
      ),

      tag("style")(id:="dynamic", `type`:="text/css")
    ))
  }
}
