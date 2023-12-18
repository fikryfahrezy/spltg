import { Buffer } from 'node:buffer';
import type { RequestHandler } from './$types';
import {
	AUTH_SECRET,
	SPOTIFY_TOKEN_URL,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET
} from '$env/static/private';
import { sessionKey } from '$lib/constants';
import { decode } from '$lib/jwt';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionToken = cookies.get(sessionKey);

	if (sessionToken === undefined) {
		return new Response(null, {
			status: 401
		});
	}

	const session = await decode({
		salt: sessionKey,
		secret: AUTH_SECRET,
		token: sessionToken
	});

	const res = await fetch(SPOTIFY_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: session?.refresh_token ?? ''
		})
	});

	const body = await res.json();

	return new Response(JSON.stringify(body), {
		status: 200
	});
};
