/** @jsx React.DOM */

var classSet = React.addons.classSet;

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

var SoundCloudUtils = {
    formatDuration: function(duration) {
        duration = Number.parseInt(duration);
        var seconds = (duration % 60);
        if(seconds < 10) {
            seconds = '0' + seconds;
        } else {
            seconds = String(seconds);
        }
        return String(Math.floor(duration / 60)) + '.' + seconds;
    },
};

var SoundCloudInfo = React.createClass({
    propTypes: {
        trackUrl: React.PropTypes.string.isRequired,
        trackName: React.PropTypes.string.isRequired,
        artistUrl: React.PropTypes.string.isRequired,
        artistName: React.PropTypes.string.isRequired,
    },
    render: function() {
        return (
            <div className="sc-info">
                <h3><a href={this.props.trackUrl}>{this.props.trackName}</a></h3>
                <h4>by <a href={this.props.artistUrl}>{this.props.artistName}</a></h4>
                <p>{this.props.children}</p>
                <a href="#" className="sc-info-close">X</a>
            </div>
        );
    },
})

var SoundCloudControls = React.createClass({
    getDefaultProps: function() {
        return {
            which: 'play',
        };
    },
    render: function() {
        var showPlay = this.props.which == 'play';
        return (
            <div className="sc-controls">
                <a href="#play" className="sc-play" style={{'display': showPlay ? 'inherit':'none'}}>Play</a>
                <a href="#pause" className="sc-pause" style={{'display': !showPlay ? 'inherit':'none'}}>Pause</a>
            </div>
        );
    }
});

var SoundCloudTracksListElement = React.createClass({
    propTypes: {
        trackDuration: React.PropTypes.number.isRequired,
    },
    render: function() {
        return (
            <li className="active">
                <a href={this.props.trackUrl}>{this.props.trackName}</a>
                <span className="sc-track-duration">{SoundCloudUtils.formatDuration(this.props.trackDuration)}</span>
            </li>
        );
    }
});

var SoundCloudTracksList = React.createClass({
    render: function() {
        return (
            <ol className="sc-trackslist">
                {this.props.children}
            </ol>
        );
    },
});

var SoundCloudScrubber = React.createClass({
    propTypes: {
        waveformUrl: React.PropTypes.string.isRequired,
        trackDuration: React.PropTypes.number.isRequired,
    },
    getInitialState: function() {
        return {
            position: 0,
        };
    },
    render: function() {
        return (
            <div className="sc-scrubber">
                <div className="sc-volume-slider">
                    <span className="sc-volume-status" style={{width:'60%'}}></span>
                </div>
                <div className="sc-time-span">
                    <div className="sc-waveform-container">
                        <img src={this.props.waveformUrl} />
                    </div>
                    <div className="sc-buffer"></div>
                    <div className="sc-played"></div>
                </div>
                <div className="sc-time-indicators">
                    <span className="sc-position">{SoundCloudUtils.formatDuration(this.state.position)}</span> | <span className="sc-duration">{SoundCloudUtils.formatDuration(this.props.trackDuration)}</span>
                </div>
            </div>
        );
    },
});

var SoundCloudArtworkListElement = React.createClass({
    propTypes: {
        active: React.PropTypes.bool.isRequired,
        src: React.PropTypes.string.isRequired,
    },
    render: function() {
        var className = classSet({
            "active": this.props.active,
        });
        return (
            <li className={className}>
                <img src={this.props.src} />
            </li>
        );
    },
});

var SoundCloudArtworkList = React.createClass({
    render: function() {
        return (
            <ol className="sc-artwork-list">
                {this.props.children}
            </ol>
        );
    },
});

var SoundCloudPlayer = React.createClass({
    propTypes: {
        apiKey: React.PropTypes.string.isRequired,
        url: React.PropTypes.string.isRequired,
    },
    getDefaultProps: function() {
        return {
            apiKey: "htuiRd1JP11Ww0X72T1C3g",
        };
    },
    getInitialState: function() {
        return {
            api: null,
            tracks: null,
            selectedTrack: null,

            loaded: false,
            playing: false,
        };
    },
    componentDidMount: function() {
        var api = this.state.api;

        if(this.props.apiKey != this.state.apiKey) {
            if(api) {
                api.cancel();
            }

            api = new SoundCloud({
                apiKey: this.props.apiKey
            });
        }

        this.setState({
            apiKey: this.props.apiKey,
            api: api,
        });
    },
    render: function() {
        var api = this.state.api;
        if(api !== null && this.state.tracks === null) {
            var link = {
                title: this.props.title || "Loading...",
                url: this.props.url,
            };
            api.loadTracksFromLink(link, function(tracks) {
                this.setState({
                    tracks: tracks,
                    selectedTrack: (this.state.selectedTrack || 0),
                });
            }.bind(this));
        }

        console.log("tracks:", this.state.tracks);

        var selectedTrack = null;
        if(this.state.selectedTrack !== null && this.state.tracks !== null && this.state.tracks.length > 0) {
            selectedTrack = this.state.tracks[this.state.selectedTrack];
        }

        var selectedTrackInfo = null;
        if(selectedTrack !== null) {
            selectedTrackInfo = (
                <SoundCloudInfo trackUrl={ selectedTrack.permalink_url } trackName={ selectedTrack.name } artistUrl={ selectedTrack.user.permalink_url } artistName={ selectedTrack.user.username }>
                    { selectedTrack.description }
                </SoundCloudInfo>
            );
        }

        var whichButton = (this.state.playing) ? 'pause' : 'play';

        var trackElements = (this.state.tracks || []).map(function(track, i) {
            console.log('track', track);

            return <SoundCloudTracksListElement key={ track.id } trackName={ track.title } trackUrl={ track.permalink_url } trackDuration={ track.duration / 1000 } />
        });

        var artworkElements = (this.state.tracks || []).map(function(track, i) {
            return <SoundCloudArtworkListElement key={track.id} active={ this.state.selectedTrack == i } src={ track.artwork_url } />
        }.bind(this));

        return (
            <div className="sc-player">
                <SoundCloudArtworkList>
                    {artworkElements}
                </SoundCloudArtworkList>
                { selectedTrackInfo }
                <SoundCloudControls which={whichButton}/>
                <SoundCloudTracksList>
                    { trackElements }
                </SoundCloudTracksList>
                <a href="#info" className="sc-info-toggle">Info</a>
                <SoundCloudScrubber waveformUrl={ selectedTrack === null ? "https://w1.sndcdn.com/IqSLUxN7arjs_m.png" : selectedTrack.waveform_url } trackDuration={ 486 } />
            </div>
        );
    }
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
