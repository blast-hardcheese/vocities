/* @flow weak */


var deepExtend = function (key, data, newData) {
    if (key === undefined || key === null || key.length === 0) {
        return _.extend({}, data, newData);
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
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
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

var RootContainer = React.createClass({
    render: function() {
        var root_styles = {
            'margin': '0',
            'border': '0',
            'width': '100%',
            'height': '100%',
            'backgroundColor': this.props.bgColor || 'green',
        };
        return <div className="container" style={ root_styles }>{this.props.children}</div>;
    },
});

var ContactInfo = React.createClass({
    getDefaultProps: function() {
        return {
            style: "compact",

            label: null,

            phone: null,
            email: null,
            skype: null,
            isdn: null,
            sourceConnect: null,
            locale: null,

            twitter: null,
            facebook: null,
        }
    },
    render: function() {
        var r = null;

        var label = this.props.label ? <h2>{this.props.label}</h2> : null;

        var phone = this.props.phone ? <p>phone <a href={"tel://" + this.props.phone.replace(/[^\d+]/g, '')}>{this.props.phone}</a></p> : null;
        var email = this.props.email ? <p>email <a href={"mailto:" + this.props.email}>{this.props.email}</a></p> : null;
        var skype = this.props.skype ? <p>skype <a href={"skype:" + this.props.skype + "?call"}>{this.props.skype}</a></p> : null;
        var isdn = this.props.isdn ? <p>isdn {this.props.isdn}</p> : null;
        var sourceConnect = this.props.sourceConnect ? <p>source connect {this.props.sourceConnect}</p> : null;

        var twitter = this.props.twitter ? <a href={"https://twitter.com/#!/" + this.props.twitter} target="_blank">Twitter</a> : null;
        var facebook = this.props.facebook ? <a href={this.props.facebook} target="_blank">Facebook</a> : this.props.facebook;
        var social = [twitter, facebook].filter(function(e) { return e !== null; }) || null;
        if(social !== null) {
            social = <p>contact {social[0]}{social[1]}{social[2]}</p>
        }

        var locale = this.props.locale ? <p>locale {this.props.locale}</p> : null;

        if(this.props.style == "compact") {
            r = <div>
                {label}
                {phone}
                {isdn}
                {sourceConnect}
                {email}
                {skype}
                {social}
                {locale}
            </div>
        }

        return r;
    },
});

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

var SlideOutDiv = React.createClass({
    mixins: [ReadyComponent()],

    getDefaultProps: function() {
        return {
            handleText: "Drawer",
            open: false,
            handleStyle: null,
            drawerStyle: null,
        }
    },

    getInitialState: function() {
        return {
            open: true,
        };
    },

    componentDidMount: function() {
        this.setState({
            open: this.props.open,
        });
    },

    toggleOpen: function(e) {
        e.stopPropagation();
        this.setState({
            open: !this.state.open,
        });
    },

    render: function() {
        var drawerHeight = this.refs.drawer === undefined ? 0 : this.refs.drawer.getDOMNode().offsetHeight;

        var handleStyle = {
            position: "absolute",
            bottom: "-46px",
            width: 120,
            height: 46,
            display: "block",
            outline: "none",
            borderRadius: "0px 0px 15px 15px",
        };

        if(this.props.handleStyle !== null) {
            for(var key in this.props.handleStyle) {
            handleStyle[key] = this.props.handleStyle[key];
            }
        }

        var drawerStyle = {
            transition: this.state.ready ? "top ease-in-out 500ms" : null,

            padding: "25px",
            width: "250px",

            lineHeight: 1,
            position: "absolute",
            right: "20px",
            top: this.state.open ? 0 : -drawerHeight,
            margin: "0px",
            borderRadius: "0px 0px 15px 15px",
        };

        if(this.props.drawerStyle !== null) {
            for(var key in this.props.drawerStyle) {
                drawerStyle[key] = this.props.drawerStyle[key];
            }
        }

        return (
            <div className="drawer" style={drawerStyle} ref="drawer">
                {this.props.children}
                <a href="#" onClick={this.toggleOpen} style={handleStyle}>{this.props.handleText}</a>
            </div>
        );
    },
})

//var VoiceZamPlayer = React.createClass({
//    statics: {
//        _nextId: 0,
//        nextId: function() {
//            var id = "vz-" + this._nextId;
//            this._nextId += 1;
//            return id;
//        },
//    },
//    getDefaultProps: function() {
//        var nextId = VoiceZamPlayer.nextId();
//        return {
//            ownerId: '9C932A93-5FFF-4416-B1FB-0CD7AA320DF5',
//            mode: 'large',
//            renderMode: 'inline',
//            talentId: '9C932A93-5FFF-4416-B1FB-0CD7AA320DF5',
//            talentDemo: 0,
//            portal: "Homepage for Joey Speakeasy",
//            autoPlay: false,
//            showContacts: true,
//            showClose: true,
//            containerId: nextId,
//        };
//    },
//    componentDidMount: function() {
//        initializePlayer(this.props);
//        setTimeout((function() {
//            var elem = $(this.refs.target.getDOMNode());
//            elem.find("> div")
//                .css("z-index", 0)
//                .css("display", "inline-block")
//        }).bind(this), 1000);
//    },
//    render: function() {
//        var style = {
//            border: 0,
//            margin: 0,
//        };
//        return <span id={this.props.containerId} style={style} ref="target" />
//    }
//});

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
    },

    getDefaultProps: function() {
        return {
            containerTag: 'span',
            content: 'Unknown',
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
            r = <input ref="editText" defaultValue={this.props.content} onKeyDown={this.keyDown} />;
        } else {
            var subProps = _.extend({}, this.props);

            if (this.props.editable) {
                subProps.onClick = this.startEdit;
            }

            delete subProps['content'];

            r = React.createElement(this.props.containerTag, subProps, this.props.content);
        }

        return r;
    },
});

var WidgetBuilder = function(extra) {
    var builtins = {
        //'soundcloud': SoundCloudPlayer,
        'paragraph': Paragraph,
        'youtube': YouTube,
        'header': HeaderBlock,
    };

    var widgets = _.extend({}, builtins, extra);

    return React.createClass({
        getDefaultProps: function() {
            return {
                updated: function(newProps) {
                    console.error('Widget tried to update:', newProps);
                }
            }
        },
        render: function() {
            var _this = this;
            var res = null;

            var widget = widgets[this.props.type];
            if (widget !== undefined) {
                var data = _.extend({}, {
                    updated: function(newProps) {
                        _this.props.updated({
                            type: _this.props.type,
                            data: newProps,
                        });
                    },
                    editable: _this.props.editable,
                }, this.props.data);
                res = React.createElement(widget, data);
            }

            return res;
        }
    });
};
