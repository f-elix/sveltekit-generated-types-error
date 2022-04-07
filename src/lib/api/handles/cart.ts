import type { Handle } from '@sveltejs/kit';
import { isInvalidPath } from '../utils';

const invalidPaths = [
	'entry.json',
	'globals.json',
	'contact-form.json',
	'/api/auth',
	'/api/account'
];

export const cart: Handle = async ({ event, resolve }) => {
	const { url } = event;
	if (isInvalidPath(url.pathname, invalidPaths)) {
		return resolve(event);
	}
	return resolve(event);
};
