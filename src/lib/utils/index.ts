import type { IPage } from 'src/contentful';
import type { Locale } from 'src/global';
import { supportedLanguages } from '$lib/constants';

export * from './cart';
export * from './articles';
export * from './forms';
export * from './dates';

export const autoUrl = (link: IPage) => {
	const locale = link.sys.locale.split('-')[0];
	return `/${locale}/${link.fields.slug}`;
};

export const getAltLocale = (currentLocale: Locale) =>
	supportedLanguages.find((lang) => lang !== currentLocale);

export const formatPrice = (priceInCents: number) => {
	const amount = priceInCents / 100;
	return `$${amount.toFixed(2)}`;
};

export const reducedMotion = () => {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion)').matches;
};

export const textToId = (text: string) => {
	if (!text?.trim()) {
		return '';
	}
	return text
		.toLowerCase()
		.replace(/[^-\s0-9a-zA-ZÀ-ÿ]/g, '-') // Replace non-word characters with dashes
		.replace(/-/g, ' ') // Replace dashes with spaces
		.replace(/\s{2,}/g, ' ') // Remove extra spaces
		.replace(/\s/g, '-'); // Replace spaces with dashes
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
