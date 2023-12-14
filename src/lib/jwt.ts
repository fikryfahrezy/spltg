// Copy from:
// https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/jwt.ts

import { hkdf } from '@panva/hkdf';
import { EncryptJWT, jwtDecrypt } from 'jose';

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const now = () => (Date.now() / 1000) | 0;

export interface DefaultJWT extends Record<string, unknown> {
	name?: string | null;
	email?: string | null;
	picture?: string | null;
	sub?: string;
	iat?: number;
	exp?: number;
	jti?: string;
}

export interface JWT extends Record<string, unknown>, DefaultJWT {}

export interface JWTEncodeParams<Payload = JWT> {
	maxAge?: number;
	salt: string;
	secret: string;
	token?: Payload;
}

export interface JWTDecodeParams {
	/** Used in combination with `secret`, to derive the encryption secret for JWTs. */
	salt: string;
	/** Used in combination with `salt`, to derive the encryption secret for JWTs. */
	secret: string;
	/** The Auth.js issued JWT to be decoded */
	token?: string;
}

async function getDerivedEncryptionKey(
	keyMaterial: Parameters<typeof hkdf>[1],
	salt: Parameters<typeof hkdf>[2]
) {
	return await hkdf('sha256', keyMaterial, salt, `Auth.js Generated Encryption Key (${salt})`, 32);
}

export async function encode<Payload = JWT>(params: JWTEncodeParams<Payload>) {
	const { token = {}, secret, maxAge = DEFAULT_MAX_AGE, salt } = params;
	const encryptionSecret = await getDerivedEncryptionKey(secret, salt);
	// @ts-expect-error `jose` allows any object as payload.
	return await new EncryptJWT(token)
		.setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
		.setIssuedAt()
		.setExpirationTime(now() + maxAge)
		.setJti(crypto.randomUUID())
		.encrypt(encryptionSecret);
}

/** Decodes a Auth.js issued JWT. */
export async function decode<Payload = JWT>(params: JWTDecodeParams): Promise<Payload | null> {
	const { token, secret, salt } = params;
	if (!token) return null;
	const encryptionSecret = await getDerivedEncryptionKey(secret, salt);
	const { payload } = await jwtDecrypt(token, encryptionSecret, {
		clockTolerance: 15
	});
	return payload as Payload;
}
