<script context="module" lang="ts">
	import type { Load } from './__layout';

	export const load: Load = ({ params }) => {
		console.log(params);
		return {};
	};
</script>

<slot />
