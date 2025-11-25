<script setup lang="ts">
import { UButton } from '#components';
import templates from '@/trainer-card-templates';
import { parseSave } from '@/save-file-parser';
import type TrainerImage from '@/types/trainer-image';
import type Pokemon from '@/types/pokemon';
import type PokemonImage from '@/types/pokemon-image';
import type PokemonTeam from '@/types/pokemon-team';
import type BadgeData from '@/types/badge-data';
import type ModernIconData from '@/types/modern-icon-data';
import type TrainerCard from '@/trainer-card-templates/TrainerCard';
import type ItemData from '@/types/item-data';
import type SelectableSprite from '@/types/selectable-sprite';

const { loadImage } = useImageCache();

const trainerCardCanvas = ref<HTMLCanvasElement | null>(null);
const selectedTemplateIndex = ref(0);
const customBackgroundFile = ref<File | null>(null);
const customBackgroundDataURL = ref<string | null>(null);
const trainerName = ref('');
const trainerHometown = ref('');
const trainerSpecialty = ref('');
const selectedTrainer = ref<TrainerImage>({
	style: 'pixel_art',
	name: 'None',
	platform: '',
	platform_display_name: '',
	creator: '',
	image_url: '',
	preview_url: '',
	offset_x: 0, // * Set prior to the drawing process but not in the original metadata
	offset_y: 0, // * Set prior to the drawing process but not in the original metadata
	scale: 1, // * Set prior to the drawing process but not in the original metadata
	flipped: false, // * Set prior to the drawing process but not in the original metadata
	original_x: 0, // * Set during the drawing process
	original_y: 0, // * Set during the drawing process
	drawn_x: 0, // * Set during the drawing process
	drawn_y: 0, // * Set during the drawing process
	drawn_width: 0, // * Set during the drawing process
	drawn_height: 0, // * Set during the drawing process
	dimensions: {
		content: {
			width: 0,
			height: 0
		},
		original: {
			width: 0,
			height: 0
		},
		padding: {
			top: 0,
			left: 0,
			bottom: 0,
			right: 0
		}
	}
});
const templateModalOpen = ref(false);
const trainerModalOpen = ref(false);
const isTrainersLoading = ref(false);
const pokemonModalOpen = ref(false);
const heldItemModalOpen = ref(false);
const isHeldItemsLoading = ref(false);
const exportAnimatedCardModalOpen = ref(false);
const animatedCardExportingModalOpen = ref(false);
const exportStatusText = ref('Starting recording...');
const exportProgress = ref(0);
const selectedTeamIndex = ref<number | null>(null);
const pokemonSearchQuery = ref('');
const debouncedPokemonSearchQuery = useDebounce(pokemonSearchQuery);
const trainerSearchQuery = ref('');
const debouncedTrainerSearchQuery = useDebounce(trainerSearchQuery);
const heldItemSearchQuery = ref('');
const debouncedHeldItemSearchQuery = useDebounce(heldItemSearchQuery);
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
const watermarkEnabled = ref(true);

const allPokemonData = ref<Pokemon[]>([]);
const filteredPokemon = computed(() => {
	if (!debouncedPokemonSearchQuery.value.trim()) {
		return [];
	}

	const query = debouncedPokemonSearchQuery.value.toLowerCase().trim();

	return allPokemonData.value.filter(pokemon => pokemon.display_name.toLowerCase().includes(query) || pokemon.name.toLowerCase().includes(query));
});

const allTrainerData = ref<TrainerImage[]>([]);
const allTrainerPlatforms = ref<string[]>([]);
const selectedTrainerPlatforms = ref<string[]>([]);
const filteredTrainers = computed(() => {
	let trainers = allTrainerData.value;

	if (selectedTrainerPlatforms.value.length > 0) {
		trainers = trainers.filter(trainer => selectedTrainerPlatforms.value.includes(trainer.platform_display_name));
	}

	if (debouncedTrainerSearchQuery.value.trim()) {
		const query = debouncedTrainerSearchQuery.value.toLowerCase().trim();
		trainers = trainers.filter(trainer => trainer.name.toLowerCase().includes(query));
	}

	return trainers;
});

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

const allPokeballData = ref<ItemData[]>([]);
const pokeballOptions = computed(() => (slot: number) => [
	{
		label: 'None',
		onSelect: () => updatePokemonPokeball(slot)
	},
	...allPokeballData.value.map(pokeball => ({
		label: pokeball.display_name,
		avatar: { src: pokeball.image.preview_url },
		onSelect: () => updatePokemonPokeball(slot, pokeball)
	}))
]);

const allHeldItemsData = ref<ItemData[]>([]);
const filteredHeldItems = computed(() => {
	if (!debouncedHeldItemSearchQuery.value.trim()) {
		return allHeldItemsData.value;
	}

	const query = debouncedHeldItemSearchQuery.value.toLowerCase().trim();

	return allHeldItemsData.value.filter(item => item.name.toLowerCase().includes(query) || item.display_name.toLowerCase().includes(query));
});

const saveFilePartyInput = ref<HTMLInputElement | null>(null);
const saveFileHallOfFameInput = ref<HTMLInputElement | null>(null);

let card: TrainerCard = new templates[0]!();

async function loadPokemonData() {
	try {
		const response = await fetch('/api/pokemon');
		allPokemonData.value = await response.json();
	} catch (error) {
		console.error('Failed to load Pokemon data:', error);
	}
}

async function loadTrainerData() {
	try {
		const response = await fetch('/api/trainers');
		allTrainerData.value = await response.json();
		allTrainerPlatforms.value = [...new Set(allTrainerData.value.map(trainer => trainer.platform_display_name))];
		console.log(allTrainerPlatforms.value[0]);
	} catch (error) {
		console.error('Failed to load Pokemon data:', error);
	}
}

async function loadBadgeData() {
	try {
		const response = await fetch('/api/badges');
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

async function loadPokeballData() {
	try {
		const response = await fetch('/metadata/pokeballs.json');
		allPokeballData.value = await response.json();
	} catch (error) {
		console.error('Failed to load Pokeball data:', error);
	}
}

async function loadHeldItemData() {
	try {
		const response = await fetch('/metadata/items.json');
		allHeldItemsData.value = await response.json();
	} catch (error) {
		console.error('Failed to load Pokeball data:', error);
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

	card.canvas = canvas;
	card.ctx = ctx;

	await card.drawBackground(customBackgroundDataURL.value);

	card.captureBackgroundState();

	if (selectedTrainer.value.image_url) {
		await card.drawTrainerImage(selectedTrainer.value);
	}

	if (trainerName.value) {
		await card.drawTrainerName(trainerName.value);
	}

	if (trainerHometown.value) {
		await card.drawTrainerHometown(trainerHometown.value);
	}

	if (trainerSpecialty.value) {
		await card.drawTrainerSpecialty(trainerSpecialty.value);
	}

	if (socialIcon1.value.image_url) {
		await card.drawIcon1(socialIcon1.value.image_url, socialText1.value);
	}

	if (socialIcon2.value.image_url) {
		await card.drawIcon2(socialIcon2.value.image_url, socialText2.value);
	}

	if (badges.value.length !== 0) {
		await card.drawBadges(badges.value);
	}

	await card.drawPokemonTeam(selectedTeam);

	if (watermarkEnabled.value) {
		await card.drawWatermark();
	}

	card.watermarkEnabled = watermarkEnabled.value;
}

function selectTemplate(index: number) {
	if (selectedTemplateIndex.value !== index) {
		card.cleanup();

		selectedTemplateIndex.value = index;
		customBackgroundDataURL.value = null;
		card = new templates[index]!();
		updateCanvas();
	}

	toggleTemplateModal();
}

function selectBackground(index: number) {
	card.selectedBackgroundIndex = index;
	customBackgroundDataURL.value = null;
	updateCanvas();
}

function selectCustomBackground() {
	const file = customBackgroundFile.value;
	if (file && file.type.startsWith('image/')) {
		const reader = new FileReader();

		reader.onload = (e) => {
			customBackgroundDataURL.value = e.target?.result as string;
			customBackgroundFile.value = null;
			updateCanvas();
		};

		reader.readAsDataURL(file);
	}
}

function selectTrainer(trainer: TrainerImage) {
	selectTrainerNoModal(trainer);
	toggleTrainerModal();
}

function selectTrainerNoModal(trainer: TrainerImage) {
	card.cleanup();

	selectedTrainer.value = {
		...trainer,
		offset_x: trainer.offset_x ?? 0,
		offset_y: trainer.offset_y ?? 0,
		scale: trainer.scale ?? 1,
		flipped: trainer.flipped ?? false
	};

	trainerSearchQuery.value = '';
	updateCanvas();
}

function updateTrainerOffset(axis: 'x' | 'y', value: number) {
	if (axis === 'x') {
		selectedTrainer.value.offset_x = value;
	} else {
		selectedTrainer.value.offset_y = value;
	}

	card.cleanup();
	updateCanvas();
}

function updateTrainerScale(value: number) {
	selectedTrainer.value.scale = value;

	card.cleanup();
	updateCanvas();
}

function updateTrainerFlip(value: boolean | 'indeterminate') {
	const flipped = value === true;
	selectedTrainer.value.flipped = flipped;

	card.cleanup();
	updateCanvas();
}

function resetTrainerTransform() {
	selectedTrainer.value.offset_x = 0;
	selectedTrainer.value.offset_y = 0;
	selectedTrainer.value.scale = 1;

	card.cleanup();
	updateCanvas();
}

function selectPokemon(pokemon: Pokemon, image: PokemonImage) {
	if (selectedTeamIndex.value !== null) {
		card.cleanup();

		const oldPokemon = selectedTeam[selectedTeamIndex.value];
		if (oldPokemon) {
			if (oldPokemon.nickname === oldPokemon.pokemon.display_name) {
				oldPokemon.nickname = pokemon.display_name;
			}

			oldPokemon.pokemon = pokemon;
			oldPokemon.image = image;
		} else {
			selectedTeam[selectedTeamIndex.value] = {
				pokemon,
				image,
				slot: selectedTeamIndex.value,
				nickname: pokemon.display_name,
				gender: '',
				offset_x: 0, // * Set prior to the drawing process but not in the original metadata
				offset_y: 0, // * Set prior to the drawing process but not in the original metadata
				scale: 1, // * Set prior to the drawing process but not in the original metadata
				flipped: false, // * Set prior to the drawing process but not in the original metadata
				original_x: 0, // * Set during the drawing process
				original_y: 0, // * Set during the drawing process
				drawn_x: 0, // * Set during the drawing process
				drawn_y: 0, // * Set during the drawing process
				drawn_width: 0, // * Set during the drawing process
				drawn_height: 0 // * Set during the drawing process
			};
		}

		pokemonSearchQuery.value = '';
		pokemonModalOpen.value = false;

		updateCanvas();
	}
}

function updatePokemonOffset(slot: number, axis: 'x' | 'y', value: number) {
	if (selectedTeam[slot]) {
		if (axis === 'x') {
			selectedTeam[slot].offset_x = value;
		} else {
			selectedTeam[slot].offset_y = value;
		}

		card.cleanup();
		updateCanvas();
	}
}

function updatePokemonScale(slot: number, value: number) {
	if (selectedTeam[slot]) {
		selectedTeam[slot].scale = value;

		card.cleanup();
		updateCanvas();
	}
}

function updatePokemonFlip(slot: number, value: boolean | 'indeterminate') {
	if (selectedTeam[slot]) {
		const flipped = value === true;
		selectedTeam[slot].flipped = flipped;

		card.cleanup();
		updateCanvas();
	}
}

function resetPokemonTransform(slot: number) {
	if (selectedTeam[slot]) {
		selectedTeam[slot].offset_x = 0;
		selectedTeam[slot].offset_y = 0;
		selectedTeam[slot].scale = 1;

		card.cleanup();
		updateCanvas();
	}
}

function selectHeldItem(item: ItemData) {
	if (selectedTeamIndex.value !== null) {
		const pokemon = selectedTeam[selectedTeamIndex.value];
		if (pokemon) {
			pokemon.held_item = item;
			heldItemSearchQuery.value = '';
			heldItemModalOpen.value = false;
			updateCanvas();
		}
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
	trainerSearchQuery.value = '';
	selectedTrainerPlatforms.value = [];

	if (trainerModalOpen.value) {
		isTrainersLoading.value = true;
		nextTick(() => {
			setTimeout(() => {
				isTrainersLoading.value = false;
			}, 100);
		});
	}
}

function toggleExportAnimatedCardModal() {
	exportAnimatedCardModalOpen.value = !exportAnimatedCardModalOpen.value;
}

function toggleAnimatedCardExportingModal() {
	animatedCardExportingModalOpen.value = !animatedCardExportingModalOpen.value;
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

function toggleHeldItemModal(i: number) {
	heldItemModalOpen.value = !heldItemModalOpen.value;
	selectedTeamIndex.value = i;
	heldItemSearchQuery.value = '';

	if (heldItemModalOpen.value) {
		isTrainersLoading.value = true;
		nextTick(() => {
			setTimeout(() => {
				isHeldItemsLoading.value = false;
			}, 100);
		});
	}
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

function updatePokemonPokeball(slot: number, pokeball?: ItemData) {
	if (selectedTeam[slot]) {
		selectedTeam[slot].pokeball = pokeball;
		updateCanvas();
	}
}

async function exportCard() {
	const canvas = trainerCardCanvas.value;
	if (!canvas) {
		return;
	}

	if (card.animations.size === 0) {
		canvas.toBlob((blob) => {
			if (!blob) return;

			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = 'trainer-card.png';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}, 'image/png');
		return;
	}

	toggleExportAnimatedCardModal();
}

async function exportAnimatedCard(mimeType: string, extension: string) {
	toggleAnimatedCardExportingModal();
	toggleExportAnimatedCardModal();

	let animationLength = 0;
	for (const animation of card.animations.values()) {
		if (animation.animationLength > animationLength) {
			animationLength = animation.animationLength;
		}
	}

	exportStatusText.value = 'Starting recording...';
	exportProgress.value = 0;

	await updateCanvas();

	exportStatusText.value = 'Recording animation...';
	exportProgress.value = 5;

	const recordedChunks: Blob[] = [];
	const stream = trainerCardCanvas.value!.captureStream(60);
	const mediaRecorder = new MediaRecorder(stream, {
		mimeType
	});

	const startTime = Date.now();

	const progressInterval = setInterval(() => {
		const elapsed = Date.now() - startTime;
		const progress = Math.min(90, (elapsed / animationLength) * 100);
		exportProgress.value = Math.round(progress);
	}, 50);

	console.log(animationLength);

	mediaRecorder.start(animationLength);

	mediaRecorder.addEventListener('dataavailable', (event) => {
		recordedChunks.push(event.data);
		if (mediaRecorder.state === 'recording') {
			clearInterval(progressInterval);
			exportProgress.value = 95;
			mediaRecorder.stop();
		}
	});

	mediaRecorder.addEventListener('stop', () => {
		exportStatusText.value = 'Processing video...';
		exportProgress.value = 98;

		const blob = new Blob(recordedChunks, {
			type: mimeType
		});

		exportStatusText.value = 'Download ready!';
		exportProgress.value = 100;

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `trainer-card.${extension}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		setTimeout(() => {
			toggleAnimatedCardExportingModal();
			exportProgress.value = 0;
			exportStatusText.value = 'Starting recording...';
		}, 1500);
	});
}

onMounted(() => {
	loadPokemonData();
	loadTrainerData();
	loadBadgeData();
	loadLinksData();
	loadPokeballData();
	loadHeldItemData();
	updateCanvas();
});

const clickedSprite = ref<SelectableSprite | null>(null);
const dragOffset = ref<{
	x: number;
	y: number;
} | null>(null);
const pinchData = ref<{
	sprite: SelectableSprite | null;
	initialDistance: number;
	initialScale: number;
} | null>(null);

function getEventCoordinates(event: MouseEvent | TouchEvent) {
	const canvas = event.target! as HTMLCanvasElement;
	const boundingClientRect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / boundingClientRect.width;
	const scaleY = canvas.height / boundingClientRect.height;

	let clientX;
	let clientY;
	if (event instanceof TouchEvent) {
		clientX = event.touches[0]?.clientX || event.changedTouches[0]?.clientX;
		clientY = event.touches[0]?.clientY || event.changedTouches[0]?.clientY;
	} else {
		clientX = event.clientX;
		clientY = event.clientY;
	}

	const mouseX = (clientX! - boundingClientRect.left) * scaleX;
	const mouseY = (clientY! - boundingClientRect.top) * scaleY;

	return {
		mouseX,
		mouseY
	};
}

function getTouchDistance(event: TouchEvent): number {
	if (event.touches.length < 2) {
		return 0;
	}

	const touch1 = event.touches[0]!;
	const touch2 = event.touches[1]!;

	const dx = touch1.clientX - touch2.clientX;
	const dy = touch1.clientY - touch2.clientY;

	return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(event: TouchEvent) {
	if (event.touches.length < 2) {
		return null;
	}

	const canvas = event.target! as HTMLCanvasElement;
	const boundingClientRect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / boundingClientRect.width;
	const scaleY = canvas.height / boundingClientRect.height;

	const touch1 = event.touches[0]!;
	const touch2 = event.touches[1]!;

	const centerX = ((touch1.clientX + touch2.clientX) / 2 - boundingClientRect.left) * scaleX;
	const centerY = ((touch1.clientY + touch2.clientY) / 2 - boundingClientRect.top) * scaleY;

	return {
		centerX,
		centerY
	};
}

function findSpriteAtCoordinates(mouseX: number, mouseY: number): SelectableSprite | null {
	// * Loop over the team backwards to make selections prefer the draw order
	const pokemonArray = Object.values(selectedTeam);
	for (let i = pokemonArray.length - 1; i >= 0; i--) {
		const pokemon = pokemonArray[i];
		const isWithinX = mouseX >= pokemon.drawn_x && mouseX <= pokemon.drawn_x + pokemon.drawn_width;
		const isWithinY = mouseY >= pokemon.drawn_y && mouseY <= pokemon.drawn_y + pokemon.drawn_height;

		if (isWithinX && isWithinY) {
			return pokemon;
		}
	}

	// * Trainer is drawn before the team, so it has the lowest priority
	if (selectedTrainer.value.name !== 'None') {
		const isWithinX = mouseX >= selectedTrainer.value.drawn_x && mouseX <= selectedTrainer.value.drawn_x + selectedTrainer.value.drawn_width;
		const isWithinY = mouseY >= selectedTrainer.value.drawn_y && mouseY <= selectedTrainer.value.drawn_y + selectedTrainer.value.drawn_height;

		if (isWithinX && isWithinY) {
			return selectedTrainer.value;
		}
	}

	return null;
}

function canvasMouseMove(event: MouseEvent): void {
	if (clickedSprite.value && dragOffset.value) {
		const { mouseX, mouseY } = getEventCoordinates(event);

		clickedSprite.value.offset_x = (mouseX - dragOffset.value.x) - clickedSprite.value.original_x;
		clickedSprite.value.offset_y = (mouseY - dragOffset.value.y) - clickedSprite.value.original_y;

		clickedSprite.value.drawn_x = clickedSprite.value.original_x + clickedSprite.value.offset_x;
		clickedSprite.value.drawn_y = clickedSprite.value.original_y + clickedSprite.value.offset_y;

		if (trainerCardCanvas.value) {
			trainerCardCanvas.value.style.cursor = 'grabbing';
		}

		card.cleanup();
		updateCanvas();
	} else {
		const { mouseX, mouseY } = getEventCoordinates(event);
		const hoveredPokemon = findSpriteAtCoordinates(mouseX, mouseY);

		if (trainerCardCanvas.value) {
			trainerCardCanvas.value.style.cursor = hoveredPokemon ? 'grab' : 'default';
		}
	}
}

function canvasMouseDown(event: MouseEvent): void {
	const { mouseX, mouseY } = getEventCoordinates(event);
	const pokemon = findSpriteAtCoordinates(mouseX, mouseY);

	if (pokemon) {
		clickedSprite.value = pokemon;

		dragOffset.value = {
			x: mouseX - pokemon.drawn_x,
			y: mouseY - pokemon.drawn_y
		};

		if (trainerCardCanvas.value) {
			trainerCardCanvas.value.style.cursor = 'grabbing';
		}
	}
}

function canvasMouseUp(event: MouseEvent): void {
	clickedSprite.value = null;
	dragOffset.value = null;

	const { mouseX, mouseY } = getEventCoordinates(event);
	const hoveredPokemon = findSpriteAtCoordinates(mouseX, mouseY);

	if (trainerCardCanvas.value) {
		trainerCardCanvas.value.style.cursor = hoveredPokemon ? 'grab' : 'default';
	}
}

function canvasMouseLeave(): void {
	clickedSprite.value = null;
	dragOffset.value = null;

	if (trainerCardCanvas.value) {
		trainerCardCanvas.value.style.cursor = 'default';
	}
}

function canvasWheel(event: WheelEvent): void {
	if (clickedSprite.value) {
		event.preventDefault();

		const scaleChange = event.deltaY > 0 ? 0.9 : 1.1;
		const currentScale = clickedSprite.value.scale || 1;
		const newScale = currentScale * scaleChange;

		clickedSprite.value.scale = newScale;

		card.cleanup();
		updateCanvas();
	}
}

function canvasTouchStart(event: TouchEvent): void {
	if (event.touches.length === 1) {
		const { mouseX, mouseY } = getEventCoordinates(event);
		const pokemon = findSpriteAtCoordinates(mouseX, mouseY);

		if (pokemon) {
			clickedSprite.value = pokemon;

			dragOffset.value = {
				x: mouseX - pokemon.drawn_x,
				y: mouseY - pokemon.drawn_y
			};
		}
	} else if (event.touches.length === 2) {
		const center = getTouchCenter(event);
		if (center) {
			const pokemon = findSpriteAtCoordinates(center.centerX, center.centerY);
			if (pokemon) {
				pinchData.value = {
					sprite: pokemon,
					initialDistance: getTouchDistance(event),
					initialScale: pokemon.scale || 1
				};

				clickedSprite.value = null;
				dragOffset.value = null;
			}
		}
	}
}

function canvasTouchMove(event: TouchEvent): void {
	if (event.touches.length === 1 && clickedSprite.value && dragOffset.value) {
		const { mouseX, mouseY } = getEventCoordinates(event);

		clickedSprite.value.offset_x = (mouseX - dragOffset.value.x) - clickedSprite.value.original_x;
		clickedSprite.value.offset_y = (mouseY - dragOffset.value.y) - clickedSprite.value.original_y;

		clickedSprite.value.drawn_x = clickedSprite.value.original_x + clickedSprite.value.offset_x;
		clickedSprite.value.drawn_y = clickedSprite.value.original_y + clickedSprite.value.offset_y;

		card.cleanup();
		updateCanvas();
	} else if (event.touches.length === 2 && pinchData.value) {
		const currentDistance = getTouchDistance(event);
		const scaleChange = currentDistance / pinchData.value.initialDistance;
		const newScale = pinchData.value.initialScale * scaleChange;

		pinchData.value.sprite!.scale = newScale;

		card.cleanup();
		updateCanvas();
	}
}

function canvasTouchEnd(event: TouchEvent): void {
	if (event.touches.length === 0) {
		clickedSprite.value = null;
		dragOffset.value = null;
		pinchData.value = null;
	} else if (event.touches.length === 1 && pinchData.value) {
		pinchData.value = null;
	}
}

async function handleFileSaveFilePartySelect(event: Event) {
	const input = event.target as HTMLInputElement;

	if (!input.files?.length) {
		return;
	}

	const file = input.files[0]!;
	const arrayBuffer = await file.arrayBuffer();
	const saveData = parseSave(arrayBuffer, false);

	handleSaveFile(saveData);
}

async function handleFileSaveFileHallOfFameSelect(event: Event) {
	const input = event.target as HTMLInputElement;

	if (!input.files?.length) {
		return;
	}

	const file = input.files[0]!;
	const arrayBuffer = await file.arrayBuffer();
	const saveData = parseSave(arrayBuffer, true);

	handleSaveFile(saveData);
}

function handleSaveFile(saveData: ReturnType<typeof parseSave>) {
	if (!saveData) {
		return;
	}

	trainerName.value = saveData.data.player_name;

	for (let i = 0; i < saveData.data.party.length; i++) {
		const partyPokemon = saveData.data.party[i]!;
		const pokemonData = allPokemonData.value.find(p => p.id.pokeapi === partyPokemon.dex);
		const image = pokemonData?.images.find(i => i.platform === saveData.platform && !i.url.endsWith('_gray.png'));

		if (pokemonData && image) {
			selectedTeamIndex.value = i + 1;
			selectPokemon(pokemonData, image);

			if (partyPokemon.name !== partyPokemon.nickname) {
				updatePokemonNickname(selectedTeamIndex.value, partyPokemon.nickname);
			}
		}
	}

	if (saveData.platform === 'red_blue') {
		trainerHometown.value = 'Pallet Town';
		const trainer = allTrainerData.value.find(t => t.platform === saveData.platform && t.name === 'Red 2');

		if (trainer) {
			selectTrainerNoModal(trainer);
		}
	}

	updateCanvas();
}
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
		<UContainer class="py-10">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div class="space-y-6 order-2 lg:order-1">
					<UCard>
						<template #header>Trainer Card</template>

						<input ref="saveFilePartyInput" type="file" style="display: none" @change="handleFileSaveFilePartySelect">
						<UButton color="neutral" variant="subtle" size="sm" @click="saveFilePartyInput?.click()">Select Save File Party</UButton>
						<br>
						<br>
						<input ref="saveFileHallOfFameInput" type="file" style="display: none" @change="handleFileSaveFileHallOfFameSelect">
						<UButton color="neutral" variant="subtle" size="sm" @click="saveFileHallOfFameInput?.click()">Select Save File Hall of Fame</UButton>
						<br>
						<br>
						<h1>Card Settings</h1>
						<USeparator class="py-5" />
						<div>
							<UButton label="Select Template" color="neutral" variant="subtle" @click="toggleTemplateModal" />
							<UModal v-model:open="templateModalOpen">
								<template #content>
									<div class="p-6 max-h-[85vh] overflow-y-auto">
										<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
											<div v-for="(template, index) in templates" :key="index" class="relative cursor-pointer" @click="selectTemplate(index)">
												<div :class="['border-2 rounded-lg p-3 transition-colors', selectedTrainer?.name === template.name ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300']">
													<div class="w-full mb-3 bg-gray-800 rounded flex items-center justify-center" style="aspect-ratio: 16/10;">
														<img loading="lazy" :src="template.backgrounds[0]!.previewURL" :alt="template.name" class="max-w-full max-h-full object-contain pixelated">
													</div>
													<p class="text-sm font-medium text-center mb-1.5">{{ template.name }}</p>
													<p class="text-xs text-center text-gray-600 mb-2">
														{{ template.backgrounds.length }} {{ template.backgrounds.length === 1 ? 'Background' : 'Backgrounds' }}
													</p>
													<div v-if="template.creatorURL" class="flex justify-center">
														<UButton :to="template.creatorURL" target="_blank" color="neutral" variant="subtle" size="sm">Creator</UButton>
													</div>
												</div>
											</div>
										</div>
									</div>
								</template>
							</UModal>
							<template v-if="card.backgrounds.length > 1">
								<br>
								<br>
								<UDropdownMenu :items="card.backgrounds">
									<template #item="{ item, index }">
										<div class="flex items-center gap-3 w-full" @click="selectBackground(index)">
											<img :src="card.backgrounds.find((bg: any) => bg.name === item.name)?.previewURL" :alt="item.name" class="w-12 h-8 object-cover rounded border">
											<span>{{ item.name }}</span>
										</div>
									</template>
									<UButton color="neutral" variant="subtle">
										Select Background
										<UIcon name="i-lucide-chevron-down" class="w-3 h-3 ml-2" />
									</UButton>
								</UDropdownMenu>
							</template>
							<br>
							<br>
							<UFileUpload v-model="customBackgroundFile" accept="image/*" :interactive="false" :dropzone="true" class="inline-block" @change="selectCustomBackground">
								<template #default="{ open }">
									<UButton color="neutral" variant="subtle" @click="open()">
										Custom Background
										<UIcon name="i-lucide-upload" class="w-4 h-4 ml-2" />
									</UButton>
								</template>
							</UFileUpload>
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
							<br>
							<br>
							<UCheckbox v-model="watermarkEnabled" color="secondary" label="Enable Watermark" @change="updateCanvas" />
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
										<div class="p-4 w-full max-w-4xl">
											<h3 class="text-lg font-semibold mb-4">Select Trainer</h3>

											<div class="mb-4">
												<USelectMenu v-model="selectedTrainerPlatforms" :items="allTrainerPlatforms" multiple placeholder="Filter by platform" class="mb-2 w-full" :popper="{ placement: 'bottom-start' }" :close-on-select="false" />
												<UInput v-model="trainerSearchQuery" placeholder="Search trainer by name..." class="w-full" />
											</div>
											<div v-if="isTrainersLoading" class="flex items-center justify-center h-96">
												<div class="text-center">
													<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
													<p class="text-sm text-gray-500">Loading trainers...</p>
												</div>
											</div>
											<div v-else class="p-4 grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
												<div v-for="(trainer, index) in filteredTrainers" :key="index" class="relative cursor-pointer" @click="selectTrainer(trainer)">
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
										</div>
									</template>
								</UModal>
							</div>
							<div>
								<label for="trainerHometown" class="block text-sm font-medium mb-2">Hometown</label>
								<UInput id="trainerHometown" v-model="trainerHometown" placeholder="Enter trainer hometown" @input="updateCanvas" />
							</div>
							<div>
								<label for="trainerSpecialty" class="block text-sm font-medium mb-2">Specialty</label>
								<UInput id="trainerSpecialty" v-model="trainerSpecialty" placeholder="Enter trainer specialty" @input="updateCanvas" />
							</div>
						</div>
						<div v-if="selectedTrainer.image_url" class="space-y-4">
							<h3 class="text-sm font-medium">Transform</h3>
							<div class="flex flex-col space-y-3 md:hidden">
								<div class="flex items-end space-x-2">
									<div class="flex flex-col flex-1">
										<label class="text-xs text-muted-foreground mb-1">X Offset</label>
										<UInput type="number" :model-value="selectedTrainer.offset_x" size="xs" placeholder="0" @input="updateTrainerOffset('x', parseInt($event.target.value) || 0)" />
									</div>
									<div class="flex flex-col flex-1">
										<label class="text-xs text-muted-foreground mb-1">Y Offset</label>
										<UInput type="number" :model-value="selectedTrainer.offset_y" size="xs" placeholder="0" @input="updateTrainerOffset('y', parseInt($event.target.value) || 0)" />
									</div>
									<div class="flex flex-col flex-1">
										<label class="text-xs text-muted-foreground mb-1">Scale</label>
										<UInput type="number" :model-value="selectedTrainer.scale" size="xs" placeholder="1.0" step="0.1" min="0.1" max="3.0" @input="updateTrainerScale(parseFloat($event.target.value) || 1)" />
									</div>
									<div class="flex flex-col">
										<label class="text-xs text-muted-foreground mb-1">Flip</label>
										<UCheckbox color="secondary" :model-value="selectedTrainer.flipped" @update:model-value="updateTrainerFlip" />
									</div>
									<div class="flex flex-col">
										<label class="text-xs text-muted-foreground mb-1">&nbsp;</label>
										<UButton color="neutral" variant="outline" size="xs" icon="i-lucide-rotate-ccw" title="Reset position & scale" @click="resetTrainerTransform" />
									</div>
								</div>
							</div>
							<div class="hidden md:flex md:items-center md:space-x-4">
								<div class="flex flex-col items-center">
									<label class="text-xs text-muted-foreground mb-1">X Offset</label>
									<UInput type="number" :model-value="selectedTrainer.offset_x" size="xs" placeholder="0" class="w-20 text-center" @input="updateTrainerOffset('x', parseInt($event.target.value) || 0)" />
								</div>
								<div class="flex flex-col items-center">
									<label class="text-xs text-muted-foreground mb-1">Y Offset</label>
									<UInput type="number" :model-value="selectedTrainer.offset_y" size="xs" placeholder="0" class="w-20 text-center" @input="updateTrainerOffset('y', parseInt($event.target.value) || 0)" />
								</div>
								<div class="flex flex-col items-center">
									<label class="text-xs text-muted-foreground mb-1">Scale</label>
									<UInput type="number" :model-value="selectedTrainer.scale" size="xs" placeholder="1.0" step="0.1" min="0.1" max="3.0" class="w-20 text-center" @input="updateTrainerScale(parseFloat($event.target.value) || 1)" />
								</div>
								<div class="flex flex-col items-center">
									<label class="text-xs text-muted-foreground mb-1">Flip</label>
									<UCheckbox color="secondary" :model-value="selectedTrainer.flipped" @update:model-value="updateTrainerFlip" />
								</div>
								<div class="flex flex-col items-center">
									<label class="text-xs text-muted-foreground mb-1">Reset</label>
									<UButton color="neutral" variant="outline" size="xs" icon="i-lucide-rotate-ccw" title="Reset position & scale" @click="resetTrainerTransform" />
								</div>
							</div>
						</div>

						<h1 class="pt-5">Team</h1>
						<USeparator class="py-5" />
						<div class="space-y-4">
							<div v-for="item in 6" :key="item" class="bg-card border border-border rounded-lg p-4 min-h-24 md:min-h-20 cursor-pointer hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-md" @click="togglePokemonModal(item)">
								<div v-if="selectedTeam[item]" class="w-full">
									<div class="flex flex-col space-y-3 md:hidden">
										<div class="flex items-center space-x-4">
											<div class="flex-shrink-0">
												<img :src="selectedTeam[item].image.preview_url" :alt="selectedTeam[item].pokemon.display_name" :class="['w-12', 'h-12', 'object-contain', { pixelated: selectedTeam[item].image.style === 'pixel_art' }]">
											</div>
											<div class="flex flex-col">
												<span class="text-sm font-semibold text-foreground">{{ selectedTeam[item].pokemon.display_name }}</span>
												<span class="text-xs text-muted-foreground">Slot {{ item }}</span>
											</div>
										</div>

										<div class="flex items-end space-x-4" @click.stop>
											<div class="flex flex-col flex-1">
												<label class="text-xs text-muted-foreground mb-1">Gender</label>
												<UDropdownMenu :items="genderOptions(item)" size="xs">
													<UButton color="neutral" variant="outline" size="xs" class="w-full justify-center">
														<div class="flex items-center gap-1">
															<span v-if="selectedTeam[item].gender === 'male'" class="text-blue-500">♂</span>
															<span v-else-if="selectedTeam[item].gender === 'female'" class="text-pink-500">♀</span>
															<span v-else class="text-muted-foreground">None</span>
															<UIcon name="i-lucide-chevron-down" class="w-3 h-3" />
														</div>
													</UButton>
												</UDropdownMenu>
											</div>

											<div class="flex flex-col flex-1">
												<label class="text-xs text-muted-foreground mb-1">Held Item</label>
												<UButton color="neutral" variant="outline" size="xs" class="w-full justify-between" @click="toggleHeldItemModal(item)">
													<div class="flex items-center gap-2 min-w-0">
														<div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
															<img v-if="selectedTeam[item].held_item" :src="selectedTeam[item].held_item.image.preview_url" class="w-4 h-4 object-contain block pixelated" alt="Selected item">
															<UIcon v-else name="i-lucide-minus" class="w-4 h-4 text-gray-400 block" />
														</div>
														<span class="text-xs truncate">{{ selectedTeam[item].held_item?.display_name || 'None' }}</span>
													</div>
												</UButton>
											</div>

											<div class="flex flex-col flex-1">
												<label class="text-xs text-muted-foreground mb-1">Pokeball</label>
												<UDropdownMenu :items="pokeballOptions(item)" size="xs">
													<UButton color="neutral" variant="outline" size="xs" class="w-full justify-center">
														<div class="flex items-center gap-2">
															<div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
																<img v-if="selectedTeam[item].pokeball" :src="selectedTeam[item].pokeball.image.preview_url" class="w-4 h-4 object-contain block pixelated" alt="Selected pokeball">
																<UIcon v-else name="i-lucide-minus" class="w-4 h-4 text-gray-400 block" />
															</div>
															<UIcon name="i-lucide-chevron-down" class="w-3 h-3 flex-shrink-0" />
														</div>
													</UButton>
												</UDropdownMenu>
											</div>
										</div>
										<div class="flex items-end space-x-2" @click.stop>
											<div class="flex flex-col flex-1">
												<label class="text-xs text-muted-foreground mb-1">X Offset</label>
												<UInput type="number" :model-value="selectedTeam[item].offset_x || 0" size="xs" placeholder="0" @input="updatePokemonOffset(item, 'x', parseInt($event.target.value) || 0)" />
											</div>
											<div class="flex flex-col flex-1">
												<label class="text-xs text-muted-foreground mb-1">Y Offset</label>
												<UInput type="number" :model-value="selectedTeam[item].offset_y || 0" size="xs" placeholder="0" @input="updatePokemonOffset(item, 'y', parseInt($event.target.value) || 0)" />
											</div>
											<div class="flex flex-col flex-1">
												<label class="text-xs text-muted-foreground mb-1">Scale</label>
												<UInput type="number" :model-value="selectedTeam[item].scale" size="xs" placeholder="1.0" step="0.1" min="0.1" max="3.0" @input="updatePokemonScale(item, parseFloat($event.target.value) || 1)" />
											</div>
											<div class="flex flex-col">
												<label class="text-xs text-muted-foreground mb-1">Flip</label>
												<UCheckbox color="secondary" :model-value="selectedTeam[item].flipped" @update:model-value="updatePokemonFlip(item, $event)" />
											</div>
											<div class="flex flex-col">
												<label class="text-xs text-muted-foreground mb-1">&nbsp;</label>
												<UButton title="Reset position" color="neutral" variant="outline" size="xs" icon="i-lucide-rotate-ccw" @click="resetPokemonTransform(item)" />
											</div>
										</div>

										<div @click.stop>
											<label class="text-xs text-muted-foreground mb-1 block">Nickname</label>
											<input type="text" class="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background" :value="selectedTeam[item].nickname ?? selectedTeam[item].pokemon.display_name" :placeholder="selectedTeam[item].pokemon.display_name" @input="updatePokemonNickname(item, ($event.target as HTMLInputElement).value)">
										</div>
									</div>
									<div class="hidden md:flex md:items-start md:justify-between md:w-full md:space-x-4">
										<div class="flex items-center space-x-4">
											<div class="flex-shrink-0">
												<img :src="selectedTeam[item].image.preview_url" :alt="selectedTeam[item].pokemon.display_name" :class="['w-12', 'h-12', 'object-contain', { pixelated: selectedTeam[item].image.style === 'pixel_art' }]">
											</div>
											<div class="flex flex-col">
												<span class="text-sm font-semibold text-foreground">{{ selectedTeam[item].pokemon.display_name }}</span>
												<span class="text-xs text-muted-foreground">Slot {{ item }}</span>
											</div>
										</div>
										<div class="flex flex-col space-y-2" @click.stop>
											<div class="flex items-center space-x-4">
												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">Gender</label>
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

												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">Held Item</label>
													<UButton color="neutral" variant="outline" size="xs" @click="toggleHeldItemModal(item)">
														<div class="flex items-center gap-2">
															<div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
																<img v-if="selectedTeam[item].held_item" :src="selectedTeam[item].held_item.image.preview_url" class="w-4 h-4 object-contain block pixelated" alt="Selected item">
																<UIcon v-else name="i-lucide-minus" class="w-4 h-4 text-gray-400 block" />
															</div>
															<span class="text-xs max-w-16 truncate">{{ selectedTeam[item].held_item?.display_name || 'None' }}</span>
														</div>
													</UButton>
												</div>

												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">Pokeball</label>
													<UDropdownMenu :items="pokeballOptions(item)" size="xs">
														<UButton color="neutral" variant="outline" size="xs">
															<div class="flex items-center gap-2">
																<div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
																	<img v-if="selectedTeam[item].pokeball" :src="selectedTeam[item].pokeball.image.preview_url" class="w-4 h-4 object-contain block pixelated" alt="Selected pokeball">
																	<UIcon v-else name="i-lucide-minus" class="w-4 h-4 text-gray-400 block" />
																</div>
																<UIcon name="i-lucide-chevron-down" class="w-3 h-3 flex-shrink-0" />
															</div>
														</UButton>
													</UDropdownMenu>
												</div>

												<div class="flex flex-col">
													<label class="text-xs text-muted-foreground mb-1">Nickname</label>
													<div class="w-32">
														<input type="text" class="w-full px-2 py-1 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center bg-background" :value="selectedTeam[item].nickname ?? selectedTeam[item].pokemon.display_name" :placeholder="selectedTeam[item].pokemon.display_name" @input="updatePokemonNickname(item, ($event.target as HTMLInputElement).value)">
													</div>
												</div>
											</div>

											<div class="flex items-center space-x-2">
												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">X Offset</label>
													<UInput type="number" :model-value="selectedTeam[item].offset_x || 0" size="xs" placeholder="0" class="w-16 text-center" @input="updatePokemonOffset(item, 'x', parseInt($event.target.value) || 0)" />
												</div>
												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">Y Offset</label>
													<UInput type="number" :model-value="selectedTeam[item].offset_y || 0" size="xs" placeholder="0" class="w-16 text-center" @input="updatePokemonOffset(item, 'y', parseInt($event.target.value) || 0)" />
												</div>
												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">Scale</label>
													<UInput type="number" :model-value="selectedTeam[item].scale" size="xs" placeholder="1.0" step="0.1" min="0.1" max="3.0" class="w-16 text-center" @input="updatePokemonScale(item, parseFloat($event.target.value) || 1)" />
												</div>
												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">Flip</label>
													<UCheckbox color="secondary" :model-value="selectedTeam[item].flipped" @update:model-value="updatePokemonFlip(item, $event)" />
												</div>
												<div class="flex flex-col items-center">
													<label class="text-xs text-muted-foreground mb-1">Reset</label>
													<UButton title="Reset position & scale" color="neutral" variant="outline" size="xs" icon="i-lucide-rotate-ccw" @click="resetPokemonTransform(item)" />
												</div>
											</div>
										</div>
									</div>
								</div>

								<div v-else class="flex items-center justify-between w-full h-12">
									<div class="flex items-center space-x-4">
										<div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
											<svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
											</svg>
										</div>
										<div class="flex flex-col">
											<span class="text-sm font-medium text-foreground">Add Pokemon</span>
											<span class="text-xs text-muted-foreground">Slot {{ item }}</span>
										</div>
									</div>

									<div class="text-xs text-muted-foreground hidden sm:block">Click to select</div>
								</div>
							</div>
							<UModal v-model:open="pokemonModalOpen" :ui="{ content: 'fixed bg-default divide-y divide-default flex flex-col focus:outline-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-1rem)] sm:w-max max-w-none max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-lg shadow-lg ring ring-default overflow-hidden' }">
								<template #content>
									<div class="p-4">
										<h3 class="text-lg font-semibold mb-4">Select Pokemon for Slot {{ selectedTeamIndex }}</h3>

										<div class="mb-4">
											<UInput v-model="pokemonSearchQuery" placeholder="Search Pokemon by name..." class="w-full" />
										</div>
										<div class="overflow-y-auto max-h-96">
											<div v-for="pokemon in filteredPokemon" :key="pokemon.name">
												<h3>{{ pokemon.display_name }}</h3>
												<div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2 mb-4">
													<div v-for="image in pokemon.images" :key="`${pokemon.name}-${image.platform}-${image.gender}`" class="flex flex-col items-center" @click="selectPokemon(pokemon, image)">
														<div class="w-16 h-16 flex items-center justify-center overflow-hidden cursor-pointer">
															<img loading="lazy" :src="image.preview_url" alt="" :class="['w-full', 'h-full', 'object-contain', { pixelated: image.style === 'pixel_art' }]" @load="loadImage(image.url)">
														</div>
														<div class="text-xs text-center mt-1">
															<div>{{ image.platform_display_name }}</div>
															<div>
																<UButton v-if="image.creator_url" :to="image.creator_url" target="_blank" color="neutral" variant="subtle">{{ image.creator }}</UButton>
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
							<UModal v-model:open="heldItemModalOpen">
								<template #content>
									<div class="p-4 w-full max-w-4xl">
										<h3 class="text-lg font-semibold mb-4">Select Item</h3>

										<div class="mb-4">
											<UInput v-model="heldItemSearchQuery" placeholder="Search item by name..." class="w-full" />
										</div>
										<div v-if="isHeldItemsLoading" class="flex items-center justify-center h-96">
											<div class="text-center">
												<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
												<p class="text-sm text-gray-500">Loading items...</p>
											</div>
										</div>
										<div v-else class="p-4 grid grid-cols-5 gap-3 max-h-96 overflow-y-auto">
											<div v-for="(heldItem, index) in filteredHeldItems" :key="index" class="relative cursor-pointer" @click="selectHeldItem(heldItem)">
												<div :class="['border-2 rounded-lg p-2 transition-colors', selectedTeamIndex && selectedTeam[selectedTeamIndex]?.held_item?.name === heldItem.name ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300']">
													<div class="aspect-square flex items-center justify-center bg-gray-50 rounded">
														<img v-if="heldItem.image.preview_url" loading="lazy" :src="heldItem.image.preview_url" :alt="heldItem.name" :class="['max-w-full', 'max-h-full', 'object-contain', { pixelated: heldItem.image.style === 'pixel_art' }]">
														<div v-else class="text-gray-400 text-xs text-center">{{ heldItem.name }}</div>
													</div>
													<p class="text-xs text-center mt-2 truncate">{{ heldItem.display_name }}</p>
												</div>
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
					<UModal v-model:open="exportAnimatedCardModalOpen">
						<template #content>
							<div class="p-6">
								<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Export Format</h3>
								<USeparator class="mb-6" />

								<div class="space-y-4">
									<button class="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 transition-all" @click="exportAnimatedCard('video/webm; codecs=vp9', 'webm')">
										<div class="text-left">
											<div class="font-bold text-gray-900 dark:text-white">
												WebM VP9
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
												Best quality, smaller file size
											</div>
										</div>
									</button>

									<button class="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 transition-all" @click="exportAnimatedCard('video/webm; codecs=vp8', 'webm')">
										<div class="text-left">
											<div class="font-bold text-gray-900 dark:text-white">
												WebM VP8
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
												Better browser compatibility
											</div>
										</div>
									</button>

									<button class="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500 transition-all" @click="exportAnimatedCard('video/mp4; codecs=avc1.42E01E', 'mp4')">
										<div class="text-left">
											<div class="font-bold text-gray-900 dark:text-white">
												MP4 H.264
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
												Universal support
											</div>
										</div>
									</button>
								</div>

								<div class="flex justify-end mt-6">
									<UButton variant="ghost" @click="exportAnimatedCardModalOpen = false">
										Cancel
									</UButton>
								</div>
							</div>
						</template>
					</UModal>
					<UModal v-model:open="animatedCardExportingModalOpen" :prevent-close="true">
						<template #content>
							<div class="p-6">
								<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Exporting Animation</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Please wait while your trainer card is being processed...</p>

								<div class="space-y-4">
									<UProgress :model-value="exportProgress" :max="100" color="primary" size="lg" />
									<div class="text-center">
										<p class="text-sm font-medium text-gray-700 dark:text-gray-300">
											{{ exportStatusText }}
										</p>
										<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
											{{ exportProgress }}% complete
										</p>
									</div>
								</div>
							</div>
						</template>
					</UModal>
					<div class="flex gap-2">
						<UButton label="Download Trainer Card" color="neutral" variant="subtle" @click="exportCard" />
						<UPopover>
							<UButton icon="i-heroicons-question-mark-circle" label="Controls" color="neutral" variant="subtle" />
							<template #content>
								<div class="p-4 w-72">
									<div class="space-y-4">
										<div>
											<h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Desktop</h4>
											<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
												<div class="flex items-center gap-2">
													<span>• <UKbd>Left-Click</UKbd> & drag to move sprite</span>
												</div>
												<div class="flex items-center gap-2">
													<span>• <UKbd>Left-Click</UKbd> & <UKbd>scroll</UKbd> to scale</span>
												</div>
											</div>
										</div>
										<div>
											<h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Mobile</h4>
											<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
												<div>• <UKbd>Tap</UKbd> & <UKbd>drag</UKbd> to move sprite</div>
												<div>• <UKbd>Pinch</UKbd> to scale</div>
											</div>
										</div>
									</div>
								</div>
							</template>
						</UPopover>
					</div>
					<USeparator class="py-5" />
					<div class="rounded-lg bg-card shadow-sm">
						<div class="relative w-full">
							<canvas ref="trainerCardCanvas" class="w-full h-auto rounded-lg pixelated" @mousemove="canvasMouseMove" @mousedown="canvasMouseDown" @mouseup="canvasMouseUp" @mouseleave="canvasMouseLeave" @wheel.prevent="canvasWheel" @touchstart.prevent="canvasTouchStart" @touchmove.prevent="canvasTouchMove" @touchend.prevent="canvasTouchEnd" />
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
