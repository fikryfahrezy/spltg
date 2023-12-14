import crypto from 'node:crypto';
import type { RequestHandler } from './$types';
import {
	SPOTIFY_AUTHORIZATION_URL,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_AUTH_CALLBACK_PATH
} from '$env/static/private';
import { spotifyAuthStateKey } from '$lib/constants';

function generateRandomString(length: number) {
	return crypto.randomBytes(60).toString('hex').slice(0, length);
}

export const GET: RequestHandler = async ({ url }) => {
	const state = generateRandomString(16);

	// requests authorization
	const redirectURL =
		SPOTIFY_AUTHORIZATION_URL +
		'&' +
		new URLSearchParams({
			response_type: 'code',
			show_dialog: 'true',
			client_id: SPOTIFY_CLIENT_ID,
			redirect_uri: `${url.origin}${SPOTIFY_AUTH_CALLBACK_PATH}`,
			state: state
		});

	return new Response(null, {
		status: 302,
		headers: [
			['Location', redirectURL],
			['Set-Cookie', `${spotifyAuthStateKey}=${state}; path=/; HttpOnly`]
		]
	});
};
