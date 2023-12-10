import type { JWT } from '@auth/core/jwt';
import type { TokenSet } from '@auth/core/types';
import { Buffer } from 'node:buffer';

import { SvelteKitAuth } from '@auth/sveltekit';
import Spotify from '@auth/core/providers/spotify';
import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_AUTHORIZATION_URL,
	SPOTIFY_TOKEN_URL
} from '$env/static/private';

const SpotifyProvider = Spotify({
	clientId: SPOTIFY_CLIENT_ID,
	clientSecret: SPOTIFY_CLIENT_SECRET,
	authorization: SPOTIFY_AUTHORIZATION_URL
});

async function refreshSpotifyAccessToken(token: JWT) {
	// https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
	// We need the `token_endpoint`.
	const url = SPOTIFY_TOKEN_URL;

	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: token.refresh_token
		})
	};
	const response = await fetch(url, payload);
	const tokens: TokenSet = await response.json();
	return { response, tokens };
}

export const handle = SvelteKitAuth({
	providers: [SpotifyProvider],
	callbacks: {
		async jwt({ token, account }) {
			// Save the access token and refresh token in the JWT on the initial login
			if (account) {
				token.access_token = account.access_token ?? '';
				token.expires_at = Math.floor(Date.now() / 1000 + (account.expires_in ?? 0));
				token.refresh_token = account.refresh_token ?? '';
				return token;
			}

			if (Date.now() < token.expires_at * 1000) {
				// If the access token has not expired yet, return it
				return token;
			}

			// If the access token has expired, try to refresh it
			try {
				const { response, tokens } = await refreshSpotifyAccessToken(token);

				if (!response.ok) {
					throw tokens;
				}

				return {
					...token, // Keep the previous token properties
					access_token: tokens.access_token ?? '',
					expires_at: Math.floor(Date.now() / 1000 + (tokens.expires_in ?? 0)),
					// Fall back to old refresh token, but note that
					// many providers may only allow using a refresh token once.
					refresh_token: tokens.refresh_token ?? token.refresh_token
				};
			} catch (error) {
				// The error property will be used client-side to handle the refresh token error
				return { ...token, error: 'RefreshAccessTokenError' as const };
			}
		},
		async session({ session, token }) {
			// Send properties to the client
			session.access_token = token.access_token;
			session.error = token.error;
			return session;
		}
	}
});
