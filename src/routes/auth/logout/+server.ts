import type { RequestHandler } from './$types';
import { onErrorResponse } from '$lib/response';

export const GET: RequestHandler = async ({ url }) => {
	return onErrorResponse(url.origin);
};
