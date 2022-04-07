import type { ClientUserData } from 'src/global';
import { randomBytes } from 'crypto';
import { hasuraFetch } from '$lib/api/hasura';

export const createSession = async (
	userId: string,
	userAgent: string
): Promise<{ sessionToken: string; user: ClientUserData }> => {
	const sessionToken = randomBytes(43).toString('hex');
	const query = `
		mutation createSession(
			$sessionToken: String!
			$userId: String!
			$valid: Boolean!
			$userAgent: String!
			$createdAt: date!
			$updatedAt: date!
		) {
			insert_session_one(
				object: {
					sessionToken: $sessionToken
					userId: $userId
					valid: $valid
					userAgent: $userAgent
					createdAt: $createdAt
					updateAt: $updatedAt
				}
			) {
				user {
					email
					name
					userId
					stripeId
				}
			}
		}
	`;
	const variables = {
		sessionToken,
		userId,
		valid: true,
		userAgent,
		updatedAt: new Date(),
		createdAt: new Date()
	};
	const { data, errors } = await hasuraFetch(query, variables);
	if (errors) {
		console.error(errors);
		const message = errors.map((e) => e.message).join('\n');
		throw new Error(message);
	}
	const { user } = data.insert_session_one;
	return { sessionToken, user };
};

const deleteSession = async (sessionToken: string) => {
	const query = `
		mutation deleteSession($sessionToken: String!) {
			delete_session_by_pk(sessionToken: $sessionToken) {
				sessionToken
			}
		}
	`;
	const variables = {
		sessionToken
	};
	return hasuraFetch(query, variables);
};

export const getExistingSession = async (
	userId: string
): Promise<{ sessionToken: string; user: ClientUserData } | undefined> => {
	const query = `
		query getSessionByUserId($userId: String!) {
			session(where: { userId: { _eq: $userId } }) {
				sessionToken
				valid
			}
		}
	`;
	const variables = {
		userId
	};
	const { data, errors } = await hasuraFetch(query, variables);
	if (errors) {
		console.error(errors);
		const message = errors.map((e) => e.message).join('\n');
		throw new Error(message);
	}
	const [session] = data.session;
	if (session && !session.valid) {
		await deleteSession(session.sessionToken);
		return;
	}
	return session;
};
