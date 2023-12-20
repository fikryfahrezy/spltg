import { Buffer } from 'node:buffer';
import type { RequestHandler } from './$types';
import { SPOTIFY_TOKEN_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { refreshTokenKey } from '$lib/constants';

export const GET: RequestHandler = async ({ cookies }) => {
	const refreshToken = cookies.get(refreshTokenKey);

	if (refreshToken === undefined) {
		return new Response(null, {
			status: 401
		});
	}

	const res = await fetch(SPOTIFY_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken ?? ''
		})
	});

	const body = await res.json();

	return new Response(JSON.stringify(body), {
		status: 200
	});
};
