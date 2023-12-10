<script lang="ts">
	import type {
		SpotifyPlayer,
		SpotifyPlayerConstructorOption,
		SpotifyEventListeners,
		SpotifyOnError,
		WebPlaybackError,
		WebPlaybackState
	} from './spotifysdk.type';

	const spotifyAPIURL = 'https://api.spotify.com/v1';

	let { getOAuthToken, name, enableMediaSession, volume } =
		$props<SpotifyPlayerConstructorOption>();

	let token: string;
	let player: SpotifyPlayer;

	$effect(function () {
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;

		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = function () {
			player = new window.Spotify.Player({
				getOAuthToken(cb) {
					getOAuthToken(function (oAuthToken) {
						token = oAuthToken;
						cb(oAuthToken);
					});
				},
				name,
				enableMediaSession,
				volume
			});
			player.connect();
		};
	});

	export function addListener<TEvent extends keyof SpotifyEventListeners>(
		event: TEvent,
		callback: SpotifyEventListeners[TEvent]
	): boolean {
		return player.addListener(event, callback);
	}

	export function removeListener<TEvent extends keyof SpotifyEventListeners>(
		event: TEvent,
		callback?: () => void
	): boolean {
		return player.removeListener(event, callback);
	}

	export function on(event: SpotifyOnError, callback: (response: WebPlaybackError) => void): void {
		return player.on(event, callback);
	}

	export function getCurrentState(): Promise<WebPlaybackState | null> {
		return player.getCurrentState();
	}

	export function setName(name: string): Promise<void> {
		return player.setName(name);
	}

	export function getVolume(): Promise<number> {
		return player.getVolume();
	}

	export function setVolume(volume: number): Promise<void> {
		return player.setVolume(volume);
	}

	export function pause(): Promise<void> {
		return player.pause();
	}

	export function resume(): Promise<void> {
		return player.resume();
	}

	export function togglePlay(): Promise<void> {
		return player.togglePlay();
	}

	export function seek(positionMs: number): Promise<void> {
		return player.seek(positionMs);
	}

	export function previousTrack(): Promise<void> {
		return player.previousTrack();
	}

	export function nextTrack(): Promise<void> {
		return player.nextTrack();
	}

	export function activateElement(): Promise<void> {
		return player.activateElement();
	}

	export function disconnect() {
		return player.disconnect();
	}

	export function request(path: string, init?: RequestInit) {
		return fetch(`${spotifyAPIURL}${path}`, {
			headers: {
				Authorization: `Bearer ${token}`
			},
			...init
		});
	}
</script>
