import bcrypt from 'bcryptjs';

const { genSalt, hash } = bcrypt;

export const hashPassword = async (password: string) => {
	const salt = await genSalt(10);
	return hash(password, salt);
};

export const isInvalidPath = (path: string, invalidPaths: string[]) => {
	return invalidPaths.find((p) => path.includes(p));
};
