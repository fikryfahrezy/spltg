import type { LayoutServerLoad } from './$types';
import type { Session } from '../types/session';

export const load: LayoutServerLoad = async ({ url, request, cookies }) => {
	const res = await fetch(`${url.origin}/auth/session`, { headers: request.headers })
		.then((res) => {
			return res.json() as Session;
		})
		.then((session) => {
			return {
				session: session,
				access_token: cookies.get('access_token')
			};
		})
		.catch(() => {
			return {
				session: null,
				access_token: null
			};
		});

	return res;
};
