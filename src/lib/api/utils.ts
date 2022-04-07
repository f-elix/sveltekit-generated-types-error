export const isInvalidPath = (path: string, invalidPaths: string[]) => {
	return invalidPaths.find((p) => path.includes(p));
};
