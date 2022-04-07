import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { lang, auth, cart } from '$lib/api/handles';

export const handle: Handle = sequence(lang, auth, cart);
