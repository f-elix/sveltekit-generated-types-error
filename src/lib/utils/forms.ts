export const fileToObject = async (file: File) => {
	if (!file.name && !file.size) {
		return;
	}
	return {
		lastModified: file.lastModified,
		name: file.name,
		size: file.size,
		type: file.type,
		content: await readFile(file)
	};
};

export const readFile = async (file: File) => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.readAsDataURL(file);
	});
};

export const getFormValuesAsync = async <TFormValuesObject>(form: HTMLFormElement) => {
	const formData = new FormData(form);
	const obj: TFormValuesObject = {} as any;
	for (const key of formData.keys()) {
		const values = await Promise.all(
			formData.getAll(key).map(async (value) => {
				if (value instanceof File) {
					return fileToObject(value);
				}
				return value;
			})
		);
		obj[key] = values.length === 1 ? values[0] : values;
	}
	return obj;
};

export const getFormValues = <TFormValuesObject>(form: HTMLFormElement) => {
	const formData = new FormData(form);
	const obj: TFormValuesObject = {} as any;
	for (const key of formData.keys()) {
		const values = formData.getAll(key);
		obj[key] = values.length === 1 ? values[0] : values;
	}
	return obj;
};

// Credit: https://github.com/remix-run/remix/blob/776cb79b97bdfba42f802c2f583b1ec5d4dcb785/packages/remix-server-runtime/responses.ts#L58
const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);
export const isRedirectResponse = (response: Response): boolean => {
	return redirectStatusCodes.has(response.status);
};

export const validateSameOrigin = (reqUrl: string, urlToTest: string) => {
	try {
		const validUrl = new URL(reqUrl);
		const url = new URL(urlToTest, validUrl.origin);
		return url.origin === validUrl.origin;
	} catch (error) {
		console.error(error);
		return false;
	}
};
