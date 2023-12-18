import type { RequestHandler } from './$types';
import { AUTH_SECRET } from '$env/static/private';
import { sessionKey } from '$lib/constants';
import { decode } from '$lib/jwt';
import type { Session } from '../../../types/session';

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

	const sessionResponse: Session = {
		email: session?.email,
		name: session?.name,
		picture: session?.picture,
		access_token: session?.access_token
	};

	return new Response(JSON.stringify(sessionResponse), {
		status: 200,
		headers: [['Content-Type', 'application/json']]
	});
};
