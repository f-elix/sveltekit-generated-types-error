import Stripe from 'stripe';

export const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27'
});

export const checkIfValidStripeCustomer = async (
	customerId: string
): Promise<Stripe.Customer | false> => {
	if (!customerId) {
		return false;
	}
	try {
		const customer = await stripe.customers.retrieve(customerId, {
			expand: ['subscriptions']
		});
		if (!customer || customer.deleted) {
			return false;
		}
		const existingCustomer = customer as Stripe.Customer;
		const subscriptions = existingCustomer.subscriptions?.data.filter(
			(sub) => sub.status === 'active'
		);
		if (subscriptions.length === 0) {
			return false;
		}
		return existingCustomer;
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const getInvoice = async (customerId: string, subId: string) => {
	try {
		const invoice = await stripe.invoices.retrieveUpcoming({
			customer: customerId,
			subscription: subId
		});
		return invoice;
	} catch (error) {
		return null;
	}
};
