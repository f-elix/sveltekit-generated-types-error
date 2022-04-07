import type { AuthenticationData, ClientUserData, ActionData } from 'src/global';
import type { RequestEvent } from '@sveltejs/kit/types/internal';
import type { RequestHandlerOutput } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { hasuraFetch } from '$lib/api/hasura';
import { Cookies } from '$lib/constants';
import { refreshTokens } from './tokens';
import { createSession, getExistingSession } from './session';

const { compare } = bcrypt;

const JWTSignature = import.meta.env.VITE_JWT_SIGNATURE;

const getUserById = async (userId: string): Promise<ClientUserData> => {
	const { errors, data } = await hasuraFetch(
		`
			query getUserById($userId: String!) {
				user_by_pk(userId: $userId) {
					email
					name
					userId
					stripeId
				}
			}
		`,
		{
			userId
		}
	);
	if (errors) {
		console.error(errors);
		const message = errors.map((e) => e.message).join('\n');
		throw new Error(message);
	}
	return data.user_by_pk;
};

export const getUserByEmail = async (
	email: string
): Promise<{ userId: string; password: string } | undefined> => {
	const query = `
		query getUserByEmail($email: String!) {
			user(where: { email: { _eq: $email } }) {
				password
				userId
			}
		}
	`;
	const variables = {
		email
	};
	const { errors, data } = await hasuraFetch(query, variables);
	if (errors) {
		console.error(errors);
		const message = errors.map((e) => e.message).join('\n');
		throw new Error(message);
	}
	return data.user[0];
};

export const authorizeUser = async (
	email: string,
	password: string
): Promise<{ isAuthorized: boolean; userId: string | null }> => {
	try {
		const user = await getUserByEmail(email);
		if (!user) {
			return {
				userId: null,
				isAuthorized: false
			};
		}
		const isAuthorized = await compare(password, user.password);
		return {
			isAuthorized,
			userId: user.userId
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const checkIfUserExists = async (
	email: string
): Promise<ReturnType<typeof getUserByEmail> | false> => {
	try {
		return getUserByEmail(email);
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const getUserFromCookies = async (
	event: RequestEvent
): Promise<{ user: ClientUserData | null; cookies: string[] | null }> => {
	const { request } = event;
	try {
		const response = {
			user: null,
			cookies: null
		};
		const cookies = cookie.parse(request.headers.get('cookie') || '');
		// Check if access token exist
		if (cookies[Cookies.access]) {
			// If access token --
			const accessToken = cookies[Cookies.access];
			// Decode access token
			const { userId } = jwt.verify(accessToken, JWTSignature) as jwt.JwtPayload;
			// Return user from db
			const user = await getUserById(userId);
			response.user = user;
			return response;
		}
		if (cookies[Cookies.refresh]) {
			const refreshToken = cookies[Cookies.refresh];
			// Decode refresh token
			const { sessionToken } = jwt.verify(refreshToken, JWTSignature) as jwt.JwtPayload;
			// Look up session
			const { errors, data } = await hasuraFetch(
				`
					query getSessionByToken($sessionToken: String!) {
						session_by_pk(sessionToken: $sessionToken) {
							valid
							user {
								email
								name
								userId
								stripeId
							}
						}
					}
				`,
				{
					sessionToken
				}
			);
			if (errors) {
				console.error(errors);
				const message = errors.map((e) => e.message).join('\n');
				throw new Error(message);
			}
			const currentSession = data.session_by_pk;
			// Confirm session is valid
			if (currentSession?.valid) {
				// return current user
				response.user = currentSession.user;
				response.cookies = await refreshTokens(sessionToken, currentSession.user.userId);
				return response;
			}
		}
		return response;
	} catch (error) {
		console.error(error);
		return { user: null, cookies: null };
	}
};

export const logUserIn = async (
	userId: string,
	event: RequestEvent
): Promise<RequestHandlerOutput<ActionData<AuthenticationData>>> => {
	const { routes, t } = event.locals;
	try {
		// Check for existing session first
		let session = await getExistingSession(userId);
		if (!session) {
			session = await createSession(userId, event.request.headers.get('user-agent'));
		}
		const { sessionToken } = session;
		const cookies = await refreshTokens(sessionToken, userId);
		return {
			status: 303,
			headers: {
				'set-cookie': cookies,
				location: routes.account
			}
		};
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			body: { message: t('loginFailed'), errors: {} }
		};
	}
};
