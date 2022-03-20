<script context="module" lang="ts">
	import type { Load } from './__error';

	export const load: Load = ({ error, status }) => {
		return {
			error,
			status
		};
	};
</script>
