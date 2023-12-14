import type { RequestHandler } from './$types';
import { AUTH_SECRET } from '$env/static/private';
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

	return new Response(
		JSON.stringify({
			email: session?.email,
			name: session?.name,
			picture: session?.picture
		}),
		{
			status: 200,
			headers: [['Content-Type', 'application/json']]
		}
	);
};
