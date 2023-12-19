export type AccessTokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
};

export type SpotifyAccessTokenResponse = AccessTokenResponse & {
	scope: string;
};

export type ExplicitContent = {
	filter_enabled: boolean;
	filter_locked: boolean;
};

export type ExternalUrls = {
	spotify: string;
};

export type Followers = {
	href: string;
	total: number;
};

export type Image = {
	url: string;
	height: number;
	width: number;
};

export type SpotifyCurrentProfile = {
	country: string;
	display_name: string;
	email: string;
	explicit_content: ExplicitContent;
	external_urls: ExternalUrls;
	followers: Followers;
	href: string;
	id: string;
	images: Image[];
	product?: string;
	type: string;
	uri: string;
};
