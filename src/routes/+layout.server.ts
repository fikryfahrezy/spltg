import type { LayoutServerLoad } from './$types';
import type { Session } from '../types/session';

export const load: LayoutServerLoad = async ({ url, request }) => {
	const res = await fetch(`${url.origin}/auth/session`, { headers: request.headers })
		.then((res) => {
			return res.json() as Session;
		})
		.then((session) => {
			return {
				session: session
			};
		})
		.catch(() => {
			return {
				session: null
			};
		});

	return res;
};
