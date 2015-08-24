/* @flow weak */


var deepExtend = function (key, data, newData) {
    if (key === undefined || key === null || key.length === 0) {
        var res = _.extend({}, data, newData);
        for (var _key in newData) {
            if (newData[_key] === '__clear__') {
                delete res[_key];
            }
        }
        return res;
    } else {
        var splitKey = key.split('.');
        var subkey = splitKey[0];
        var restkey = _.drop(splitKey, 1).join('.');

        var extended = deepExtend(restkey, (data[subkey] || {}), newData);

        var res = null;

        if (Array.isArray(data)) {
            res = [].concat(data);
        } else {
            res = _.extend({}, data);
        }

        res[subkey] = extended;

        return res;
    }
};

var classSet = React.addons.classSet;

// Components
var ReadyComponent = function(timeout): any {
    if(timeout === null) { timeout = 250; }
    var readyProps = {timer: null};
    return {
        getInitialState: function() {
            return {
                ready: false,
            };
        },
        componentDidMount: function() {
            readyProps.timer = setTimeout((function() {
                readyProps.timer = null;
                this.setState({
                    ready: true,
                });
            }).bind(this), timeout);
        },
        componentWillUnmount: function() {
            clearTimeout(readyProps.timer);
        }
    };
}


var TinyMCEComponent = (function() {
    return {
        canStartEdit: function() {
            return tinymce.editors.length === 0;
        },

        buildTinyMCE: function(selector) {
            tinymce.init({
                selector: selector,
                plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table contextmenu paste"
                ],
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                relative_urls: false,
                remove_script_host: false,
            });

            return true;
        },
        destroyTinyMCE: function() {
            tinymce.EditorManager.execCommand('mceRemoveEditor',true, this.state.editorId);

            return true;
        }
    };
})();

// Widgets
var HTML5Audio = React.createClass({
    getDefaultProps: function() {
        return {
            controls: "controls",
            mp3: null,
            ogg: null,
        };
    },
    render: function() {
        var mp3 = this.props.mp3;
        var ogg = this.props.ogg;

        var mp3Source = mp3 ? <source src={mp3} type="audio/mp3" /> : null;
        var oggSource = ogg ? <source src={ogg} type="audio/ogg" /> : null;
        return (
            <audio style={this.props.style} controls={this.props.controls}>
                {mp3Source}
                {oggSource}
                Download as <a href={mp3}>MP3</a> or <a href={ogg}>OGG Vorbis</a>.
        </audio>
        );
    },
});

var YouTube = React.createClass({
    mixins: [Editable, Updatable],

    getDefaultProps: function() {
        return {
            width: undefined,
            height: undefined,
            frameborder: 0,
            allowFullscreen: "allowfullscreen",
            size: 'normal',
        };
    },
    save: function() {
        var url = $(this.refs.editBox.getDOMNode()).val();

        var strips = [
            [/^https?:\/\//, ''],
            [/^(www\.)?/, ''],
            [/^(youtube\.[^\/]+|youtu\.be)\//, ''],
            [/^watch\/*\?(?:.*&)?v=([^&]+)(&.*)?$/, '$1'],
            [/^embed\//, ''],
            [/\?.*$/, ''],
        ];

        var videoId = _.reduce(strips, function(memo, pair) {
            var re = pair[0];
            var repl = pair[1];
            var r = memo.replace(re, repl);
            return r;
        }, url);

        // Crude validation
        if (videoId.length === 11) {
            this.stopEdit();

            this.props.updated({
                videoId: videoId,
            });
        }
    },
    componentDidUpdate: function (prevProps, prevState) {
        var _this = this;
        if (this.state.editing && !prevState.editing) {
            var el = $(this.refs.wrapper.getDOMNode());

            var containerWidth = el.parentsUntil('.container').width();
        }
    },
    render: function() {
        var src = "//www.youtube.com/embed/" + this.props.videoId + "?html5=1";

        var editButton = null;

        if (this.state.editing) {
            editButton = (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                }}>
                    <div style={{
                        position: 'relative',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}>
                        <input ref="editBox" style={{
                            display: 'block',
                            width: '80%',
                            margin: '10px auto',
                        }} defaultValue={"https://youtu.be/" + this.props.videoId} />
                        <button ref="save" style={{
                            display: 'block',
                            margin: '10px auto',
                            padding: '10px 20px',
                            borderRadius: '10px',
                        }} onClick={this.save}>Save</button>
                    </div>
                </div>
            );
        } else {
            editButton = this.buildEditableButton();
        }

        return (
            <div className="widget w-youtube" ref="padding" style={{position: 'relative'}} data-size={this.props.size}>
                <div ref="wrapper" className="wrapper">
                    <iframe
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        src={src}
                        frameBorder={this.props.frameborder}
                        allowFullScreen={this.props.allowFullscreen}
                    />
                </div>
                {editButton}
            </div>
        );
    },
});

var InstanceCounter = function() {
    this.counter = 0;
    this.next = function() {
        var r = this.counter;
        this.counter += 1;
        return r;
    }
};

var ParagraphCounter = new InstanceCounter();

var Paragraph = React.createClass({
    mixins: [TinyMCEComponent, Editable, Updatable],

    propTypes: {
        content: React.PropTypes.string.isRequired,
        containerTag: React.PropTypes.string,
    },

    getDefaultProps: function() {
        return {
            containerTag: 'div',
        }
    },
    getInitialState: function() {
        var widgetClass = "paragraph-" + ParagraphCounter.next();
        return {
            widgetClass: widgetClass,
            editorId: 'tinymce-' + widgetClass,
        };
    },

    editStopped: function() {
        this.destroyTinyMCE();
        this.props.updated({
            content: $(this.refs.editText.getDOMNode()).val(),
        });
    },

    editStarted: function() {
        this.buildTinyMCE('#' + this.state.editorId);
    },

    render: function() {
        var r = null;

        if (this.state.editing) {
            r = (
                <div className={this.state.widgetClass}>
                    <textarea id={this.state.editorId} className="tinymce" ref="editText" defaultValue={this.props.content}></textarea>
                    <button onClick={this.stopEdit}>Save</button>
                </div>
            );
        } else {
            var subProps = _.extend({
                dangerouslySetInnerHTML: {__html: this.props.content},
            }, this.props);

            delete subProps['content'];

            if (this.props.editable) {
                subProps.onClick = this.startEdit;
            }

            r = React.createElement(this.props.containerTag, subProps);
        }

        return r;
    }
});

var TextField = React.createClass({
    mixins: [Editable, Updatable],

    propTypes: {
        content: React.PropTypes.string.isRequired,
        containerTag: React.PropTypes.string,
        editTag: React.PropTypes.string,
    },

    getDefaultProps: function() {
        return {
            editTag: 'input',
            containerTag: 'span',
            content: 'Unknown',
            editStyle: {},
        };
    },

    editStarted: function() {
        var node = this.refs.editText.getDOMNode();
        node.focus();
        node.value = node.value; // http://stackoverflow.com/questions/511088/use-javascript-to-place-cursor-at-end-of-text-in-text-input-element
    },

    editStopped: function() {
        this.props.updated({
            content: $(this.refs.editText.getDOMNode()).val(),
        });
    },

    keyDown: function (e) {
        if (e.key === 'Enter') {
            this.stopEdit();
        }
    },

    render: function() {
        var r = null;

        if (this.state.editing) {
            if (this.props.editTag === 'textarea') {
                r = React.createElement('div', {
                    style: {
                        width: '100%',
                    }
                }, [
                    React.createElement(this.props.editTag, {
                        key: '0',
                        ref: 'editText',
                        defaultValue: this.props.content,
                        style: this.props.editStyle,
                    }),
                    React.createElement('button', {
                        key: '1',
                        onClick: this.stopEdit,
                        style: {
                            float: 'right',
                        }
                    }, 'Save'),
                ]);
            } else {
                r = React.createElement(this.props.editTag, {
                    ref: 'editText',
                    defaultValue: this.props.content,
                    onKeyDown: this.keyDown,
                    style: this.props.editStyle,
                });
            }
        } else {
            var subProps = _.extend({}, this.props);

            if (this.props.editable === true) {
                subProps.onClick = this.startEdit;
            }

            delete subProps['content'];

            if (this.props.dangerouslySetInnerHTML === true) {
                r = React.createElement('div', {
                    style: {
                        position: 'relative',
                    }
                }, [
                    React.createElement(this.props.containerTag, _.extend({}, subProps, {
                        key: '0',
                        dangerouslySetInnerHTML: {__html: this.props.content}
                    })),

                    React.createElement('button', {
                        key: '1',
                        style: {
                            position: 'absolute',
                            top: 0,
                            left: 15,
                            marginBottom: 10,
                            transform: 'translateY(calc(-100% - 10px))',
                        },
                        onClick: this.startEdit,
                    }, 'Edit'),
                ]);
            } else {
                r = React.createElement(this.props.containerTag, subProps, this.props.content);
            }
        }

        return r;
    },
});

var HtmlEmbed = React.createClass({
    mixins: [Updatable, Editable, Utils],

    extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated],

    render: function () {
        return React.createElement(TextField, this.buildProps({
            dangerouslySetInnerHTML: true,
            editTag: 'textarea',
            containerTag: 'span',
            content: this.props.content,
            editStyle: {
                fontFamily: 'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace',
                fontSize: '1.4ex',
                width: '100%',
                height: '20ex',
            }
        }));
    },
});

var WidgetBuilder = function(extra) {
    var builtins = {
        //'soundcloud': SoundCloudPlayer,
        'paragraph': Paragraph,
        'youtube': YouTube,
        'header': HeaderBlock,
        'html': HtmlEmbed,
    };

    var widgets = _.extend({}, builtins, extra);

    return React.createClass({
        mixins: [Updatable, Editable, Utils],

        extendPropsFunctions: [Editable.extendPropsEditable, Updatable.autoUpdated],

        render: function() {
            var _this = this;
            var res = null;

            var widget = widgets[this.props.type];
            if (widget !== undefined) {
                res = React.createElement(widget, this.buildProps(this.props.data, 'data'));
            }

            return res;
        }
    });
};
