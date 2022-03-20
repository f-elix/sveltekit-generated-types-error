<script context="module" lang="ts">
	import type { Load } from './__layout';

	export const load: Load = ({ params }) => {
		console.log('from __layout', params);
		console.log('from __layout', params.lang);
		return {};
	};
</script>

<slot />
