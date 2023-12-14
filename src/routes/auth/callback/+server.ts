import type { RequestHandler } from './$types';
import type { SpotifyAccessTokenResponse } from '../../../types';
import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_TOKEN_URL,
	SPOTIFY_USER_INFO_URL,
	SPOTIFY_AUTH_CALLBACK_PATH
} from '$env/static/private';
import { spotifyAuthStateKey, codeVerifierKey } from '$lib/constants';

export const GET: RequestHandler = async ({ url, cookies }) => {
	// requests refresh and access tokens
	// after checking the state parameter

	const code = url.searchParams.get('code');
	const codeVerifier = cookies.get(codeVerifierKey);

	if (code === null || codeVerifier === undefined) {
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
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				code: code,
				redirect_uri: `${url.origin}${SPOTIFY_AUTH_CALLBACK_PATH}`,
				grant_type: 'authorization_code',
				client_id: SPOTIFY_CLIENT_ID,
				code_verifier: codeVerifier
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
				['Set-Cookie', `access_token=${accessToken.access_token}; path=/; HttpOnly`],
				['Set-Cookie', `refresh_token=${accessToken.refresh_token}; path=/; HttpOnly`],
				[
					'Set-Cookie',
					`${spotifyAuthStateKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
				],
				['Set-Cookie', `${codeVerifierKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`]
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
