<script context="module" lang="ts">
	import type { Load } from '../[lang]';

	export const load: Load = ({ params }) => {
		console.log(params);
		return {};
	};
</script>
