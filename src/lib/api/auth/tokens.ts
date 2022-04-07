import { baseCookieOptions, Cookies } from '$lib/constants';
import crypto from 'crypto';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const JWTSignature = import.meta.env.VITE_JWT_SIGNATURE;

const createTokens = async (sessionToken: string, userId: string) => {
	try {
		// Create refresh token
		// 		Session id
		const refreshToken = jwt.sign({ sessionToken }, JWTSignature);
		// Create access token
		// 		Session id, user id
		const accessToken = jwt.sign({ sessionToken, userId }, JWTSignature);
		// Return tokens
		return { refreshToken, accessToken };
	} catch (err) {
		console.error(err);
	}
};

export const refreshTokens = async (sessionToken: string, userId: string): Promise<string[]> => {
	// Create JWTs
	const { accessToken, refreshToken } = await createTokens(sessionToken, userId);
	// Serialize cookies
	const cookies = [
		cookie.serialize(Cookies.access, accessToken, {
			...baseCookieOptions,
			maxAge: 60 * 60 * 4 // 4 hours
		}),
		cookie.serialize(Cookies.refresh, refreshToken, {
			...baseCookieOptions,
			maxAge: 60 * 60 * 24 * 7 * 12 // 3 months
		})
	];
	return cookies;
};

export const createResetPasswordToken = (email: string, timestamp: string) => {
	// Create auth string including JWT signature and email
	const authString = `${JWTSignature}:${email}:${timestamp}`;
	// Generate token from auth string
	const token = crypto.createHash('sha256').update(authString).digest('hex');
	return token;
};
