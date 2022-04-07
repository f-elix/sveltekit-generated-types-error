import type { IProductFields } from 'src/contentful';
import type {
	Cart,
	CartBase,
	Discount,
	Order,
	Product,
	ProductData,
	ProductOption
} from 'src/global';
import { Country, SHIPPING_RATES } from '$lib/constants';

export const getProductFinalPrice = (fields: IProductFields) => {
	const { price, salePrice } = fields;
	if (salePrice && salePrice < price) {
		return salePrice;
	}
	return price;
};

export const getCartItemTotal = (item: Product) => {
	const { price, qty } = item;
	if (qty && typeof qty === 'number') {
		return Number(price) * qty;
	}
	return Number(price);
};

export const formatProduct = (product: ProductData): Product => {
	const options = Object.entries(product)
		.filter(([key]) => key.startsWith('option-'))
		.map(([, value]) => JSON.parse(value as string));
	const image = JSON.parse(product.image);
	return {
		id: product.id,
		uid: product.uid,
		qty: Number(product.qty) || false,
		slug: product.slug,
		name: product.name,
		price: product.price,
		type: product.type,
		confirmationMailingListId: product.confirmationMailingListId,
		options,
		image
	};
};

const hasSameOptions = (product: Product, options: ProductOption[]): boolean => {
	return options?.every((option, i) => option.id === product.options[i].id);
};

const getExistingProduct = (currentProducts: Product[], newProduct: Product) => {
	if (!currentProducts) {
		return;
	}
	const similarProducts = currentProducts.filter((p) => {
		return p.id === newProduct.id;
	});
	if (!similarProducts.length) {
		return;
	}
	return similarProducts.find((similarProduct) =>
		hasSameOptions(newProduct, similarProduct.options)
	);
};

export const addProduct = (
	newProduct: ProductData,
	currentProducts?: Product[]
): { products: Product[]; changed: boolean } => {
	const result = {
		products: currentProducts,
		changed: false
	};
	const formattedProduct = formatProduct(newProduct);
	if (!currentProducts) {
		result.products = [formattedProduct];
		result.changed = true;
		return result;
	}
	const existingProduct = getExistingProduct(currentProducts, formattedProduct);
	if (existingProduct && !existingProduct.qty) {
		return result;
	}
	if (typeof existingProduct?.qty === 'number') {
		existingProduct.qty += 1;
		result.changed = true;
		return result;
	}
	result.products = [...currentProducts, formattedProduct];
	result.changed = true;
	return result;
};

export const updateProductQty = (allProducts: Product[], uid: string, qty: Product['qty']) => {
	if (qty === 0) {
		return allProducts.filter((p) => p.uid !== uid);
	}
	const product = allProducts.find((p) => p.uid === uid);
	if (product && typeof product.qty === 'number') {
		product.qty = qty;
	}
	return allProducts;
};

export const getCartItemsCount = (products?: Product[]) => {
	if (!products || !products.length) {
		return 0;
	}
	return products.reduce((count, p) => {
		const qty = p.qty ? p.qty : 1;
		return (count += qty);
	}, 0);
};

export const getCartSubTotal = (products?: Product[]) => {
	if (!products) {
		return 0;
	}
	return products.reduce((subTotal, product) => {
		const itemTotal = getCartItemTotal(product);
		return subTotal + itemTotal;
	}, 0);
};

export const getUpdatedDiscounts = (
	allDiscounts: Discount[] = [],
	newDiscount: Discount
): {
	discounts: Discount[];
	duplicate: boolean;
} => {
	if (!allDiscounts?.length) {
		return {
			discounts: [newDiscount],
			duplicate: false
		};
	}
	const duplicates = [];
	allDiscounts.forEach((discount) => {
		if (discount.code === newDiscount.code) {
			duplicates.push(discount);
		}
	});
	if (duplicates.length > 0) {
		return { discounts: allDiscounts, duplicate: true };
	}
	return {
		discounts: [...allDiscounts, newDiscount],
		duplicate: false
	};
};

export const getCartDiscount = (cart: CartBase, subTotal: number) => {
	const discounts = cart?.discounts;
	if (!discounts) {
		return 0;
	}
	const computedAmounts = discounts.map((discount) => {
		let amount = 0;
		// If discount code applies to everything, not only one product
		if (!discount.productId) {
			amount = (subTotal * discount.percentOff) / 100;
			return amount;
		}
		// If discount codes applies to one product only
		const purchasedProduct = cart.products.find((p) => p.id === discount.productId);
		if (!purchasedProduct) {
			return amount;
		}
		const qty = purchasedProduct.qty || 1;
		amount = (purchasedProduct.price * qty * discount.percentOff) / 100;
		return amount;
	});
	const discountAmount = computedAmounts.reduce((discount, amount) => discount + amount, 0);
	return discountAmount;
};

export const getRequireShipping = (products: Product[]) =>
	products.some((p) => p.type === 'Physical');

export const generateOrder = (cart: Cart, country: Country = Country.canada): Order => {
	const { products } = cart;
	const subTotal = getCartSubTotal(products);
	const discount = getCartDiscount(cart, subTotal);
	const requireShipping = getRequireShipping(cart.products);
	const shipping = requireShipping ? SHIPPING_RATES[country] : 0;
	const taxes = 0;
	const total = subTotal - discount + shipping + taxes;
	return {
		country,
		discount,
		subTotal,
		requireShipping,
		shipping,
		taxes,
		total
	};
};
