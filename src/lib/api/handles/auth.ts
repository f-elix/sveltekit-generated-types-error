import type { Handle } from '@sveltejs/kit';

export const auth: Handle = async ({ event, resolve }) => {
	const { url } = event;
	// Verify authentication and get user
	const response = await resolve(event);

	return response;
};
