/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="definitions/rx.js/rx.all.ts" />

interface Link {
    url: string;
    title?: string;
}

interface Product {
    id: string;
    name: string;
}

interface Subscription {
    product: Product;
}

interface SoundCloudEntity {
    id: number;
    description?: string;
    kind: string;
    permalink_url: string;
    permalink: string;
    uri: string;
}

interface User extends SoundCloudEntity {
    avatar_url: string;
    city?: string;
    country?: string;
    discogs_name?: string;
    first_name?: string;
    followers_count: number;
    followings_count: number;
    full_name?: string;
    last_name?: string;
    myspace_name?: string;
    online?: boolean;
    plan?: string;
    playlist_count: number;
    public_favorites_count: number;
    subscriptions?: Subscription[];
    track_count?: number;
    username: string;
    website?: string;
    website_title?: string;
}

interface Track extends SoundCloudEntity {
    artwork_url: string;
    attachments_uri: string;
    bpm?: number;
    comment_count: number;
    commentable: boolean;
    created_at: string;
    download_count: number;
    download_url: string;
    downloadable: boolean;
    duration: number;
    embeddable_by: string;
    favoritings_count: number;
    genre: string;
    isrc: string;
    key_signature: string;
    label_id?: number;
    label_name: string;
    license: string;
    original_content_size: number;
    original_format: string;
    playback_count: number;
    purchase_title?: string;
    purchase_url: string;
    release: string;
    release_day?: number;
    release_month?: number;
    release_year?: number;
    sharing: string;
    state: string;
    stream_url: string;
    streamable: boolean;
    tag_list: string;
    title: string;
    track_type: string;
    user: User;
    user_id: number;
    video_url?: string;
    waveform_url: string;
}

class SoundCloud {
    private debug = true;
    private useSandBox = false;
    private domain = this.useSandBox ? 'sandbox-soundcloud.com' : 'soundcloud.com';

    private apiKey = 'htuiRd1JP11Ww0X72T1C3g';
    private secureDocument = true;

    // shuffle the array
    static shuffleArray<T>(arr: T[]): T[] {
        arr.sort(function() { return 1 - Math.floor(Math.random() * 3); } );
        return arr;
    }

    constructor() {

    }

    apiUrl = (url: string, apiKey: string = this.apiKey) => {
        var resolver = ( this.secureDocument || (/^https/i).test(url) ? 'https' : 'http') + '://api.' + this.domain + '/resolve?url=',
            params = 'format=json&consumer_key=' + apiKey +'&callback=?';

        // force the secure url in the secure environment
        if( this.secureDocument ) {
            url = url.replace(/^http:/, 'https:');
        }

        // check if it's already a resolved api url
        if ( (/api\./).test(url) ) {
            return url + '?' + params;
        } else {
            return resolver + url + '&' + params;
        }
    };

    loadTracksFromUrl(link: Link, callback: (tracks: Track[]) => void, tracks: Track[] = []) {
        this.loadTracksFromUrls([link], callback, tracks);
    }

    loadTracksFromUrls(links: Link[], callback: (tracks: Track[]) => void, tracks: Track[] = []): void {
        var tracks: Track[] = [];

        var forks = 0;
        for(var i in links) {
            var link = links[i];

            var apiUrl = this.apiUrl(link.url);

            forks += 1;
            $.getJSON(apiUrl, function(data: any) {
                // log('data loaded', link.url, data);
                if(data.tracks) {
                    // log('data.tracks', data.tracks);
                    tracks = tracks.concat(data.tracks);
                } else if(data.duration) {
                    // a secret link fix, till the SC API returns permalink with secret on secret response
                    data.permalink_url = data.url;
                    // if track, add to player
                    tracks.push(data);
                } else if(data.creator) {
                    // it's a group!
                    links.push({url:data.uri + '/tracks'});
                } else if(data.username) {
                    // if user, get his tracks or favorites
                    var link: Link = null;
                    if(/favorites/.test(data.url)) {
                        link = {url: data.uri + '/favorites'};
                    } else {
                        link = {url: data.uri + '/tracks'};
                    }
                    forks += 1;

                    this.loadUrl(link, function(newTracks: Track[]) {
                        tracks = tracks.concat(newTracks);
                        forks -= 1;
                        if(forks == 0) {
                            callback(tracks);
                        }
                    }.bind(this));
                } else if($.isArray(data)) {
                    tracks = tracks.concat(data);
                }

                // if loading finishes, anounce it to the GUI
                //playerObj.node.trigger({type:'onTrackDataLoaded', playerObj: playerObj, url: apiUrl});
                forks -= 1;
                if(forks == 0) {
                    callback(tracks);
                }
            }.bind(this));
        }

        if(forks == 0) {
            callback(tracks);
        }
    }

    streamUrlFromTrack(track: Track, apiKey: string = this.apiKey) {
        return track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
    }
}
