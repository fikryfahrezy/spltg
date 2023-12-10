import crypto from 'node:crypto';
import type { RequestHandler } from './$types';
import { SPOTIFY_AUTHORIZATION_URL, SPOTIFY_CLIENT_ID } from '$env/static/private';
import { spotifyAuthStateKey, spotifyAuthCallbackPath } from '$lib/constants';

function generateRandomString(length: number) {
	return crypto.randomBytes(60).toString('hex').slice(0, length);
}

export const GET: RequestHandler = ({ url }) => {
	const state = generateRandomString(16);

	// requests authorization
	const redirectURL =
		SPOTIFY_AUTHORIZATION_URL +
		'&' +
		new URLSearchParams({
			response_type: 'code',
			client_id: SPOTIFY_CLIENT_ID,
			redirect_uri: `${url.origin}${spotifyAuthCallbackPath}`,
			state: state
		});

	return new Response(null, {
		status: 302,
		headers: {
			Location: redirectURL,
			'Set-Cookie': `${spotifyAuthStateKey}=${state}; path=/`
		}
	});
};
