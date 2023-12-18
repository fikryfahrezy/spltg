<script lang="ts">
	import type {
		SpotifyPlayer,
		SpotifyPlayerProps,
		SpotifyEventListeners,
		WebPlaybackState
	} from './spotifysdk.type';

	import type { CurrentlyPlayingTrack } from './spotifyapi.type';

	const spotifyAPIURL = 'https://api.spotify.com/v1';

	const defaultPlayer: SpotifyPlayer = {
		removeListener() {
			return false;
		},
		async getCurrentState() {
			return null;
		},
		async setName() {},
		async getVolume() {
			return 0;
		},
		async setVolume() {},
		async pause() {},
		async resume() {},
		async togglePlay() {},
		async seek() {},
		async previousTrack() {},
		async nextTrack() {},
		async activateElement() {},
		disconnect() {},
		async connect() {
			return false;
		},
		addListener() {
			return false;
		},
		on() {}
	};

	let {
		getOAuthToken,
		name,
		enableMediaSession,
		volume,
		onAccountError,
		onAuthenticationError,
		onAutoplayFailed,
		onInitializationError,
		onNotReady,
		onPlaybackError,
		onPlayerStateChanged,
		onReady
	} = $props<SpotifyPlayerProps>();

	let token = $state<string>('');
	let player = $state<SpotifyPlayer>(defaultPlayer);

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

			if (onReady !== undefined) {
				player.addListener('ready', onReady);
			}
			if (onNotReady !== undefined) {
				player.addListener('not_ready', onNotReady);
			}
			if (onPlayerStateChanged !== undefined) {
				player.addListener('player_state_changed', onPlayerStateChanged);
			}
			if (onAutoplayFailed !== undefined) {
				player.addListener('autoplay_failed', onAutoplayFailed);
			}

			if (onInitializationError !== undefined) {
				player.on('initialization_error', onInitializationError);
			}
			if (onAccountError !== undefined) {
				player.on('account_error', onAccountError);
			}
			if (onAuthenticationError !== undefined) {
				player.on('authentication_error', onAuthenticationError);
			}
			if (onPlaybackError !== undefined) {
				player.on('playback_error', onPlaybackError);
			}
			player.connect();
		};
	});

	export function removeListener<TEvent extends keyof SpotifyEventListeners>(
		event: TEvent,
		callback?: () => void
	): boolean {
		return player.removeListener(event, callback);
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

	export async function getCurrentlyPlayingTrack(): Promise<CurrentlyPlayingTrack> {
		return request('/me/player/currently-playing').then((res) => {
			return res.json();
		});
	}

	export function request(path: string, init?: RequestInit) {
		let intervalId: number = 0;

		return new Promise<Response>((resolve) => {
			intervalId = window.setInterval(() => {
				if (!token) {
					return;
				}

				const response = fetch(`${spotifyAPIURL}${path}`, {
					headers: {
						Authorization: `Bearer ${token}`
					},
					...init
				});

				clearInterval(intervalId);
				resolve(response);
			}, 500);
		});
	}
</script>
