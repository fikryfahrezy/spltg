import {
	AUTH_SECRET,
	SPOTIFY_AUTH_REFRESH_TOKEN_PATH,
	SPOTIFY_USER_INFO_URL,
	SPOTIFY_TOKEN_URL,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_AUTH_CALLBACK_PATH
} from '$env/static/private';
import { encode, type JWT } from '$lib/jwt';
import { sessionKey } from '$lib/constants';
import type { SpotifyAccessTokenResponse, SpotifyCurrentProfile } from '../types/spotify';

type GetTokenFreshTokenParams = {
	type: 'fresh';
	code: string;
};

type GetTokenRereshtokenParamsJWT = {
	prevJWT: JWT;
	prevRefreshToken?: undefined;
};

type GetTokenRereshTokenParamsPrev = {
	prevJWT?: undefined;
	prevRefreshToken: string;
};

type GetTokenRereshTokenParams = (GetTokenRereshtokenParamsJWT | GetTokenRereshTokenParamsPrev) & {
	type: 'refresh';
	headers: Headers;
};

type GetTokenParams = (GetTokenFreshTokenParams | GetTokenRereshTokenParams) & {
	origin: string;
};

export type GetTokenReturnType = {
	sessionToken: string;
	jwt: JWT;
};

export async function getToken(params: GetTokenParams): Promise<GetTokenReturnType> {
	const res = await (params.type === 'fresh'
		? fetch(SPOTIFY_TOKEN_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization:
						'Basic ' +
						Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
				},
				body: new URLSearchParams({
					code: params.code,
					redirect_uri: `${params.origin}${SPOTIFY_AUTH_CALLBACK_PATH}`,
					grant_type: 'authorization_code'
				})
		  })
		: fetch(`${params.origin}${SPOTIFY_AUTH_REFRESH_TOKEN_PATH}`, {
				headers: params.headers
		  }));

	const accessToken: SpotifyAccessTokenResponse = await res.json();

	let jwt: JWT = {};
	if (params.type === 'refresh' && params.prevJWT !== undefined) {
		jwt = {
			name: params.prevJWT?.name,
			email: params.prevJWT?.email,
			picture: params.prevJWT?.picture,
			exp: accessToken.expires_in,
			access_token: accessToken.access_token,
			refresh_token: accessToken.refresh_token ?? params.prevJWT.refresh_token
		};
	} else {
		const profileResponse = await fetch(SPOTIFY_USER_INFO_URL, {
			headers: {
				Authorization: 'Bearer ' + accessToken.access_token
			}
		});

		const userInfo: SpotifyCurrentProfile = await profileResponse.json();

		const newRefreshToken =
			params.type === 'refresh' && params.prevRefreshToken !== undefined
				? accessToken.refresh_token ?? params.prevRefreshToken
				: accessToken.refresh_token;

		jwt = {
			name: userInfo?.display_name ?? null,
			email: userInfo?.email ?? null,
			picture: userInfo?.images?.[0]?.url ?? null,
			exp: accessToken.expires_in,
			access_token: accessToken.access_token,
			refresh_token: newRefreshToken
		};
	}

	const sessionToken = await encode({
		salt: sessionKey,
		secret: AUTH_SECRET,
		maxAge: accessToken.expires_in,
		token: jwt
	});

	return { sessionToken, jwt };
}
