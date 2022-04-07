import type { Handle } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit/types/internal';

const getLangFromRequest = (event: RequestEvent): Locale => {
	return 'en';
};

export const lang: Handle = async ({ event, resolve }) => {
	// Get user language
	const language = getLangFromRequest(event);
	// Resolve event
	const response = await resolve(event, {
		// Output correct html lang attribute
		transformPage: ({ html }) => html.replace('<html lang="en"', `<html lang="${language}"`)
	});
	return response;
};
