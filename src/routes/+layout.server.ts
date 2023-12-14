import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, request, cookies }) => {
	const res = await fetch(`${url.origin}/auth/session`, { headers: request.headers });
	const session = await res.json();

	return {
		session: session,
		access_token: cookies.get('access_token')
	};
};
