import type { RequestHandler } from './$types';
import { spotifyAuthStateKey, sessionKey, refreshTokenKey } from '$lib/constants';
import { getToken } from '$lib/token';

const onErrorResponse = (origin: string) => {
	return new Response(null, {
		status: 302,
		headers: [
			['Location', `${origin}/error`], // TODO: implement error page
			['Set-Cookie', `${sessionKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`],
			['Set-Cookie', `${refreshTokenKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`],
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
		const { jwt, sessionToken } = await getToken({
			type: 'fresh',
			code: code,
			origin: url.origin
		});

		return new Response(null, {
			status: 302,
			headers: [
				['Location', url.origin],
				['Set-Cookie', `${sessionKey}=${sessionToken}; path=/; HttpOnly`],
				['Set-Cookie', `${refreshTokenKey}=${jwt.refresh_token}; path=/; HttpOnly`],
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
