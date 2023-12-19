import { Buffer } from 'node:buffer';
import type { RequestHandler } from './$types';
import type { SpotifyAccessTokenResponse, SpotifyCurrentProfile } from '../../../types/spotify';
import {
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_TOKEN_URL,
	SPOTIFY_USER_INFO_URL,
	SPOTIFY_AUTH_CALLBACK_PATH,
	AUTH_SECRET
} from '$env/static/private';
import { spotifyAuthStateKey, sessionKey } from '$lib/constants';
import { encode } from '$lib/jwt';

const onErrorResponse = (origin: string) => {
	return new Response(null, {
		status: 302,
		headers: [
			['Location', `${origin}/error`], // TODO: implement error page
			['Set-Cookie', `${sessionKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`],
			[
				'Set-Cookie',
				`${spotifyAuthStateKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
			]
		]
	});
};

export const GET: RequestHandler = async ({ url, cookies }) => {
	// requests refresh and access tokens
	// after checking the state parameter

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get(spotifyAuthStateKey);

	if (code === null || state === null || state !== storedState) {
		return onErrorResponse(url.origin);
	}

	try {
		const accessTokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
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
		});

		const accessToken: SpotifyAccessTokenResponse = await accessTokenResponse.json();

		const profileResponse = await fetch(SPOTIFY_USER_INFO_URL, {
			headers: {
				Authorization: 'Bearer ' + accessToken.access_token
			}
		});

		const userInfo: SpotifyCurrentProfile = await profileResponse.json();

		const sessionToken = await encode({
			salt: sessionKey,
			secret: AUTH_SECRET,
			maxAge: accessToken.expires_in,
			token: {
				name: userInfo?.display_name ?? null,
				email: userInfo?.email ?? null,
				picture: userInfo?.images?.[0]?.url ?? null,
				exp: accessToken.expires_in,
				access_token: accessToken.access_token,
				refresh_token: accessToken.refresh_token
			}
		});

		return new Response(null, {
			status: 302,
			headers: [
				['Location', url.origin],
				['Set-Cookie', `${sessionKey}=${sessionToken}; path=/; HttpOnly`],
				[
					'Set-Cookie',
					`${spotifyAuthStateKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
				]
			]
		});
	} catch (error) {
		return onErrorResponse(url.origin);
	}
};
