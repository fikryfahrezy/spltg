import type { LayoutServerLoad } from './$types';
import { AUTH_SECRET } from '$env/static/private';
import { decode, type JWT } from '$lib/jwt';
import { sessionKey, refreshTokenKey } from '$lib/constants';
import { getToken, type GetTokenReturnType } from '$lib/token';

import type { Session } from '../types/session';

export const load: LayoutServerLoad<{ session: Session | null }> = async ({
	url,
	request,
	cookies
}) => {
	const sessionToken = cookies.get(sessionKey);
	const refreshToken = cookies.get(refreshTokenKey);

	if (sessionToken === undefined || refreshToken === undefined) {
		return {
			session: null
		};
	}

	const sessionPromise = await new Promise<{ error: boolean; value: JWT | null }>((resolve) => {
		decode({
			salt: sessionKey,
			secret: AUTH_SECRET,
			token: sessionToken
		})
			.then((jwt) => {
				resolve({ error: false, value: jwt });
			})
			.catch(() => {
				resolve({ error: true, value: null });
			});
	});

	if (sessionPromise.error) {
		const { jwt, sessionToken } = await getToken({
			type: 'refresh',
			origin: url.origin,
			headers: request.headers,
			prevRefreshToken: refreshToken
		});

		const newSession: Session = {
			email: jwt.email,
			name: jwt.name,
			picture: jwt.picture,
			access_token: jwt.access_token
		};

		cookies.set(sessionKey, sessionToken, {
			path: '/',
			httpOnly: true
		});

		if (typeof jwt.refresh_token === 'string') {
			cookies.set(refreshTokenKey, jwt.refresh_token, {
				path: '/',
				httpOnly: true
			});
		}

		return {
			session: newSession
		};
	}

	const session = sessionPromise.value;

	if (session === null) {
		return {
			session: null
		};
	}

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

	const newToken = await new Promise<
		{ error: false; value: GetTokenReturnType } | { error: true; value: null }
	>((resolve) => {
		getToken({
			type: 'refresh',
			origin: url.origin,
			headers: request.headers,
			prevJWT: session
		})
			.then((token) => {
				resolve({ error: false, value: token });
			})
			.catch(() => {
				resolve({ error: true, value: null });
			});
	});

	if (newToken.error) {
		return {
			session: null
		};
	}

	cookies.set(sessionKey, newToken.value.sessionToken, {
		path: '/',
		httpOnly: true
	});

	const newSession: Session = {
		email: session.email,
		name: session.name,
		picture: session.picture,
		access_token: newToken.value.jwt.access_token
	};

	return {
		session: newSession
	};
};
