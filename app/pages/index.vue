<script setup lang="ts">
import { UButton } from '#components';
import templates from '@/trainer-card-templates';
import type TrainerImage from '@/types/trainer-image';
import type Pokemon from '@/types/pokemon';
import type PokemonImage from '@/types/pokemon-image';
import type PokemonTeam from '@/types/pokemon-team';
import type BadgeData from '@/types/badge-data';
import type ModernIconData from '@/types/modern-icon-data';

const { loadImage } = useImageCache();

const trainerCardCanvas = ref<HTMLCanvasElement | null>(null);
const selectedTemplateIndex = ref(0);
const trainerName = ref('');
const selectedTrainer = ref<TrainerImage>({
	style: 'pixel_art',
	name: 'None',
	platform: '',
	platform_display_name: '',
	creator: '',
	image_url: '',
	preview_url: ''
});
const templateModalOpen = ref(false);
const trainerModalOpen = ref(false);
const pokemonModalOpen = ref(false);
const selectedTeamIndex = ref<number | null>(null);
const pokemonSearchQuery = ref('');
const selectedTeam = reactive<PokemonTeam>({});
const socialIcon1 = ref({
	image_url: '',
	text: ''
});
const socialIcon2 = ref({
	image_url: '',
	text: ''
});
const socialText1 = ref('');
const socialText2 = ref('');
const badges = ref<string[]>([]);

const allPokemonData = ref<Pokemon[]>([]);
const filteredPokemon = computed(() => {
	if (!pokemonSearchQuery.value.trim()) {
		return [];
	}

	const query = pokemonSearchQuery.value.toLowerCase().trim();

	return allPokemonData.value.filter(pokemon => pokemon.display_name.toLowerCase().includes(query) || pokemon.name.toLowerCase().includes(query));
});

const allTrainerData = ref<TrainerImage[]>([]);
const allBadgeData = ref<BadgeData[]>([]);
const allModernIconData = ref<ModernIconData[]>([]);

const modernIcon1Options = computed(() => [
	allModernIconData.value.map(item => ({
		label: item.label,
		avatar: { src: item.src },
		onSelect: () => handleSelectIcon1(item.src)
	}))
]);
const modernIcon2Options = computed(() => [
	allModernIconData.value.map(item => ({
		label: item.label,
		avatar: { src: item.src },
		onSelect: () => handleSelectIcon2(item.src)
	}))
]);

async function loadPokemonData() {
	try {
		const response = await fetch('/metadata/pokemon.json');
		allPokemonData.value = await response.json();
	} catch (error) {
		console.error('Failed to load Pokemon data:', error);
	}
}

async function loadTrainerData() {
	try {
		const response = await fetch('/metadata/trainers.json');
		allTrainerData.value = await response.json();
	} catch (error) {
		console.error('Failed to load Pokemon data:', error);
	}
}

async function loadBadgeData() {
	try {
		const response = await fetch('/metadata/badges.json');
		allBadgeData.value = await response.json();
	} catch (error) {
		console.error('Failed to load Pokemon data:', error);
	}
}

async function loadLinksData() {
	try {
		const response = await fetch('/metadata/links.json');
		allModernIconData.value = await response.json();
	} catch (error) {
		console.error('Failed to load Pokemon data:', error);
	}
}

async function updateCanvas() {
	const canvas = trainerCardCanvas.value;
	if (!canvas) {
		return;
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return;
	}

	const template = templates[selectedTemplateIndex.value]!;
	const card = new template(canvas, ctx);

	await card.drawBackground();

	if (selectedTrainer.value.image_url) {
		await card.drawTrainerImage(selectedTrainer.value);
	}

	if (trainerName.value) {
		await card.drawTrainerName(trainerName.value);
	}

	await card.drawPokemonTeam(selectedTeam);

	if (socialIcon1.value.image_url) {
		await card.drawIcon1(socialIcon1.value.image_url, socialText1.value);
	}

	if (socialIcon2.value.image_url) {
		await card.drawIcon2(socialIcon2.value.image_url, socialText2.value);
	}

	if (badges.value.length !== 0) {
		await card.drawBadges(badges.value);
	}
}

function selectTemplate(index: number) {
	if (selectedTemplateIndex.value !== index) {
		selectedTemplateIndex.value = index;
		updateCanvas();
	}

	toggleTemplateModal();
}

function selectTrainer(trainer: TrainerImage) {
	selectedTrainer.value = trainer;
	updateCanvas();
	toggleTrainerModal();
}

function selectPokemon(pokemon: Pokemon, image: PokemonImage) {
	if (selectedTeamIndex.value !== null) {
		selectedTeam[selectedTeamIndex.value] = {
			pokemon,
			image,
			nickname: pokemon.display_name,
			gender: ''
		};

		pokemonModalOpen.value = false;

		updateCanvas();
	}
}

function handleSelectIcon1(src: string) {
	socialIcon1.value.image_url = src;
	updateCanvas();
}

function handleSelectIcon2(src: string) {
	socialIcon2.value.image_url = src;
	updateCanvas();
}

function toggleTemplateModal() {
	templateModalOpen.value = !templateModalOpen.value;
}

function toggleTrainerModal() {
	trainerModalOpen.value = !trainerModalOpen.value;
}

function toggleBadge(url: string) {
	const index = badges.value.indexOf(url);
	if (index > -1) {
		badges.value.splice(index, 1);
	} else {
		badges.value.push(url);
	}

	updateCanvas();
}

function clearBadges() {
	badges.value = [];
	updateCanvas();
}

function togglePokemonModal(i: number) {
	pokemonModalOpen.value = !pokemonModalOpen.value;
	selectedTeamIndex.value = i;
	pokemonSearchQuery.value = '';
}

function updatePokemonNickname(slot: number, nickname: string) {
	if (selectedTeam[slot]) {
		selectedTeam[slot].nickname = nickname;

		updateCanvas();
	}
}

function genderOptions(slot: number) {
	return [
		{
			label: 'None',
			onSelect: () => updatePokemonGender(slot, '')
		},
		{
			label: 'Male',
			onSelect: () => updatePokemonGender(slot, 'male')
		},
		{
			label: 'Female',
			onSelect: () => updatePokemonGender(slot, 'female')
		}
	];
}

function updatePokemonGender(slot: number, gender: string) {
	if (selectedTeam[slot]) {
		selectedTeam[slot].gender = gender;
		updateCanvas();
	}
}

function getPokemonPreviewScaleStyle(image: PokemonImage) {
	const { content, original } = image.dimensions;
	const contentRatio = Math.max(content.width, content.height) / Math.max(original.width, original.height);
	const scale = Math.min(4.0, Math.max(0.3, 1 / contentRatio));

	return {
		transform: `scale(${scale})`,
		transformOrigin: 'center'
	};
}

function exportCard() {
	const canvas = trainerCardCanvas.value;
	if (!canvas) {
		return;
	}

	canvas.toBlob((blob) => {
		if (!blob) {
			return;
		}

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = 'trainer-card.png';

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}, 'image/png');
}

onMounted(() => {
	loadPokemonData();
	loadTrainerData();
	loadBadgeData();
	loadLinksData();
	updateCanvas();
});
</script>

<template>
	<div>
		<div class="flex items-center justify-between w-full px-4 py-2">
			<div class="flex items-center">
				<span class="text-xl font-semibold">Trainer Cards Studio</span>
			</div>

			<UButton to="https://github.com/jonbarrow/trainercards.studio" target="_blank" color="neutral" variant="subtle" icon="i-simple-icons-github">GitHub</UButton>
		</div>
		<USeparator />
		<UContainer class="py-10">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div class="space-y-6 order-2 lg:order-1">
					<UCard>
						<template #header>Trainer Card</template>

						<h1>Card Settings</h1>
						<USeparator class="py-5" />
						<div>
							<UButton label="Select Template" color="neutral" variant="subtle" @click="toggleTemplateModal" />
							<UModal v-model:open="templateModalOpen">
								<template #content>
									<div class="p-4 grid grid-cols-3 gap-3">
										<div v-for="(template, index) in templates" :key="index" class="relative cursor-pointer" @click="selectTemplate(index)">
											<div :class="['border-2 rounded-lg p-2 transition-colors', selectedTrainer?.name === template.name ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300']">
												<img loading="lazy" :src="template.previewURL" :alt="template.name" class="max-w-full max-h-full object-contain pixelated">
												<p class="text-xs text-center mt-2 truncate">{{ template.name }}</p>
											</div>
										</div>
									</div>
								</template>
							</UModal>
							<br>
							<br>
							<UButtonGroup>
								<UDropdownMenu :items="modernIcon1Options">
									<UButton color="neutral" variant="outline">
										<div class="flex items-center gap-2">
											<div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
												<img v-if="socialIcon1.image_url" :src="socialIcon1.image_url" class="w-4 h-4 object-contain block" alt="Selected icon">
												<UIcon v-else name="i-lucide-minus" class="w-4 h-4 text-gray-400 block" />
											</div>
											<UIcon name="i-lucide-chevron-down" class="w-3 h-3 flex-shrink-0" />
										</div>
									</UButton>
								</UDropdownMenu>

								<UInput v-model="socialText1" color="neutral" variant="outline" @input="updateCanvas" />
							</UButtonGroup>
							<br>
							<br>
							<UButtonGroup>
								<UDropdownMenu :items="modernIcon2Options">
									<UButton color="neutral" variant="outline">
										<div class="flex items-center gap-2">
											<div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
												<img v-if="socialIcon2.image_url" :src="socialIcon2.image_url" class="w-4 h-4 object-contain block" alt="Selected icon">
												<UIcon v-else name="i-lucide-minus" class="w-4 h-4 text-gray-400 block" />
											</div>
											<UIcon name="i-lucide-chevron-down" class="w-3 h-3 flex-shrink-0" />
										</div>
									</UButton>
								</UDropdownMenu>

								<UInput v-model="socialText2" color="neutral" variant="outline" @input="updateCanvas" />
							</UButtonGroup>
						</div>

						<h1 class="pt-5">Trainer Settings</h1>
						<USeparator class="py-5" />
						<div class="space-y-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
							<div>
								<label for="trainerName" class="block text-sm font-medium mb-2">Name</label>
								<UInput id="trainerName" v-model="trainerName" placeholder="Enter trainer name" @input="updateCanvas" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-3">Picture</label>
								<UButton label="Select Trainer" color="neutral" variant="subtle" @click="toggleTrainerModal" />
								<UModal v-model:open="trainerModalOpen">
									<template #content>
										<div class="p-4 grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
											<div v-for="(trainer, index) in allTrainerData" :key="index" class="relative cursor-pointer" @click="selectTrainer(trainer)">
												<div :class="['border-2 rounded-lg p-2 transition-colors', selectedTrainer?.name === trainer.name ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300']">
													<div class="aspect-square flex items-center justify-center bg-gray-50 rounded">
														<img v-if="trainer.preview_url" loading="lazy" :src="trainer.preview_url" :alt="trainer.name" :class="['max-w-full', 'max-h-full', 'object-contain', { pixelated: trainer.style === 'pixel_art' }]">
														<div v-else class="text-gray-400 text-xs text-center">{{ trainer.name }}</div>
													</div>
													<p class="text-xs text-center mt-2 truncate">{{ trainer.name }}</p>
													<div class="text-xs text-center mt-1">
														<div>{{ trainer.platform_display_name }}</div>
														<div>
															<UButton v-if="trainer.creator_url" :to="trainer.creator_url" target="_blank" color="neutral" variant="subtle" @click.stop>{{ trainer.creator }}</UButton>
															<span v-else>{{ trainer.creator }}</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</template>
								</UModal>
							</div>
						</div>

						<h1 class="pt-5">Team</h1>
						<USeparator class="py-5" />
						<div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
							<div v-for="item in 6" :key="item" class="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-md" @click="togglePokemonModal(item)">
								<div v-if="selectedTeam[item]" class="text-center w-full flex flex-col justify-between">
									<div class="flex-1 flex items-center justify-center">
										<img :src="selectedTeam[item].image.url" :alt="selectedTeam[item].pokemon.display_name" :class="['w-16', 'h-16', 'object-contain', { pixelated: selectedTeam[item].image.style === 'pixel_art' }]">
									</div>

									<div class="space-y-1">
										<span class="text-sm font-semibold text-foreground">{{ selectedTeam[item].pokemon.display_name }}</span>

										<div @click.stop>
											<UDropdownMenu :items="genderOptions(item)" size="xs">
												<UButton color="neutral" variant="outline" size="xs">
													<div class="flex items-center gap-1">
														<span v-if="selectedTeam[item].gender === 'male'" class="text-blue-500">♂</span>
														<span v-else-if="selectedTeam[item].gender === 'female'" class="text-pink-500">♀</span>
														<span v-else class="text-muted-foreground">-</span>
														<UIcon name="i-lucide-chevron-down" class="w-3 h-3" />
													</div>
												</UButton>
											</UDropdownMenu>
										</div>
									</div>

									<div class="w-full">
										<input type="text" class="w-full px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center bg-background" :value="selectedTeam[item].nickname || selectedTeam[item].pokemon.display_name" :placeholder="selectedTeam[item].pokemon.display_name" @input="updatePokemonNickname(item, ($event.target as HTMLInputElement).value)" @click.stop>
									</div>
								</div>

								<div v-else class="text-center w-full h-full flex flex-col items-center justify-center space-y-3">
									<div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
										<svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
									</div>
									<span class="text-sm font-medium text-foreground">Add Pokemon</span>
									<span class="text-xs text-muted-foreground">Slot {{ item }}</span>
								</div>
							</div>
							<UModal v-model:open="pokemonModalOpen">
								<template #content>
									<div class="p-4 w-full max-w-4xl">
										<h3 class="text-lg font-semibold mb-4">
											Select Pokemon for Slot {{ selectedTeamIndex }}
										</h3>

										<div class="mb-4">
											<UInput v-model="pokemonSearchQuery" placeholder="Search Pokemon by name..." class="w-full" />
										</div>
										<div class="overflow-y-auto max-h-96">
											<div v-for="pokemon in filteredPokemon" :key="pokemon.name">
												<h3>{{ pokemon.display_name }}</h3>
												<div class="grid grid-cols-4 gap-2 mb-4">
													<div v-for="image in pokemon.images" :key="`${pokemon.name}-${image.platform}-${image.gender}`" class="flex flex-col items-center" @click="selectPokemon(pokemon, image)">
														<div class="w-16 h-16 flex items-center justify-center overflow-hidden cursor-pointer">
															<img loading="lazy" :src="image.url" alt="" :style="getPokemonPreviewScaleStyle(image)" :class="['max-w-full', 'max-h-full', 'object-contain', { pixelated: image.style === 'pixel_art' }]" @load="loadImage(image.url)">
														</div>
														<div class="text-xs text-center mt-1">
															<div>{{ image.platform_display_name }}</div>
															<div>
																<UButton v-if="image.creator_url" :to="image.creator_url"target="_blank" color="neutral" variant="subtle">{{ image.creator }}</UButton>
																<span v-else>{{ image.creator }}</span>
															</div>
														</div>
													</div>
												</div>
												<USeparator class="py-5" />
											</div>
										</div>
									</div>
								</template>
							</UModal>
						</div>

						<h1 class="pt-5">Badges</h1>
						<USeparator class="py-5" />
						<div>
							<div class="mb-4">
								<UButton color="neutral" variant="outline" :disabled="badges.length === 0" @click="clearBadges">Clear Badges</UButton>
							</div>

							<UAccordion :items="allBadgeData" type="multiple">
								<template #content="{ item }">
									<div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
										<img v-for="(image, index) in item.images" :key="index" loading="lazy" :src="image" :alt="`${item.label} image ${index + 1}`" :class="['w-10 h-10 object-contain pixelated cursor-pointer border-2 rounded transition-colors', badges.includes(image) ? 'border-primary bg-primary/10' : 'border-transparent hover:border-gray-300']" @click="toggleBadge(image)">
									</div>
								</template>
							</UAccordion>
						</div>
					</UCard>
				</div>
				<div class="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
					<UButton label="Download Trainer Card" color="neutral" variant="subtle" @click="exportCard" />
					<USeparator class="py-5" />
					<div class="rounded-lg bg-card shadow-sm">
						<div class="relative w-full" style="aspect-ratio: 228/140;">
							<canvas ref="trainerCardCanvas" class="absolute inset-0 w-full h-full rounded-lg pixelated" />
						</div>
					</div>
				</div>
			</div>
		</UContainer>
	</div>
</template>

<style scoped>
.pixelated {
	image-rendering: -moz-crisp-edges;
	image-rendering: -webkit-crisp-edges;
	image-rendering: pixelated;
	image-rendering: crisp-edges;
}

canvas {
	width: 100%;
	height: 100%;
	object-fit: contain;
	object-position: top left;
	display: block;
}
</style>
