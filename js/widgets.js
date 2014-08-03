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
    propTypes: {
        which: React.PropTypes.string.isRequired,
        toggle: React.PropTypes.func.isRequired,
    },
    getDefaultProps: function() {
        return {
            which: 'play',
        };
    },
    render: function() {
        var showPlay = this.props.which == 'play';
        return (
            <div className="sc-controls">
                <a href="#play" className="sc-play" style={{'display': showPlay ? 'inherit':'none'}} onClick={ this.props.toggle }>Play</a>
                <a href="#pause" className="sc-pause" style={{'display': !showPlay ? 'inherit':'none'}} onClick={ this.props.toggle }>Pause</a>
            </div>
        );
    }
});

var SoundCloudTracksListElement = React.createClass({
    propTypes: {
        trackDuration: React.PropTypes.number.isRequired,
        selectTrack: React.PropTypes.func.isRequired,
    },
    render: function() {
        return (
            <li className="active" onClick={ this.props.selectTrack }>
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
        updatePosition: React.PropTypes.func.isRequired,
        playbackPosition: React.PropTypes.number.isRequired,
        playbackTimecode: React.PropTypes.number.isRequired,
    },
    getInitialState: function() {
        return {
            mouseDown: false,
        };
    },
    stateProxy: function(key, value) {
        return function() {
            var state = {};
            state[key] = value;
            this.setState(state);
            return false;
        }.bind(this);
    },
    mouseMove: function(event) {
        var rect = this.refs.timespan.getDOMNode().getBoundingClientRect();
        var percentage = (event.clientX - rect.left) / rect.width;
        this.props.updatePosition(percentage);
    },
    mouseDown: function(event) {
        var rect = this.refs.timespan.getDOMNode().getBoundingClientRect();
        var percentage = (event.clientX - rect.left) / rect.width;
        this.props.updatePosition(percentage);
    },
    render: function() {
        return (
            <div className="sc-scrubber">
                <div className="sc-volume-slider">
                    <span className="sc-volume-status"></span>
                </div>
                <div ref="timespan" className="sc-time-span" onMouseDown={ this.mouseDown } onMouseUp={ this.stateProxy("mouseDown", false) } onMouseMove={ this.state.mouseDown ? this.mouseMove : null }>
                    <div className="sc-waveform-container">
                        <img src={this.props.waveformUrl} />
                    </div>
                    <div className="sc-buffer" style={{ width: (this.props.bufferPosition * 100) + '%' }}></div>
                    <div className="sc-played" style={{ width: (this.props.playbackPosition * 100) + '%' }}></div>
                </div>
                <div className="sc-time-indicators">
                    <span className="sc-position">{SoundCloudUtils.formatDuration(this.props.playbackTimecode)}</span> | <span className="sc-duration">{SoundCloudUtils.formatDuration(this.props.trackDuration)}</span>
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
                <div style={{
                    display: 'inline-block',
                    backgroundSize: 'cover',
                    backgroundImage: 'url(' + this.props.src + ')',
                    backgroundPosition: 'center',
                }} />
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

            playbackPosition: 0,
        };
    },
    componentDidMount: function() {
        var _this = this;
        var api = this.state.api;

        if(this.props.apiKey != this.state.apiKey) {
            if(api) {
                api.cancel();
            }

            api = new SoundCloud({
                apiKey: this.props.apiKey
            });
        }

        var audio = this.refs.audio.getDOMNode();
        var properties = [
            "onabort", "oncanplay", "oncanplaythrough", "ondurationchange", "onemptied",
            "onended", "onerror", "onloadeddata", "onloadedmetadata", "onloadstart",
            "onpause", "onplay", "onplaying", "onprogress", "onratechange",
            "onreadystatechange", "onseeked", "onseeking", "onstalled", "onsuspend",
            "onvolumechange", "onwaiting"
        ];
        for(var i in properties) {
            var key = properties[i];
            audio[key] = (function(key) {
                return function(event) {
                    console.log('got', key, event);
                }
            })(key);
        }

        var audioHandlers = {};

        audioHandlers['suspend'] = function(event) {
            _this.setState({ bufferPosition: this.buffered.end(0) / this.duration });
        }
        audioHandlers['progress'] = function(event) {
            _this.setState({ bufferPosition: this.buffered.end(0) / this.duration });
        }
        audioHandlers['timeupdate'] = function(event) {
            _this.setState({
                bufferPosition: this.buffered.end(0) / this.duration,
                playbackPosition: this.currentTime / this.duration,
                playbackTimecode: this.currentTime,
            });
        }
        audioHandlers['play'] = function(event) {
            _this.setState({
                playing: true,
            });
        }

        audioHandlers['pause'] = function(event) {
            _this.setState({
                playing: false,
            });
        }

        audioHandlers['abort'] = function(event) {
            _this.setState({
                playing: false,
                bufferPosition: 0,
                playbackPosition: 0,
                playbackTimecode: 0,
            });
        }

        var keys = Object.keys(audioHandlers);
        for(var i in keys) {
            var key = keys[i];
            audio.addEventListener(key, audioHandlers[key]);
        }

        this.setState({
            apiKey: this.props.apiKey,
            api: api,
            audioHandlers: audioHandlers,
        });
    },
    togglePlayback: function() {
        if(this.state.playing) {
            this.refs.audio.getDOMNode().pause();
        } else {
            this.refs.audio.getDOMNode().play();
        }
    },
    stateProxy: function(key, value) {
        return function() {
            console.log(key, '->', value);
            var state = {};
            state[key] = value;
            this.setState(state);
            return false;
        }.bind(this);
    },
    updatePosition: function(percentage) {
        var audio = this.refs.audio.getDOMNode();
        audio.currentTime = percentage * audio.duration;
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

        var selectedTrack = null;
        if(this.state.selectedTrack !== null && this.state.tracks !== null && this.state.tracks.length > 0) {
            selectedTrack = this.state.tracks[this.state.selectedTrack];
        }

        var selectedTrackInfo = null;
        if(selectedTrack !== null) {
            selectedTrackInfo = (
                <SoundCloudInfo trackUrl={ selectedTrack.permalink_url } trackName={ selectedTrack.title } artistUrl={ selectedTrack.user.permalink_url } artistName={ selectedTrack.user.username }>
                    { selectedTrack.description }
                </SoundCloudInfo>
            );
        }

        var whichButton = (this.state.playing) ? 'pause' : 'play';

        var trackElements = (this.state.tracks || []).map(function(track, i) {
            return <SoundCloudTracksListElement key={ track.id } trackName={ track.title } trackUrl={ track.permalink_url } trackDuration={ track.duration / 1000 } selectTrack={ this.stateProxy("selectedTrack", i) } />
        }.bind(this));

        var artworkElements = (this.state.tracks || []).map(function(track, i) {
            return <SoundCloudArtworkListElement key={track.id} active={ this.state.selectedTrack == i } src={ track.artwork_url || "http://fc09.deviantart.net/fs70/i/2012/278/7/7/soundcloud_icon_by_tinylab-d48mjy9.png" } />
        }.bind(this));

        return (
            <div className={classSet({
                "sc-player": true,
                "playing": this.state.playing,
            })}>
                <audio ref="audio" style={{ display: 'none' }} src={ selectedTrack === null ? null : this.state.api.apiUrl(selectedTrack.stream_url) } autoplay="autoplay" />
                <SoundCloudArtworkList>
                    {artworkElements}
                </SoundCloudArtworkList>
                { selectedTrackInfo }
                <SoundCloudControls which={whichButton} toggle={ this.togglePlayback } />
                <SoundCloudTracksList>
                    { trackElements }
                </SoundCloudTracksList>
                <a href="#info" className="sc-info-toggle">Info</a>
                <SoundCloudScrubber
                    waveformUrl={ selectedTrack === null ? "https://w1.sndcdn.com/IqSLUxN7arjs_m.png" : selectedTrack.waveform_url }
                    trackDuration={ selectedTrack === null ? 0 : selectedTrack.duration / 1000 }
                    updatePosition={ this.updatePosition }
                    playbackPosition={ this.state.playbackPosition || 0 }
                    playbackTimecode={ this.state.playbackTimecode || 0 }
                    bufferPosition={ this.state.bufferPosition || 0 }
                />
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
