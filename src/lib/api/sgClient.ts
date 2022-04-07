import type { Product } from 'src/global';
import client from '@sendgrid/client';
client.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY as string);

const getExistingContact = async (email: string) => {
	try {
		const [, existingContactBody] = await client.request({
			method: 'POST',
			url: '/v3/marketing/contacts/search/emails',
			body: {
				emails: [email]
			}
		});
		return existingContactBody[email.toLowerCase()];
	} catch {
		return null;
	}
};

export const addEmailToList = async (product: Product, email: string) => {
	const { confirmationMailingListId } = product;
	try {
		const contact = await getExistingContact(email);
		await client.request({
			method: 'PUT',
			url: '/v3/marketing/contacts',
			body: {
				contacts: [{ email }],
				list_ids: contact
					? [...new Set([...contact.list_ids, confirmationMailingListId])]
					: [confirmationMailingListId]
			}
		});
	} catch (error) {
		console.error(error);
	}
};
