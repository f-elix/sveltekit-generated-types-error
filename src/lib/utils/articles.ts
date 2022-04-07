import type { Document } from '@contentful/rich-text-types';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

export const computeRichText = (text: Document) =>
	documentToHtmlString(text).replace(/<[^/>][^>]*><\/[^>]+>/g, ''); // Removes empty tags

export const removeEmptyTags = (text: string) => text.replace(/<[^/>][^>]*><\/[^>]+>/g, '');

export const allowLinebreaks = (text: string | null): string | null => {
	if (text) {
		return text.replace(/(\r\n|\r|\n)/g, '<br />');
	}
	return text;
};

export const stripTags = (text: string, preservedTags: string[] = []) => {
	if (!text) {
		return text;
	}
	return text.replace(/(<([^>]+)>)/gi, (match) => {
		const tagRegex = new RegExp(/([^\s^\\/^<^>]+)/gi);
		const [tagName] = tagRegex.exec(match);
		if (preservedTags.includes(tagName)) {
			return match;
		}
		return '';
	});
};

export const generateAnchors = () => {
	const ids = document.querySelectorAll('[data-id]') as NodeListOf<HTMLElement>;
	Array.from(ids).forEach((id) => {
		const idText = id.dataset.id;
		const parent = id.parentElement;
		parent.setAttribute('id', idText);
		id.remove();
	});
};
