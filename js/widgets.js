/** @jsx React.DOM */

// Components
var ReadyComponent = function(timeout) {
    if(timeout === undefined) {
        timeout = 250;
    }
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
        componentDidUnmount: function() {
            clearTimeout(readyProps.timer);
            this.setState({
                ready: false,
            });
        }
    };
}

// Widgets

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

        var mp3Source = mp3 ? <source src={mp3} type='audio/mpeg; codecs="mp3"' /> : null;
        var oggSource = ogg ? <source src={ogg} type='audio/ogg; codecs="vorbis"' /> : null;
        return (
            <audio style={this.props.style} controls={this.props.controls}>
                {mp3Source}
                {oggSource}
                Download as <a href={mp3}>MP3</a> or <a href={ogg}>OGG Vorbis</a>.
        </audio>
        );
    },
});

var SoundCloudCommon = {
    extend: function(id, extra) {
        return jQuery.extend({}, this[id], extra || {});
    },
    extendFunc: function(id, extra) {
        return (function() {
            return jQuery.extend({}, SoundCloudCommon[id](), extra || {});
        });
    },
    getInitialState: function() {
        return {
            api: new SoundCloud(),
            hasData: false,
            tracks: [],
        }
    },
    propTypes: {
        user: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired, // ID of clip
        label: React.PropTypes.string.isRequired,
    },
    gotTracks: function(tracks) {
        this.setState({ tracks: tracks, hasData: true });
    },
}

var SoundCloudLogo = React.createClass({
    propTypes: {
        url: React.PropTypes.string.isRequired,
    },
    render: function() {
        var style = {
            display: "inline-block",
            backgroundImage: "url(" + this.props.url + ");",
            backgroundRepeat: "no-repeat",
            width: "100px",
            height: "100px",
        }
        return <div style={style}></div>
    },
})

var SoundCloudClip = React.createClass({
    getInitialState: SoundCloudCommon.extendFunc('getInitialState', {}),
    propTypes: SoundCloudCommon.extend('propTypes', {}),
    gotTracks: SoundCloudCommon.gotTracks,
    render: function() {
        if(! this.state.hasData) {
            var url = "https://soundcloud.com/" + this.props.user + "/" + this.props.id;
            this.state.api.loadTracksFromUrl({url: url}, this.gotTracks);
        }

        var tracks = this.state.tracks.map(function(track, i, tracks) {
            return <div key={track.id}>
                <SoundCloudLogo url={track.artwork_url} />
                <span>{track.title}</span>
                <audio controls>
                    <source src={this.state.api.streamUrlFromTrack(track)} type='audio/mpeg; codecs="mp3"' />;
                </audio>
            </div>;
        }.bind(this));

        return (
            <div>
                {tracks}
            </div>
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

    toggleOpen: function() {
        this.setState({
            open: !this.state.open,
        });
        return false;
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

var VoiceZamPlayer = React.createClass({
    statics: {
        _nextId: 0,
        nextId: function() {
            var id = "vz-" + this._nextId;
            this._nextId += 1;
            return id;
        },
    },
    getDefaultProps: function() {
        var nextId = VoiceZamPlayer.nextId();
        return {
            ownerId: '9C932A93-5FFF-4416-B1FB-0CD7AA320DF5',
            mode: 'large',
            renderMode: 'inline',
            talentId: '9C932A93-5FFF-4416-B1FB-0CD7AA320DF5',
            talentDemo: 0,
            portal: "Homepage for Joey Speakeasy",
            autoPlay: false,
            showContacts: true,
            showClose: true,
            containerId: nextId,
        };
    },
    componentDidMount: function() {
        initializePlayer(this.props);
        setTimeout((function() {
            var elem = $(this.refs.target.getDOMNode());
            elem.find("> div")
                .css("z-index", 0)
                .css("display", "inline-block")
        }).bind(this), 1000);
    },
    render: function() {
        var style = {
            border: 0,
            margin: 0,
        };
        return <span id={this.props.containerId} style={style} ref="target" />
    }
});

var YouTube = React.createClass({
    getInitialState: function() {
        return {
        };
    },
    getDefaultProps: function() {
        return {
            width: undefined,
            height: undefined,
            frameborder: 0,
            allowFullscreen: "allowfullscreen",
        };
    },
    render: function() {
        var src = "//www.youtube.com/embed/" + this.props.videoId + "?fs=1";

        return <iframe
            width={this.props.width}
            height={this.props.height}
            src={src}
            frameBorder={this.props.frameborder}
            allowFullScreen={this.props.allowFullscreen}
        />
    },
});
