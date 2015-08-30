var dynamicTplValues = function(selector) {
    var values = $(selector).text();
    return JSON.parse(values || '{}');
};

function TemplateManager(key, data) {
    var _this = this;

    data = _.extend({templateId: key}, data, {
        editable: Boolean(data.sandbox || data.saveUrl),
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

var Main = React.createClass({
    mixins: [Utils, Editable, Updatable],
    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated],

    componentDidMount: function() {
        var _this = this;
        this.setProps(_.extend({}, this.props, {
            updated: function(newProps) {
                _this.setProps(newProps);
            }
        }));
    },
    render: function() {
        var _this = this;

        var sections = _.map(this.props.sections, function(s, idx) {
            return React.createElement(Section, _this.extendProps('sections.' + idx));
        });
        return (
            <div id="main">
                {sections}
            </div>
        );
    },
});

var TemplateHelperMixin = {
        getDynamicTemplateContent: function() {
            var values = this.getCssValues();

            return this.getDynamicTemplate()(values);
        },
        getDefaultCssValues: function() {
            var cssBase = this.getDynamicTemplateValues().css.values;
            var selectedScheme = this.getSchemes()[this.getSchemeIdx()];

            return _.extend({}, cssBase, selectedScheme);
        },
        getCssValues: function() {
            return _.extend(this.getDefaultCssValues(), this.propAtPath('css.values'));
        },

        getDynamicTemplate: _.memoize(function() {
            return _.template($('#dynamic-tpl').text());
        }),
        getDynamicTemplateValues: _.memoize(function() {
            return dynamicTplValues('#dynamic-tpl-values');
        }),

        getSchemeIdx: function() {
            var defaultSchemeIdx = this.getDynamicTemplateValues().scheme || 0;
            return this.propAtPath('css.scheme') !== undefined ? this.propAtPath('css.scheme') : defaultSchemeIdx;
        },
        getSchemes: function() {
            return this.getDynamicTemplateValues().css.schemes;
        }
};

var ColorPicker = React.createClass({
    mixins: [Utils, Updatable, TemplateHelperMixin],

    getInitialState: function() {
        return {
            showColors: false,
            showCustom: false,
        };
    },

    update: function (idx) {
        this.deepUpdated('css', {
            scheme: idx
        });
    },
    select: function (idx) {
        this.update(idx);
    },

    colorChanged: function(key) {
        var _this = this;
        return function(event) {
            var data = {};
            data[key] = event.target.value;
            _this.deepUpdated('css.values', data);
        };
    },
    clearKey: function(key) {
        var _this = this;
        return function() {
            var values = _.extend({}, _this.props.css.values);
            values[key] = '__clear__';
            _this.deepUpdated('css.values', values);
        };
    },

    toggleColors: Utils.buildToggleState('showColors'),
    toggleCustom: Utils.buildToggleState('showCustom'),

    render: function() {
        // If we can't save and we're not in a sandbox, don't even show the save buttons
        if (!this.props.saveUrl && !this.props.sandbox) return null;
        if (typeof $ === 'undefined' || $('style#dynamic').length === 0) return null;

        var _this = this;

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

        var choices = this.getSchemes().map(function(o, idx) {
            return (
                <div className='color-set' style={{
                    overflow: 'auto',
                }} key={idx} onClick={function() { return _this.select(idx); }}>
                    {build(o.primary_bg)}
                    {build(o.primary_fg)}
                    {build(o.secondary_fg)}
                    {build(o.accent)}
                </div>
            );
        });

        var showCustom: boolean = this.state.showCustom;

        var toggleCustomLabel: string = (showCustom ? 'Hide' : 'Show') + ' Color Customizer';
        choices.push(<button style={{
            display: 'block',
        }} onClick={this.toggleCustom}>{toggleCustomLabel}</button>);

        var defaultValues = this.getDefaultCssValues();
        choices.push(<div className='color-customizer' style={{
            border: '1px solid black',
            overflow: 'auto',
            display: showCustom ? 'block' : 'none',
        }} key={-1}>
            {_.map(this.getCssValues(), function(value, key) {
                return <div key={key} style={{
                    margin: '4px 0',
                    lineHeight: '20px',
                }}>
                    <span style={{
                        color: '#222',
                        marginRight: '0.5ex',
                        marginLeft: '0.5ex',
                    }}>{key}:</span>
                    <input
                        style={{
                            float: 'right',
                            width: 20,
                            height: 20,
                            border: 'none',
                            padding: 0,
                            margin: 0,
                            marginRight: '1ex'
                        }}
                        type="color"
                        value={value}
                        onChange={_this.colorChanged(key)}
                    />
                    {(defaultValues[key] !== value) ? <i className="fa fa-trash-o" style={{float: 'right', marginRight: 5}} onClick={_this.clearKey(key)} /> : null}
                </div>;
            })}
        </div>);

        var showColors: boolean = this.state.showColors;
        var toggleColorLabel = (showColors ? 'Hide' : 'Show') + ' Color Schemes';
        return (
            <div className='color-picker' style={{float: 'left'}}>
                <button style={{
                    display: 'block',
                }} onClick={this.toggleColors}>{toggleColorLabel}</button>
                {showColors ? choices : []}
            </div>
        );
    },
});

var EditButtons = React.createClass({
    mixins: [Editable, Updatable],

    setEditable: function (newState) {
        this.props.updated({
            editable: newState,
        });
    },

    performSave: function () {
        var pageData = _.extend({}, this.props);

        var templateId = pageData.templateId;

        delete pageData.editable;
        delete pageData.saveUrl;
        delete pageData.title;
        delete pageData.updated;
        delete pageData.templateId;

        var title = this.props.title;

        var data = {
            title: title,
            data: pageData,
        };

        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify(data),
            method: 'PUT',
            url: this.props.saveUrl + '?templateId=' + templateId,
            error: function() {
                console.error('Unable to save');
                toastr.error('Unable to save');
            },
            success: function() {
                console.info('Success');
                toastr.success('Saved!');
            }
        });
    },

    render: function() {
        // If we can't save and we're not in a sandbox, don't even show the save buttons
        if (!this.props.saveUrl && !this.props.sandbox) return null;

        var toggleEditButton = null;
        var saveButton = null;

        var buttonStyle = {
            display: 'block',
        };

        if (this.props.editable) {
            toggleEditButton = <button style={buttonStyle} onClick={this.setEditable.bind(this, false)}>Disable Editing</button>;
        } else {
            toggleEditButton = <button style={buttonStyle} onClick={this.setEditable.bind(this, true)}>Enable Editing</button>;
        }

        if (this.props.saveUrl) {
            saveButton = <button style={buttonStyle} onClick={this.performSave}>Save</button>;
        }

        return <div style={{float: 'left'}}>
            {toggleEditButton}
            {saveButton}
        </div>;
    }
});

var AdminButtons = React.createClass({
    render: function() {
        var editButtons = React.createElement(EditButtons, this.props)
        var colorPicker = React.createElement(ColorPicker, this.props);

        return <div style={{
            position: 'fixed',
            top: 5,
            left: 5,
            zIndex: 1
        }}>
            {editButtons}
            {colorPicker}
        </div>;
    }
});

var AddWidgetPopup = React.createClass({
    availableTypes: {
        'paragraph': {
            'class': Paragraph,
            'name': 'Paragraph',
            'default': {
                content: '<p>Lorem ipsum sit dolor amet</p>',
            }
        },

        'youtube': {
            'class': YouTube,
            'name': 'YouTube Video',
            'default': {
                videoId: 'vSjX02FIZCk',
            }
        },

        'header': {
            'class': HeaderBlock,
            'name': 'Section Header',
            'default': {
                title: 'Header Text',
                text: '<p>Lorem ipsum sit dolor amet</p>',
                subtitle: '<p>Nunc convallis dictum consectetur</p>',
            }
        },

        'html': {
            'class': HtmlEmbed,
            'name': 'Raw HTML',
            'default': {
                content: '<iframe src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d59324099.36051832!2d-43.36801133170003!3d24.834608821223174!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1437466329052" height="450" frameborder="0" style="border:0; width: 100%;" allowfullscreen></iframe>',
            }
        }
    },

    addSection: function() {
        var sectionName = this.refs.sectionName.getDOMNode();
        var sectionType = this.refs.sectionType.getDOMNode();
        var title = sectionName.value;
        var type = sectionType.value;

        sectionName.value = '';
        sectionType.value = '';

        var tag = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        var section = {
            tag: tag,
            title: title,
            content: {
                type: type,
                data: this.availableTypes[type]['default'],
            }
        };

        var data = _.extend({}, this.props, {
            sections: (this.props.sections || []).concat([section]),
        });

        this.props.updated(data);

        $('#add-popup').hide();
    },

    cancel: function() {
        $('#add-popup').hide();
    },

    render: function() {
        // If we can't save and we're not in a sandbox, don't even show the save buttons
        if (!this.props.saveUrl && !this.props.sandbox) return null;

        var _this = this;

        var options = _.map(Object.keys(this.availableTypes), function(kind) {
            return <option key={kind} value={kind}>{_this.availableTypes[kind].name}</option>;
        });

        return <div className="popup">
            <div className="close" onClick={this.cancel}>
                <i className="fa fa-close"></i>
            </div>
            <h2>Add Section</h2>
            <input ref="sectionName" className="name" placeholder="Enter section name here" />

            <span className="styled-select">
                <i className="arrow fa fa-chevron-down"></i>
                <select ref="sectionType">
                    <option value="" disabled>Select widget type</option>
                    {options}
                </select>
            </span>

            <div className="buttons">
                <button onClick={this.addSection}>Add Section</button>
            </div>
        </div>;
    },
});

var Metadata = React.createClass({
    metadata: function() {
        return this.props.metadata || {};
    },

    googleAnalytics: function() {
        var tpl = _.template([
            "<script type='text/javascript'>",
            "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){",
            "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),",
            "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)",
            "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');",

            "ga('create', '<%= trackingId %>', 'auto');",
            "ga('send', 'pageview');",
            "</script>"
        ].join('\n'));

        return this.metadata().ga ? tpl(this.metadata().ga) : '';
    },

    customCode: function() {
        return this.metadata().custom ? this.metadata().custom : '';
    },

    render: function() {
        var chunks = [
            this.googleAnalytics(),
            this.customCode(),
        ];
        return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{__html: chunks.join('\n\n')}} />;
    },
});

var sharedTemplateRenderers = [
    function(vm) {
        return _.extend({
            props: null,
            setProps: function(newProps) {
                var _props = _.extend({css: {}}, newProps);
                this.props = _props;

                var dynamicTarget = $('style#dynamic');
                if (dynamicTarget.length !== 0) {
                    dynamicTarget.text(this.getDynamicTemplateContent());
                }
            },
        }, Utils, TemplateHelperMixin);
    },
    function(vm) {
        var target = $('html');
        if (target.length === 0) { // If we're not in a DOM, bail
            console.info('Can\'t find body, bailing');
            return {
                setProps: function() {},
            };
        }

        target
            .off('dragenter.DnD')
            .on('dragenter.DnD', function(e) {
                e.preventDefault();

                EventActions.trigger('_dragStatus', 'enter');

                return false;
            });

        target
            .off('dragover.DnD')
            .on('dragover.DnD', function(e) {
                e.preventDefault();

                EventActions.trigger('_dragStatus', 'over');
            });

        target
            .off('dragleave.DnD')
            .on('dragleave.DnD', function(e) {
                e.preventDefault();

                EventActions.trigger('_dragStatus', 'leave');

                return false;
            });

        target
            .off('drop.DnD')
            .on('drop.DnD', function(e) {
                e.preventDefault();

                // Workaround for drop targets disappearing before event fires
                setTimeout(function() {
                    EventActions.trigger('_dragStatus', 'drop');
                }, 1);
            });

        return {
            setProps: function() {},
        };
    },
];

var renderComponent = function(sel, data, clazz) {
    var factory = React.createFactory(clazz)(data);
    var target = $(sel)[0];
    var react = React.render(factory, target);
    react.setProps(data);
    return react;
};

var buildClassRenderers = function (classes) {
    var filteredClasses = _.extend({}, classes);
    delete filteredClasses['#metadata'];
    return _.map(filteredClasses, function(reactClass, id) {
        return function(vm) {
            return renderComponent(id, vm, reactClass);
        };
    });
};

var Templates = {
    "html5up_read_only": (function(self) {
        var classes = {
            '#header-wrapper': Sidebar,
            '#main-wrapper': Main,
            '#footer': Footer,
            '#admin-buttons': AdminButtons,
            '#add-popup': AddWidgetPopup,
            '#metadata': Metadata,
        };

        var sequences = buildClassRenderers(classes).concat(sharedTemplateRenderers);

        self.render = renderComponent;
        self.sequences = sequences;
        self.classes = classes;

        return self;
    })({}),

    "html5up_prologue": (function(self) {
        var classes = {
            '#header-wrapper': Sidebar,
            '#main-wrapper': Main,
            '#footer': Footer,
            '#admin-buttons': AdminButtons,
            '#add-popup': AddWidgetPopup,
            '#metadata': Metadata,
        };

        var sequences = buildClassRenderers(classes).concat(sharedTemplateRenderers);

        self.render = renderComponent;
        self.sequences = sequences;
        self.classes = classes;

        return self;
    })({}),

    "plain": (function(self) {
        var classes = {
            '#sidebar': Sidebar,
            '#main-content': Main,
            '#footer': Footer,
            '#admin-buttons': AdminButtons,
            '#add-popup': AddWidgetPopup,
            '#metadata': Metadata,
        };

        var sequences = buildClassRenderers(classes).concat(sharedTemplateRenderers);

        self.render = renderComponent;
        self.sequences = sequences;
        self.classes = classes;

        return self;
    })({})
}
