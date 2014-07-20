/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="definitions/rx.js/rx.all.d.ts" />
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
declare class SoundCloud {
    private debug;
    private useSandBox;
    private domain;
    private apiKey;
    private secureDocument;
    static shuffleArray<T>(arr: T[]): T[];
    constructor();
    public apiUrl: (url: string, apiKey?: string) => string;
    public loadTracksFromUrl(link: Link, callback: (tracks: Track[]) => void, tracks?: Track[]): void;
    public loadTracksFromUrls(links: Link[], callback: (tracks: Track[]) => void, tracks?: Track[]): void;
    public streamUrlFromTrack(track: Track, apiKey?: string): string;
}
