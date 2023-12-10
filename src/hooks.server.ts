import { SvelteKitAuth } from '@auth/sveltekit';
import Spotify from '@auth/core/providers/spotify';
import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_AUTHORIZATION
} from '$env/static/private';

export const handle = SvelteKitAuth({
	providers: [
		Spotify({
			clientId: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			authorization: SPOTIFY_AUTHORIZATION
		})
	],
	callbacks: {
		async jwt({ token, account }) {
			// Persist the OAuth access_token to the token right after signin
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			// Send properties to the client, like an access_token from a provider.
			session.accessToken = token.accessToken;
			return session;
		}
	}
});
