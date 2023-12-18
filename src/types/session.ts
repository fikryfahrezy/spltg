import type { DefaultJWT as OriginalDefaultJWT } from '$lib/jwt';

declare module '$lib/jwt' {
	interface DefaultJWT extends OriginalDefaultJWT {
		access_token?: string | null;
		refresh_token?: string | null;
	}
}

export type Session = {
	email?: string | null;
	name?: string | null;
	picture?: string | null;
	access_token?: string | null;
};
