import type { JWT as DefaultJWT } from '@auth/core/jwt';
import type { DefaultSession } from '@auth/core/types';

declare module '@auth/core/types' {
	interface Session extends DefaultSession {
		access_token: string;
		error?: 'RefreshAccessTokenError';
	}
}

declare module '@auth/core/jwt' {
	interface JWT extends DefaultJWT {
		access_token: string;
		expires_at: number;
		refresh_token: string;
		error?: 'RefreshAccessTokenError';
	}
}
