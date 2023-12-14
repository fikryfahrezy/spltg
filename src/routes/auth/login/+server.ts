import crypto from 'node:crypto';
import type { RequestHandler } from './$types';
import {
	SPOTIFY_AUTHORIZATION_URL,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_AUTH_CALLBACK_PATH
} from '$env/static/private';
import { spotifyAuthStateKey, codeVerifierKey } from '$lib/constants';

function generateRandomString(length: number) {
	return crypto.randomBytes(60).toString('hex').slice(0, length);
}

const sha256 = async (plain: string) => {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
	return btoa(String.fromCharCode(...new Uint8Array(input)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
};

export const GET: RequestHandler = async ({ url }) => {
	const state = generateRandomString(16);
	const codeVerifier = generateRandomString(64);

	const hashed = await sha256(codeVerifier);
	const codeChallenge = base64encode(hashed);

	// requests authorization
	const redirectURL =
		SPOTIFY_AUTHORIZATION_URL +
		'&' +
		new URLSearchParams({
			response_type: 'code',
			code_challenge_method: 'S256',
			code_challenge: codeChallenge,
			client_id: SPOTIFY_CLIENT_ID,
			redirect_uri: `${url.origin}${SPOTIFY_AUTH_CALLBACK_PATH}`
		});

	return new Response(null, {
		status: 302,
		headers: [
			['Location', redirectURL],
			['Set-Cookie', `${spotifyAuthStateKey}=${state}; path=/; HttpOnly`],
			['Set-Cookie', `${codeVerifierKey}=${codeVerifier}; path=/; HttpOnly`]
		]
	});
};
