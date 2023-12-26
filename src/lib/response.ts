import { spotifyAuthStateKey, sessionKey, refreshTokenKey } from '$lib/constants';

export const onErrorResponse = (location: string) => {
	return new Response(null, {
		status: 302,
		headers: [
			['Location', location],
			['Set-Cookie', `${sessionKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`],
			['Set-Cookie', `${refreshTokenKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`],
			[
				'Set-Cookie',
				`${spotifyAuthStateKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
			]
		]
	});
};
