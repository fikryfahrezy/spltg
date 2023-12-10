export type AccessTokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: 3600;
	refresh_token: string;
};

export type SpotifyAccessTokenResponse = AccessTokenResponse & {
	scope: string;
};
