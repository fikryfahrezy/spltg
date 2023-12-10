<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import SpotifySDK, { type SpotifyPlayerRef } from '$lib/SpotifySDK.svelte';

	const session = $page.data.session;
	const accessToken = session?.access_token;

	let spotifyPlayer: SpotifyPlayerRef;

	let currentlyPlaying = $state<any>({});

	$effect(() => {
		setInterval(() => {
			spotifyPlayer
				.request('/me/player/currently-playing')
				.then((res) => {
					return res.json();
				})
				.then((res) => {
					currentlyPlaying = res;
				});
		}, 2500);
	});

	$effect(() => {
		if (session?.error === 'RefreshAccessTokenError') {
			signIn(); // Force sign in to hopefully resolve error
		}
	});
</script>

{#if !session?.user}
	<div class="login-container">
		<button on:click={() => signIn()}>Sign in</button>
	</div>
{:else if accessToken}
	<main class="root">
		<div class="page-container">
			<div class="music-container">
				<div class="music-preview-container"></div>
				<div class="music-list-container"></div>
			</div>
			<div class="chat-room-container">
				<div class="profile-container">
					<p>Hi, {session.user.name}!</p>
					<button on:click={() => signOut()}>Sign out</button>
				</div>
				<div class="chat-list-container">
					{#each Array.from(Array(100), () => 'Lorem ipsum dolor sit amet.') as chat}
						<p>{chat}</p>
					{/each}
				</div>
				<form class="chat-form">
					<input name="message" class="chat-input" placeholder="Chat here..." />
				</form>
			</div>
		</div>
		<footer class="music-controller-container">
			<SpotifySDK
				bind:this={spotifyPlayer}
				name="Spotify Listen Together"
				getOAuthToken={function (cb) {
					cb(accessToken);
				}}
			/>
			{currentlyPlaying?.item?.name}
			<progress
				class="music-progress"
				max={currentlyPlaying?.item?.duration_ms ?? 0}
				value={currentlyPlaying?.progress_ms ?? 0}
			/>
		</footer>
	</main>
{/if}

<style>
	.login-container {
		display: flex;
		height: 100vh;
		align-items: center;
		justify-content: center;
	}

	.root {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.page-container {
		display: flex;
		height: 90%;
	}

	@media screen and (max-width: 1024px) {
		.page-container {
			flex-direction: column;
		}
	}

	.music-controller-container {
		height: 15%;
		border: 1px solid grey;
	}

	.music-container {
		display: flex;
		flex: 3;
	}

	@media screen and (max-width: 1024px) {
		.music-container {
			height: 40%;
		}
	}

	.music-list-container {
		flex: 2;
		border: 1px solid grey;
	}

	.music-preview-container {
		flex: 1;
		border: 1px solid grey;
	}

	@media screen and (max-width: 1024px) {
		.music-preview-container {
			display: none;
		}
	}

	.chat-room-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		border: 1px solid grey;
	}

	@media screen and (max-width: 1024px) {
		.chat-room-container {
			height: 60%;
		}
	}

	.chat-list-container {
		height: 90%;
		overflow: scroll;
	}

	.profile-container {
		display: flex;
		height: 5%;
		border: 1px solid grey;
		align-items: center;
		justify-content: space-between;
	}

	.chat-form {
		height: 5%;
	}

	.chat-input {
		width: 100%;
		height: 100%;
	}

	.music-progress {
		width: 100%;
	}
</style>
