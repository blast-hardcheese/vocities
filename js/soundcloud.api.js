/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="definitions/rx.js/rx.all.ts" />

var SoundCloud = (function () {
    function SoundCloud() {
        var _this = this;
        this.debug = true;
        this.useSandBox = false;
        this.domain = this.useSandBox ? 'sandbox-soundcloud.com' : 'soundcloud.com';
        this.apiKey = 'htuiRd1JP11Ww0X72T1C3g';
        this.secureDocument = true;
        this.apiUrl = function (url, apiKey) {
            if (typeof apiKey === "undefined") { apiKey = _this.apiKey; }
            var resolver = (_this.secureDocument || (/^https/i).test(url) ? 'https' : 'http') + '://api.' + _this.domain + '/resolve?url=', params = 'format=json&consumer_key=' + apiKey + '&callback=?';

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
        if (typeof tracks === "undefined") { tracks = []; }
        var tracks = [];

        var forks = 0;
        for (var i in links) {
            var link = links[i];

            var apiUrl = this.apiUrl(link.url);

            forks += 1;
            $.getJSON(apiUrl, function (data) {
                // log('data loaded', link.url, data);
                if (data.tracks) {
                    // log('data.tracks', data.tracks);
                    tracks = tracks.concat(data.tracks);
                } else if (data.duration) {
                    // a secret link fix, till the SC API returns permalink with secret on secret response
                    data.permalink_url = data.url;

                    // if track, add to player
                    tracks.push(data);
                } else if (data.creator) {
                    // it's a group!
                    links.push({ url: data.uri + '/tracks' });
                } else if (data.username) {
                    // if user, get his tracks or favorites
                    var link = null;
                    if (/favorites/.test(data.url)) {
                        link = { url: data.uri + '/favorites' };
                    } else {
                        link = { url: data.uri + '/tracks' };
                    }
                    forks += 1;

                    this.loadUrl(link, function (newTracks) {
                        tracks = tracks.concat(newTracks);
                        forks -= 1;
                        if (forks == 0) {
                            callback(tracks);
                        }
                    }.bind(this));
                } else if ($.isArray(data)) {
                    tracks = tracks.concat(data);
                }

                // if loading finishes, anounce it to the GUI
                //playerObj.node.trigger({type:'onTrackDataLoaded', playerObj: playerObj, url: apiUrl});
                forks -= 1;
                if (forks == 0) {
                    callback(tracks);
                }
            }.bind(this));
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
