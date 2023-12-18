import type { LayoutServerLoad } from './$types';
import { AUTH_SECRET } from '$env/static/private';
import { decode } from '$lib/jwt';
import { sessionKey } from '$lib/constants';
import type { Session } from '../types/session';

export const load: LayoutServerLoad<{ session: Session | null }> = async ({ cookies }) => {
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

	return {
		session: {
			access_token: session?.access_token,
			email: session?.email,
			name: session?.name,
			picture: session?.picture
		}
	};
};
