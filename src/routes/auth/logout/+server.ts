import type { RequestHandler } from './$types';
import { sessionKey } from '$lib/constants';

export const GET: RequestHandler = async ({ url }) => {
	return new Response(null, {
		status: 302,
		headers: [
			['Location', url.origin],
			['Set-Cookie', `${sessionKey}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`]
		]
	});
};
