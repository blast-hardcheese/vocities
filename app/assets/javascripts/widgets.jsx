/* @flow weak */

declare class SoundCloud {
    apiUrl(url: string): string;
    abort(): void;
    cancel(): void;
    loadTracksFromLink(url: any, cb: (tracks: any[]) => void): void;
}

declare var initializePlayer: (options: any) => void;

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

var SoundCloudUtils = {
    formatDuration: function(duration: any) {
        duration = parseInt(duration);
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
        close: React.PropTypes.func.isRequired,
        active: React.PropTypes.bool.isRequired,
    },
    render: function() {
        var className = classSet({
            "sc-info": true,
            "active": this.props.active,
        });
        return (
            <div className={ className }>
                <h3><a href={this.props.trackUrl}>{this.props.trackName}</a></h3>
                <h4>by <a href={this.props.artistUrl}>{this.props.artistName}</a></h4>
                <p>{this.props.children}</p>
                <a href="#" className="sc-info-close" onClick={ this.props.close }>X</a>
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
        active: React.PropTypes.bool.isRequired,
    },
    handleClick: function(e) {
        e.preventDefault();
    },
    render: function() {
        var className = classSet({
            "active": this.props.active,
        });
        return (
            <li className={ className } onClick={ this.props.selectTrack }>
                <a href={this.props.trackUrl} onClick={ this.handleClick }>{this.props.trackName}</a>
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
        adjustVolume: React.PropTypes.func.isRequired,
    },
    getInitialState: function() {
        return {
            mouseDown: false,
        };
    },
    stateProxy: function(key, value) {
        return function(e) {
            e.stopPropagation();
            var state = {};
            state[key] = value;
            this.setState(state);
        }.bind(this);
    },
    mouseWrapper: function(stateKey, callback, ref) {
        return function(event) {
            event.stopPropagation();
            var rect = this.refs[ref].getDOMNode().getBoundingClientRect();
            var percentage = (event.clientX - rect.left) / rect.width;
            var state = {};
            state[stateKey] = true;
            this.setState(state);
            callback(percentage);
        }.bind(this);
    },
    render: function() {
        return (
            <div className="sc-scrubber">
                <div
                    ref="volume"
                    className="sc-volume-slider"
                    onMouseDown={ this.mouseWrapper("volMouseDown", this.props.adjustVolume, 'volume') }
                    onMouseLeave={ this.stateProxy("volMouseDown", false) }
                    onMouseMove={ this.state.volMouseDown ? this.mouseWrapper("volMouseDown", this.props.adjustVolume, 'volume') : null }
                    onMouseUp={ this.stateProxy("volMouseDown", false) }
                >
                    <span style={{ width: Math.floor(this.props.volume * 100) + '%' }} className="sc-volume-status"></span>
                </div>
                <div
                    ref="timespan"
                    className="sc-time-span"
                    onMouseDown={ this.mouseWrapper("mouseDown", this.props.updatePosition, 'timespan') }
                    onMouseLeave={ this.stateProxy("mouseDown", false) }
                    onMouseMove={ this.state.mouseDown ? this.mouseWrapper("mouseDown", this.props.updatePosition, 'timespan') : null }
                    onMouseUp={ this.stateProxy("mouseDown", false) }
                >
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
        autoplay: React.PropTypes.string,
        preload: React.PropTypes.string,
    },
    getDefaultProps: function() {
        return {
            apiKey: "htuiRd1JP11Ww0X72T1C3g",
            autoplay: null,
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
            volume: 1,

            autoplay: null,
        };
    },
    loadUrl: function(url, title) {
        var api = this.state.api;
        var link = {
            title: this.props.title || "Loading...",
            url: url,
        };
        api.loadTracksFromLink(link, function(tracks) {
            this.setState({
                tracks: tracks,
                selectedTrack: 0,
            });
        }.bind(this));
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

        var audioHandlers = {
            'suspend': function(event) {
                _this.setState({ bufferPosition: this.buffered.length === 1 ? (this.buffered.end(0) / this.duration) : 0 });
            },

            'progress': function(event) {
                _this.setState({ bufferPosition: this.buffered.length === 1 ? (this.buffered.end(0) / this.duration) : 0 });
            },

            'timeupdate': function(event) {
                _this.setState({
                    bufferPosition: this.buffered.length === 1 ? (this.buffered.end(0) / this.duration) : 0,
                    playbackPosition: this.currentTime / this.duration,
                    playbackTimecode: this.currentTime,
                });
            },

            'play': function(event) {
                _this.setState({
                    playing: true,
                });
            },

            'pause': function(event) {
                _this.setState({
                    playing: false,
                });
            },

            'abort': function(event) {
                _this.setState({
                    playing: false,
                    bufferPosition: 0,
                    playbackPosition: 0,
                    playbackTimecode: 0,
                });
            },

            'volumechange': function(event) {
                _this.setState({
                    volume: this.volume,
                });
            },

            'ended': function(event) {
                var audio = _this.refs.audio.getDOMNode();
                var selectedTrack = _this.state.selectedTrack + 1;
                if(selectedTrack < _this.state.tracks.length) {
                    _this.setState({
                        selectedTrack: selectedTrack,
                        autoplay: true,
                    });
                } else {
                    // Playlist ended!
                }
            }
        }
        var audio = this.refs.audio.getDOMNode();
        for(var key in audioHandlers) {
            if (audioHandlers.hasOwnProperty(key)) {
                audio.addEventListener(key, audioHandlers[key], false);
            }
        }

        this.setState({
            apiKey: this.props.apiKey,
            api: api,
            audioHandlers: audioHandlers,
        });

        // Must be done after API has been set!
        this.loadUrl(this.props.url, this.props.title);
    },
    componentWillReceiveProps: function(newProps) {
        this.loadUrl(newProps.url, newProps.title);
    },
    componentWillUnmount: function() {
        this.state.api.abort();

        var audioHandlers = this.state.audioHandlers;

        var audio = this.refs.audio.getDOMNode();
        for(var key in audioHandlers) {
            if(audioHandlers.hasOwnProperty(key)) {
                audio.removeEventListener(key, audioHandlers[key], false);
            }
        }
    },
    togglePlayback: function(e) {
        e.stopPropagation();
        if(this.state.playing) {
            this.refs.audio.getDOMNode().pause();
        } else {
            this.refs.audio.getDOMNode().play();
        }
    },
    stateProxy: function(key, value) {
        return function(e) {
            e.stopPropagation();
            console.log(key, '->', value);
            var state = {};
            state[key] = value;
            this.setState(state);
        }.bind(this);
    },
    stateProxyToggle: function(key) {
        return function(e) {
            e.stopPropagation();
            var state = {};
            state[key] = !this.state[key];
            this.setState(state);
        }.bind(this);
    },
    updatePosition: function(percentage) {
        var audio = this.refs.audio.getDOMNode();
        audio.currentTime = percentage * audio.duration;
    },
    adjustVolume: function(percentage) {
        var audio = this.refs.audio.getDOMNode();
        audio.volume = percentage;
    },
    selectTrack: function(idx) {
        return function(e) {
            e.stopPropagation();
            var audio = this.refs.audio.getDOMNode();
            if(audio.buffered.length > 0) {
                audio.currentTime = 0;
            }
            this.setState({
                "selectedTrack": idx,
                "autoplay": "autoplay",
            });
        }.bind(this);
    },
    render: function() {

        var selectedTrack = null;
        if(this.state.selectedTrack !== null && this.state.tracks !== null && this.state.tracks.length > 0) {
            selectedTrack = this.state.tracks[this.state.selectedTrack];
        }

        var selectedTrackInfo = null;
        if(selectedTrack !== null && this.state.showInfo) {
            selectedTrackInfo = (
                <SoundCloudInfo trackUrl={ selectedTrack.permalink_url } trackName={ selectedTrack.title } artistUrl={ selectedTrack.user.permalink_url } artistName={ selectedTrack.user.username } close={ this.stateProxy("showInfo", false) } active={ this.state.showInfo }>
                    { selectedTrack.description }
                </SoundCloudInfo>
            );
        }

        var whichButton = (this.state.playing) ? 'pause' : 'play';

        var trackElements = (this.state.tracks || []).map(function(track, i) {
            return <SoundCloudTracksListElement key={ track.id } active={ this.state.selectedTrack === i } trackName={ track.title } trackUrl={ track.permalink_url } trackDuration={ track.duration / 1000 } selectTrack={ this.selectTrack(i) } />
        }.bind(this));

        var artworkElements = (this.state.tracks || []).map(function(track, i) {
            return <SoundCloudArtworkListElement key={track.id} active={ this.state.selectedTrack === i } src={ track.artwork_url || "/assets/images/soundcloud_icon_by_tinylab-d48mjy9.png" } />
        }.bind(this));

        var autoplay = this.state.autoplay || this.props.autoplay;
        var preload = autoplay == null ? "none" : null;

        return (
            <div className={classSet({
                "sc-player": true,
                "playing": this.state.playing,
            })}>
                <audio ref="audio" style={{ display: 'none' }} src={ selectedTrack === null ? null : this.state.api.apiUrl(selectedTrack.stream_url) } autoPlay={ autoplay } preload={ preload } />
                <SoundCloudArtworkList>
                    {artworkElements}
                </SoundCloudArtworkList>
                { selectedTrackInfo }
                <SoundCloudControls which={whichButton} toggle={ this.togglePlayback } />
                <SoundCloudTracksList>
                    { trackElements }
                </SoundCloudTracksList>
                <a href="#info" className="sc-info-toggle" onClick={ this.stateProxyToggle("showInfo") }>Info</a>
                <SoundCloudScrubber
                    waveformUrl={ selectedTrack === null ? "https://w1.sndcdn.com/IqSLUxN7arjs_m.png" : selectedTrack.waveform_url }
                    trackDuration={ selectedTrack === null ? 0 : selectedTrack.duration / 1000 }
                    updatePosition={ this.updatePosition }
                    playbackPosition={ this.state.playbackPosition || 0 }
                    playbackTimecode={ this.state.playbackTimecode || 0 }
                    bufferPosition={ this.state.bufferPosition || 0 }
                    volume={ this.state.volume }
                    adjustVolume={ this.adjustVolume }
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
        var src = "//www.youtube.com/embed/" + this.props.videoId + "?html5=1";

        return <iframe
            width={this.props.width}
            height={this.props.height}
            src={src}
            frameBorder={this.props.frameborder}
            allowFullScreen={this.props.allowFullscreen}
        />
    },
});

var Paragraph = React.createClass({
    render: function() {
        return (
            <div>{
                this.props.content.map(function(x) {
                    return <p>{x}</p>;
                })
            }</div>
        );
    }
});
