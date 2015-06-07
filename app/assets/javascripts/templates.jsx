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
            "primary_bg": "#BD4ACA",
            "primary_fg": "#EDD1F1",
            "secondary": "#DEB6E9",
            "accent": "#C85CCF",
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
        // If we can't save and we're not in a sandbox, don't even show the save buttons
        if (!this.props.saveUrl && !this.props.sandbox) return null;

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

var EditButtons = React.createClass({
    mixins: [Editable, Updatable],

    setEditable: function (newState) {
        this.props.updated({
            editable: newState,
        });
    },

    performSave: function () {
        console.info('Save stub');
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
            dataType: 'json',
            method: 'PUT',
            url: this.props.saveUrl + '?templateId=' + templateId,
        });
    },

    render: function() {
        // If we can't save and we're not in a sandbox, don't even show the save buttons
        if (!this.props.saveUrl && !this.props.sandbox) return null;

        var toggleEditButton = null;
        var saveButton = null;

        var style = {
            position: 'fixed',
            top: 15,
            left: 97,
            zIndex: 1,
        };

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

        return <div style={style}>
            {toggleEditButton}
            {saveButton}
        </div>;
    }
});

var AddWidgetPopup = React.createClass({
    availableTypes: {
        'paragraph': {
            'class': Paragraph,
            'name': 'Paragraph',
        },

        'youtube': {
            'class': YouTube,
            'name': 'YouTube Video',
        },

        'header': {
            'class': HeaderBlock,
            'name': 'Section Header',
        },
    },

    addSection: function() {
        var title = this.refs.sectionName.getDOMNode().value;
        var type = this.refs.sectionType.getDOMNode().value;

        var tag = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        var section = {
            tag: tag,
            title: title,
            content: {
                type: type,
            }
        };

        switch(type) {
            case 'paragraph':
                section.content.data = {
                    content: '<p>Lorem ipsum sit dolor amet</p>',
                };
                break;
            case 'youtube':
                section.content.data = {
                    videoId: 'vSjX02FIZCk',
                };
                break;
            case 'header':
                section.content.data = {
                    title: title,
                    text: '<p>Lorem ipsum sit dolor amet</p>',
                    subtitle: '<p>Nunc convallis dictum consectetur</p>',
                };
                break;
        }

        var data = _.extend({}, this.props, {
            sections: _.flatten([this.props.sections || [], [section]]),
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
            <select ref="sectionType">
                <option value="" disabled>Select widget type</option>
                {options}
            </select>

            <button onClick={this.addSection}>Add Section</button>
        </div>;
    },
});


var sharedTemplateRenderers = [
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
    function(vm) {
        var target = $('html');
        if (target.length === 0) { // If we're not in a DOM, bail
            console.info('Can\'t find body, bailing');
            return {
                setProps: function() {},
            };
        }

        target.on('dragenter', function(e) {
            e.preventDefault();

            EventActions.trigger('_dragStatus', 'enter');

            return false;
        });

        target.on('dragover', function(e) {
            e.preventDefault();

            EventActions.trigger('_dragStatus', 'over');
        });

        target.on('dragleave', function(e) {
            e.preventDefault();

            EventActions.trigger('_dragStatus', 'leave');

            return false;
        });

        target.on('drop', function(e) {
            e.preventDefault();

            // Workaround for drop targets disappearing before event fires
            setTimeout(function() {
                EventActions.trigger('_dragStatus', 'drop');
            }, 1);

            console.info('Hey!', e.originalEvent.target);
        });

        return {
            setProps: function() {},
        };
    },
];

var Templates = {
    "html5up_read_only": (function(self) {
        var render = function(sel, data, clazz) {
            var factory = React.createFactory(clazz)(data);
            var target = $(sel)[0];
            var react = React.render(factory, target);
            react.setProps(data);
            return react;
        };

        var classes = {
            '#header-wrapper': Sidebar,
            '#main-wrapper': Main,
            '#footer': Footer,
            '#color-picker': ColorPicker,
            '#edit-buttons': EditButtons,
            '#add-popup': AddWidgetPopup,
        };

        var classRenderers = _.map(classes, function(reactClass, id) {
            return function(vm) {
                return render(id, vm, reactClass);
            };
        })

        var sequences = classRenderers.concat(sharedTemplateRenderers);

        self.render = render;
        self.sequences = sequences;
        self.classes = classes;

        return self;
    })({}),

    "html5up_prologue": (function(self) {
        var render = function(sel, data, clazz) {
            var factory = React.createFactory(clazz)(data);
            var target = $(sel)[0];
            var react = React.render(factory, target);
            react.setProps(data);
            return react;
        };

        var classes = {
            '#header-wrapper': Sidebar,
            '#main-wrapper': Main,
            '#footer': Footer,
            '#edit-buttons': EditButtons,
            '#add-popup': AddWidgetPopup,
        };

        var classRenderers = _.map(classes, function(reactClass, id) {
            return function(vm) {
                return render(id, vm, reactClass);
            };
        })

        var sequences = classRenderers.concat(sharedTemplateRenderers);

        self.render = render;
        self.sequences = sequences;
        self.classes = classes;

        return self;
    })({})
}
