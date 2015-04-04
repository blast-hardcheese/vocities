function TemplateManager(key, data) {
    var _this = this;

    data = _.extend({}, data, {
        editable: true,
        updated: function (newData) {
            _this.refresh(newData);
        }
    });

    var initComponents = function(key, data) {
        return _.map(Templates[key].sequences, function(func) {
            var r = func(data);
            r.setProps(data);
            return r;
        });
    };

    var refreshComponents = function(components, data) {
        _.map(components, function(c) {
            return c.setProps(data);
        });
    };

    this.components = initComponents(key, data);
    this.refresh = function(data) {
        console.info('refresh:', data);
        refreshComponents(_this.components, data);
    };
}

var Templates = {
    "html5up_read_only": (function(self) {
        var Section = React.createClass({
            getDefaultProps: function() {
                return {
                    updated: function(newProps) {
                        console.error('Section tried to update:', newProps);
                    }
                }
            },
            render: function() {
                var data = _.extend({}, {
                    updated: (function(newProps) {
                        this.props.updated({
                            tag: this.props.tag,
                            title: this.props.title,
                            content: newProps,
                        });
                    }).bind(this)
                }, this.props.content);
                return (
                    <section id={this.props.tag}>
                        <div className="container">
                            {React.createElement(WidgetBuilder(), data)}
                        </div>
                    </section>
                );
            }
        });

        var Main = React.createClass({
            getDefaultProps: function() {
                return {
                    updated: function(newProps) {
                        console.error('Main tried to update:', newProps);
                    }
                }
            },
            componentDidMount: function() {
                var _this = this;
                this.setProps(_.extend({}, this.props, {
                    updated: function(newProps) {
                        _this.setProps(newProps);
                    }
                }));
            },
            sectionUpdated: function(data, idx) {
                var newSections = [].concat(this.props.sections);
                if (data !== null) {
                    newSections[idx] = data;
                } else {
                    newSections.splice(idx, 1);
                }

                var newProps = _.extend({}, this.props, {
                    sections: newSections,
                });

                this.props.updated(newProps);
            },
            render: function() {
                var _this = this;

                var sections = _.map(this.props.sections, function(s, idx) {
                    var updated = function(newProps) {
                        _this.sectionUpdated(newProps, idx);
                    };

                    return <Section title={s.title} key={s.tag} tag={s.tag} content={s.content} updated={updated} />
                });
                return (
                    <div id="main">
                        {sections}
                    </div>
                );
            },
        });

        var Footer = React.createClass({
            copyrightUpdated: function (newProps) {
                this.props.updated(_.extend({}, this.props, {
                    footer: _.extend({}, this.props.footer, {
                        copyright: newProps.content,
                    }),
                }));
            },
            render: function() {
                var copyright = this.props.footer.copyright;

                return (
                    <div className="container">
                        <ul className="copyright">
                            <li>&copy; <TextField content={copyright} updated={this.copyrightUpdated} />. All rights reserved.</li>
                            <li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
                        </ul>
                    </div>
                );
            },
        });

        var ColorPicker = React.createClass({
            getSchemes: function () {
                var dynamicCssValues = JSON.parse($('#dynamic-tpl-values').text());
                return dynamicCssValues['schemes'];
            },
            schemes: [
                {
                    "primary_bg": "#4acaa8",
                    "primary_fg": "#d1f1e9",
                    "secondary": "#b6e9dc",
                    "accent": "#5ccfb0",
                },
                {
                    "primary_bg": "purple",
                    "primary_fg": "blue",
                    "secondary": "red",
                    "accent": "green",
                },
            ],
            update: function (data) {
                this.props.updated(
                    deepExtend("css.values", this.props, {
                        "primary_bg": data.primary_bg,
                        "primary_color": data.primary_fg,
                        "hilight_color": data.secondary,
                        "accent_color": data.accent,
                        "nav_active_bg": "white",
                        "nav_active_color": data.primary_bg,
                    }));
            },
            select: function (idx) {
                this.update(this.schemes[idx]);
            },
            render: function() {
                var _this = this;

                var choices = this.schemes.map(function(o, idx) {
                    var build = function (color) {
                        return (
                            <div style={{
                                width: 20,
                                height: 20,
                                float: 'left',
                                backgroundColor: color,
                            }} />
                        );
                    };

                    return (
                        <div style={{
                            marginTop: 5,
                            marginRight: 5,
                            border: '1px solid black',
                            overflow: 'auto',
                        }} key={idx} onClick={function() { return _this.select(idx); }}>
                            {build(o.primary_bg)}
                            {build(o.primary_fg)}
                            {build(o.secondary)}
                            {build(o.accent)}
                        </div>
                    );
                });

                return (
                    <div style={{
                        position: 'fixed',
                        top: 10,
                        left: 10,
                        zIndex: 1,
                    }}>
                        {choices}
                    </div>
                );
            },
        });

        var render = function(sel, data, clazz) {
            var factory = React.createFactory(clazz)(data);
            var target = $(sel)[0];
            var react = React.render(factory, target);
            react.setProps(data);
            return react;
        };

        var sequences = [
            function(vm) {
                return render('#header-wrapper', vm, Sidebar);
            },

            function(vm) {
                return render('#main-wrapper', vm, Main);
            },

            function(vm) {
                return render('#footer', vm, Footer);
            },

            function(vm) {
                return render('#color-picker', vm, ColorPicker);
            },

            function(vm) {
                var dynamicCss = _.template($('#dynamic-tpl').text());
                var dynamicCssValues = JSON.parse($('#dynamic-tpl-values').text());

                var target = $('style#dynamic')

                var setDynamicTemplate = function(template, userValues) {
                    var values = _.extend({}, dynamicCssValues, userValues);
                    var overrides = template === undefined ? "" : (_.template(template)(values));
                    target.text(dynamicCss(values) + overrides);
                };

                return {
                    setProps: function(newProps) {
                        var _props = _.extend({}, {css:{}}, newProps)
                        setDynamicTemplate(_props.css.template, _props.css.values);
                    },
                };
            },
        ];

        self.render = render;
        self.sequences = sequences;
        self.classes = {
            '#header-wrapper': Sidebar,
            '#main-wrapper': Main,
            '#footer': Footer,
            '#color-picker': ColorPicker,
        };

        return self;
    })({})
}
