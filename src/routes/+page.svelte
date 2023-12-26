<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { CurrentlyPlayingTrack } from '$lib/spotifyapi.type';
	import SpotifySDK from '$lib/SpotifySDK.svelte';

	const session = $page.data.session;
	const accessToken = session?.access_token;
	const minuteInMS = 1000;

	let spotifyPlayer: SpotifySDK;

	let currentlyPlayingTrack = $state<CurrentlyPlayingTrack | null>(null);
	let progress = $state<number>(0);
	let progressIntervalId = $state<number>();

	async function getCurrentlyPlaying() {
		if (!spotifyPlayer) {
			return;
		}

		const _currentlyPlayingTrack = await spotifyPlayer.getCurrentlyPlayingTrack();
		currentlyPlayingTrack = _currentlyPlayingTrack;
		progress = _currentlyPlayingTrack.progress_ms ?? 0;

		if (!_currentlyPlayingTrack.is_playing) {
			return;
		}

		progressIntervalId = window.setInterval(() => {
			progress += minuteInMS;

			const durationMs = currentlyPlayingTrack?.item?.duration_ms;
			if (durationMs !== undefined && progress > durationMs) {
				clearInterval(progressIntervalId);
				getCurrentlyPlaying();
			}
		}, minuteInMS);
	}

	onMount(() => {
		setTimeout(() => {
			getCurrentlyPlaying();
		}, minuteInMS);
	});
</script>

{#if !session}
	<div class="h-screen flex justify-center items-center">
		<a href="/auth/login">Log in with Spotify</a>
	</div>
{:else}
	<main class="h-screen flex flex-col">
		<div class="flex h-90% <lg:flex-col">
			<div class="flex flex-grow-3 flex-shrink-1 basis-0% <lg:h-40%">
				<div
					class="flex-grow-3 flex-shrink-1 basis-0% border border-solid border-gray <lg:hidden"
				></div>
				<div class="flex-grow-2 flex-shrink-1 basis-0% border border-solid border-gray"></div>
			</div>

			<div
				class="flex flex-col flex-grow-1 flex-shrink-1 basis-0% border border-solid border-gray <lg:h-60%"
			>
				<div class="h-5% flex justify-between items-center border border-solid border-gray">
					<p>Hi, {session.name}!</p>
					<a href="/auth/logout">Log out</a>
				</div>
				<div class="h-90% overflow-scroll">
					{#each Array.from(Array(100), () => 'Lorem ipsum dolor sit amet.') as chat}
						<p>{chat}</p>
					{/each}
				</div>
				<form class="h-5%">
					<input name="message" class="w-full h-full" placeholder="Chat here..." />
				</form>
			</div>
		</div>
		<footer
			class="h-15% flex items-center border border-solid border-gray [&>*]:w-33% [&>*]:flex-grow-1 [&>*]:flex-shrink-1 [&>*]:basis-0%"
		>
			<SpotifySDK
				bind:this={spotifyPlayer}
				name="Spotify Listen Together"
				getOAuthToken={function (cb) {
					cb(accessToken);
				}}
			/>
			{currentlyPlayingTrack?.item?.name}
			<progress
				class="w-full"
				max={currentlyPlayingTrack?.item?.duration_ms ?? 0}
				value={progress}
			/>
		</footer>
	</main>
{/if}
