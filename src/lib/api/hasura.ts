type HasuraError = {
	message: string;
	extensions: {
		path: string;
		code: string;
	};
};

export const hasuraFetch = async (
	query: string,
	variables: Record<string, any>
): Promise<{ errors?: HasuraError[]; data: any }> => {
	const res = await fetch(import.meta.env.VITE_HASURA_ENDPOINT, {
		method: 'POST',
		headers: {
			'x-hasura-admin-secret': import.meta.env.VITE_HASURA_GRAPHQL_ADMIN_SECRET
		},
		body: JSON.stringify({
			query,
			variables
		})
	});
	return res.json();
};
