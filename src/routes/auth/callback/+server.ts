import { Buffer } from 'node:buffer';
import type { RequestHandler } from './$types';
import type { SpotifyAccessTokenResponse } from '../../../types';
import {
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_TOKEN_URL,
	SPOTIFY_USER_INFO_URL,
	SPOTIFY_AUTH_CALLBACK_PATH
} from '$env/static/private';
import { spotifyAuthStateKey } from '$lib/constants';

export const GET: RequestHandler = async ({ url, cookies }) => {
	// requests refresh and access tokens
	// after checking the state parameter

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get(spotifyAuthStateKey);

	if (code === null || state === null || state !== storedState) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: `${url.origin}/error` // TODO: implement error page
			}
		});
	}

	try {
		const { accessToken } = await fetch(SPOTIFY_TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
			},
			body: new URLSearchParams({
				code: code,
				redirect_uri: `${url.origin}${SPOTIFY_AUTH_CALLBACK_PATH}`,
				grant_type: 'authorization_code'
			})
		})
			.then((res) => {
				return res.json() as Promise<SpotifyAccessTokenResponse>;
			})
			.then((accessToken) => {
				return Promise.all([
					accessToken,
					fetch(SPOTIFY_USER_INFO_URL, {
						headers: {
							Authorization: 'Bearer ' + accessToken.access_token
						}
					})
				]);
			})
			.then(([accessToken, res]) => {
				return Promise.all([accessToken, res.json()]);
			})
			.then(([accessToken, userInfo]) => {
				return { accessToken, userInfo };
			});

		return new Response(null, {
			status: 302,
			headers: [
				['Location', url.origin],
				['Set-Cookie', `access_token=${accessToken}; path=/`],
				['Set-Cookie', `refresh_token=${accessToken}; path=/`],
				[
					'Set-Cookie',
					`${spotifyAuthStateKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
				]
			]
		});
	} catch (error) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: `${url.origin}/error` // TODO: implement error page
			}
		});
	}
};
