<script setup lang="ts">
const { data: attributions } = await useAsyncData('credits', () => queryCollection('content').path('/credits').first());
</script>

<template>
	<div>
		<div class="flex items-center justify-between w-full px-4 py-2">
			<div class="flex items-center">
				<ULink raw class="text-xl font-semibold" to="/">Trainer Cards Studio</ULink>
			</div>

			<div class="flex items-center gap-2">
				<UButton to="/credits" color="neutral" variant="subtle" icon="i-heroicons-information-circle">Credits</UButton>
				<UButton to="https://github.com/jonbarrow/trainercards.studio" target="_blank" color="neutral" variant="subtle" icon="i-simple-icons-github">GitHub</UButton>
			</div>
		</div>
		<USeparator />
		<UContainer class="credits-page py-10">
			<ContentRenderer v-if="attributions" :value="attributions" />
		</UContainer>
	</div>
</template>

<style scoped>
/*
* Add back in some styles that tailwind resets
*/
.credits-page :deep(ul) {
	list-style-type: disc;
	margin-left: 1rem;
	margin-bottom: 1rem;
}

.credits-page :deep(ol) {
	list-style-type: decimal;
	margin-left: 1rem;
	margin-bottom: 1rem;
}

.credits-page :deep(li) {
	margin-bottom: 0.25rem;
}

.credits-page :deep(a) {
	color: #3b82f6;
	text-decoration: underline;
}

.credits-page :deep(a:hover) {
	color: #1d4ed8;
}

.credits-page :deep(h1) {
	font-size: 1.5rem;
	font-weight: bold;
	margin-bottom: 1rem;
	margin-top: 2rem;
}

.credits-page :deep(h2) {
	font-size: 1.25rem;
	font-weight: bold;
	margin-bottom: 0.75rem;
	margin-top: 1.5rem;
}

.credits-page :deep(p) {
	margin-bottom: 1rem;
}

.credits-page :deep(code) {
	background-color: #1D283D;
	padding: 0.125rem 0.25rem;
	border-radius: 0.25rem;
	font-family: monospace;
}
</style>
