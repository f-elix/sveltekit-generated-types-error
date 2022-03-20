<script context="module" lang="ts">
	import type { Load } from '../[lang]';

	export const load: Load = ({ params }) => {
		console.log('from [lang]/index', params);
		console.log('from [lang]/index', params.lang);
		return {};
	};
</script>
