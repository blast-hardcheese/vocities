/// <reference path="../../js/definitions/jquery/jquery.d.ts" />
/// <reference path="../../js/definitions/rx.js/rx.all.ts" />

var SoundCloud = (function () {
    function SoundCloud(options) {
        var _this = this;
        this.debug = true;
        this.useSandBox = false;
        this.domain = null;
        this.apiKey = null;
        this.secureDocument = true;
        this.xhrs = [];
        this.abort = function () {
            _this.xhrs.map(function (xhr) {
                xhr.abort();
            });
        };
        this.apiUrl = function (url, apiKey) {
            if (typeof apiKey === "undefined") { apiKey = _this.apiKey; }
            var resolver = (_this.secureDocument || (/^https/i).test(url) ? 'https' : 'http') + '://api.' + _this.domain + '/resolve?url=', params = 'format=json&consumer_key=' + apiKey;

            // force the secure url in the secure environment
            if (_this.secureDocument) {
                url = url.replace(/^http:/, 'https:');
            }

            // check if it's already a resolved api url
            if ((/api\./).test(url)) {
                return url + '?' + params;
            } else {
                return resolver + url + '&' + params;
            }
        };
        this.apiKey = options.apiKey;
        this.useSandBox = options.useSandBox || false;

        this.domain = this.useSandBox ? 'sandbox-soundcloud.com' : 'soundcloud.com';
    }
    // shuffle the array
    SoundCloud.shuffleArray = function (arr) {
        arr.sort(function () {
            return 1 - Math.floor(Math.random() * 3);
        });
        return arr;
    };

    SoundCloud.prototype.loadTracksFromLink = function (link, callback, tracks) {
        if (typeof tracks === "undefined") { tracks = []; }
        this.loadTracksFromLinks([link], callback, tracks);
    };

    SoundCloud.prototype.loadTracksFromLinks = function (links, callback, tracks) {
        var _this = this;
        if (typeof tracks === "undefined") { tracks = []; }
        var tracks = [];

        var forks = 0;
        for (var i in links) {
            var link = links[i];

            var apiUrl = this.apiUrl(link.url);

            forks += 1;
            var xhr = $.getJSON(apiUrl, function (data) {
                // log('data loaded', link.url, data);
                if (data.tracks) {
                    // log('data.tracks', data.tracks);
                    tracks = tracks.concat(data.tracks);
                } else if (data.duration) {
                    // if track, add to player
                    tracks.push(data);
                } else if (data.creator) {
                    // it's a group!
                    var link = { url: data.uri + '/tracks' };
                    forks += 1;
                    this.loadTracksFromLink(link, function (newTracks) {
                        tracks = tracks.concat(newTracks);
                        forks -= 1;
                        if (forks == 0) {
                            callback(tracks);
                        }
                    });
                } else if (data.username) {
                    // if user, get his tracks or favorites
                    var link = null;
                    if (/favorites/.test(data.url)) {
                        link = { url: data.uri + '/favorites' };
                    } else {
                        link = { url: data.uri + '/tracks' };
                    }
                    forks += 1;

                    this.loadTracksFromLink(link, function (newTracks) {
                        tracks = tracks.concat(newTracks);
                        forks -= 1;
                        if (forks == 0) {
                            callback(tracks);
                        }
                    });
                } else if ($.isArray(data)) {
                    tracks = tracks.concat(data);
                }

                forks -= 1;
                if (forks == 0) {
                    callback(tracks);
                }
            }.bind(this));

            xhr.always(function () {
                var idx = _this.xhrs.indexOf(xhr);
                if (idx !== -1) {
                    _this.xhrs.splice(idx, 1);
                }
            });

            this.xhrs.push(xhr);
        }

        if (forks == 0) {
            callback(tracks);
        }
    };

    SoundCloud.prototype.streamUrlFromTrack = function (track, apiKey) {
        if (typeof apiKey === "undefined") { apiKey = this.apiKey; }
        return track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
    };
    return SoundCloud;
})();
