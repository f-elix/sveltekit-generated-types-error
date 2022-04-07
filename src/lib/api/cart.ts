import type { RequestEvent } from '@sveltejs/kit/types/internal';
import type { Cart } from 'src/global';
import cookie from 'cookie';
import { Cookies } from '$lib/constants';
import { hasuraFetch } from '$lib/api/hasura';

export const getCartFromCookies = async (event: RequestEvent): Promise<Cart> => {
	const { request } = event;
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const cartId = cookies[Cookies.cart];
	if (!cartId) {
		return;
	}
	const query = `
	query getCartById($id: String!) {
		cart_by_pk(id: $id) {
		  id
		  locale
		  products
		  discounts
		  paymentId
		}
	  }`;
	const variables = {
		id: cartId
	};
	try {
		const { data, errors } = await hasuraFetch(query, variables);
		const cart = data?.cart_by_pk as Cart;
		if (errors) {
			console.error(errors);
			const message = errors.map((e) => e.message).join('\n');
			throw new Error(message);
		}
		return cart;
	} catch (error) {
		console.error(error);
		return;
	}
};
