import type { LayoutServerLoad } from './$types';
import { AUTH_SECRET, SPOTIFY_AUTH_REFRESH_TOKEN_PATH } from '$env/static/private';
import { encode, decode } from '$lib/jwt';
import { sessionKey } from '$lib/constants';
import type { Session } from '../types/session';
import type { SpotifyAccessTokenResponse } from '../types/spotify';

export const load: LayoutServerLoad<{ session: Session | null }> = async ({
	url,
	request,
	cookies
}) => {
	const sessionToken = cookies.get(sessionKey);

	if (sessionToken === undefined) {
		return {
			session: null
		};
	}

	const session = await decode({
		salt: sessionKey,
		secret: AUTH_SECRET,
		token: sessionToken
	});

	if (session === null) {
		return {
			session: null
		};
	}

	try {
		if (session.exp !== undefined && Date.now() < session.exp * 1000) {
			return {
				session: {
					email: session.email,
					name: session.name,
					picture: session.picture,
					access_token: session.access_token
				}
			};
		}

		const res = await fetch(`${url.origin}${SPOTIFY_AUTH_REFRESH_TOKEN_PATH}`, {
			headers: request.headers
		});
		const newAccessToken: SpotifyAccessTokenResponse = await res.json();

		const newSessionToken = await encode({
			salt: sessionKey,
			secret: AUTH_SECRET,
			maxAge: newAccessToken.expires_in,
			token: {
				name: session?.name,
				email: session?.email,
				picture: session?.picture,
				exp: newAccessToken.expires_in,
				access_token: newAccessToken.access_token,
				refresh_token: newAccessToken.refresh_token ?? session.refresh_token
			}
		});

		cookies.set(sessionKey, newSessionToken, {
			path: '/',
			httpOnly: true
		});

		const newSession: Session = {
			email: session.email,
			name: session.name,
			picture: session.picture,
			access_token: newAccessToken.access_token
		};

		return {
			session: newSession
		};
	} catch (e) {
		return {
			session: null
		};
	}
};
