/* eslint-disable-next-line @typescript-eslint/ban-types 
-- This fine for tricky hack to string union */
type OtherString = string & {};

export interface Device {
	id: string | null;
	is_active: boolean;
	is_private_session: boolean;
	is_restricted: boolean;
	name: string;
	type: string;
	volume_percent: number | null;
	supports_volume: boolean;
}

export interface Actions {
	interrupting_playback: boolean;
	pausing: boolean;
	resuming: boolean;
	seeking: boolean;
	skipping_next: boolean;
	skipping_prev: boolean;
	toggling_repeat_context: boolean;
	toggling_shuffle: boolean;
	toggling_repeat_track: boolean;
	transferring_playback: boolean;
}

export interface ExternalUrls {
	spotify: string;
}

export interface Context {
	type: string;
	href: string;
	external_urls: ExternalUrls;
	uri: string;
}

export interface Image {
	url: string;
	height: number | null;
	width: number | null;
}

export interface Restrictions {
	reason: 'market' | 'product' | 'explicit' | OtherString;
}

export interface Followers {
	href: string;
	total: number;
}

export interface AlbumArtist {
	external_urls: ExternalUrls;
	href: string;
	id: string;
	name: string;
	type: 'artist';
	uri: string;
}

export interface Album {
	album_type: 'album' | 'single' | 'compilation';
	total_tracks: number;
	available_markets: string[];
	external_urls: ExternalUrls;
	href: string;
	id: string;
	images: Image[];
	name: string;
	release_date: string;
	release_date_precision: 'year' | 'month' | 'day';
	restrictions: Restrictions;
	type: 'album';
	uri: string;
	artists: AlbumArtist[];
}

export interface ItemArtist {
	external_urls: ExternalUrls;
	followers: Followers;
	genres: string[];
	href: string;
	id: string;
	images: Image[];
	name: string;
	popularity: number;
	type: 'artist';
	uri: string;
}

export interface ExternalIDS {
	isrc: string;
	ean: string;
	upc: string;
}

export interface LinkedFrom {}

export interface TrackObject {
	album: Album;
	artists: ItemArtist[];
	available_markets: string[];
	disc_number: number;
	duration_ms: number;
	explicit: boolean;
	external_ids: ExternalIDS;
	external_urls: ExternalUrls;
	href: string;
	id: string;
	is_playable: boolean;
	linked_from: LinkedFrom;
	restrictions: Restrictions;
	name: string;
	popularity: number;
	preview_url: string | null;
	track_number: number;
	type: 'track';
	uri: string;
	is_local: boolean;
}

export interface CurrentlyPlayingTrack {
	device: Device;
	repeat_state: string;
	shuffle_state: boolean;
	context: Context | null;
	timestamp: number;
	progress_ms: number | null;
	is_playing: boolean;
	item: TrackObject | null;
	currently_playing_type: string;
	actions: Actions;
}
