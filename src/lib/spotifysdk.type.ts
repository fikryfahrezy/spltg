// Ref:
// https://developer.spotify.com/documentation/web-playback-sdk/reference#spotifyplayer

declare global {
	interface Window {
		onSpotifyWebPlaybackSDKReady(): void;
		Spotify: Spotify;
	}
}

export type WebPlaybackPlayer = { device_id: string };

export type Album = {
	images: Image[];
	name: string;
	uri: string;
};

export type Image = {
	url: string;
};

export type Artist = {
	name: string;
	uri: string;
};

export type WebPlaybackTrack = {
	album: Album;
	artists: Artist[];
	id: string | null;
	is_playable: boolean;
	media_type: string;
	name: string;
	type: string;
	uri: string;
};

export type Metadata = Record<string, never>;

export type Context = {
	metadata: Metadata | null;
	uri: string | null;
};

export type Disallows = {
	pausing: boolean;
	peeking_next: boolean;
	peeking_prev: boolean;
	resuming: boolean;
	seeking: boolean;
	skipping_next: boolean;
	skipping_prev: boolean;
};

export type TrackWindow = {
	current_track: WebPlaybackTrack;
	next_tracks: WebPlaybackTrack[];
	previous_tracks: WebPlaybackTrack[];
};

export type WebPlaybackState = {
	context: Context;
	disallows: Disallows;
	paused: boolean;
	position: number;
	repeat_mode: number;
	shuffle: boolean;
	track_window: TrackWindow;
};

export type WebPlaybackError = {
	message: string;
};

type SpotifyReadyEvent = 'ready';
type SpotifyReadyEventListener = {
	[k in SpotifyReadyEvent]: (response: WebPlaybackPlayer) => void;
};

type SpotifyNotReadyEvent = 'not_ready';
type SpotifyNotReadyEventListener = {
	[k in SpotifyNotReadyEvent]: (response: WebPlaybackPlayer) => void;
};

type SpotifyPlayerStateChangedEvent = 'player_state_changed';
type SpotifyPlayerStateChangedEventListener = {
	[k in SpotifyPlayerStateChangedEvent]: (response: WebPlaybackState) => void;
};

type SpotifyAutoplayFailedEvent = 'autoplay_failed';
type SpotifyAutoplayFailedEventListener = {
	[k in SpotifyAutoplayFailedEvent]: (response: null) => void;
};

export type SpotifyEventListeners = SpotifyReadyEventListener &
	SpotifyNotReadyEventListener &
	SpotifyPlayerStateChangedEventListener &
	SpotifyAutoplayFailedEventListener;

export type SpotifyOnError =
	| 'initialization_error'
	| 'authentication_error'
	| 'account_error'
	| 'playback_error';
type SpotifyOnErrorListeners = {
	[k in SpotifyOnError]: (response: WebPlaybackError) => void;
};

type SpotifyListeners = SpotifyEventListeners & SpotifyOnErrorListeners;

export interface SpotifyPlayer {
	connect(): Promise<boolean>;
	disconnect(): void;
	addListener<TEvent extends keyof SpotifyEventListeners>(
		event: TEvent,
		callback: SpotifyEventListeners[TEvent]
	): boolean;
	removeListener<TEvent extends keyof SpotifyEventListeners>(
		event: TEvent,
		callback?: () => void
	): boolean;
	on<TError extends keyof SpotifyOnErrorListeners>(
		event: TError,
		callback: SpotifyOnErrorListeners[TError]
	): void;
	getCurrentState(): Promise<WebPlaybackState | null>;
	setName(name: string): Promise<void>;
	/**
	 * @returns {Promise<number>} Float between 0 to 1
	 */
	getVolume(): Promise<number>;
	/**
	 * @param {number} volume - Float between 0 to 1
	 */
	setVolume(volume: number): Promise<void>;
	pause(): Promise<void>;
	resume(): Promise<void>;
	togglePlay(): Promise<void>;
	seek(positionMs: number): Promise<void>;
	previousTrack(): Promise<void>;
	nextTrack(): Promise<void>;
	activateElement(): Promise<void>;
}

export type SpotifyPlayerConstructorOption = {
	name: string;
	getOAuthToken(cb: (token: string) => void): void;
	/**
	 * Float between 0 to 1
	 */
	volume?: number;
	enableMediaSession?: boolean;
};

export interface SpotifyPlayerConstructor {
	new (option: SpotifyPlayerConstructorOption): SpotifyPlayer;
}

export type Spotify = {
	Player: SpotifyPlayerConstructor;
};

type SnakeToPascal<S extends string> = S extends `${infer Head}_${infer Tail}`
	? `${Capitalize<Head>}${Capitalize<SnakeToPascal<Tail>>}`
	: Capitalize<S>;

// type PascalToCamel<S extends string> = S extends `${infer First}${infer Rest}`
// 	? SnakeToPascal<`${Uncapitalize<First>}${Rest}`>
// 	: S;

type SpotifyListenerPropsCallback = {
	[Property in keyof SpotifyListeners as `on${SnakeToPascal<Property>}`]: SpotifyListeners[Property];
};

export type SpotifyPlayerProps = SpotifyPlayerConstructorOption &
	Partial<SpotifyListenerPropsCallback>;
