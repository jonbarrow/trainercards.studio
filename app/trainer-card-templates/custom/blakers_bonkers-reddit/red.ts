import TrainerCard from '@/trainer-card-templates/TrainerCard';
import pokemonTypeColors from '@/pokemon-type-colors';
import type PokemonTeam from '@/types/pokemon-team';
import type { PokemonInTeam } from '@/types/pokemon-team';
import type TrainerImage from '@/types/trainer-image';

const { loadImage } = useImageCache();
let trainerFontLoaded = false;
let pokemonNicknameFontLoaded = false;

export default class CustomBlakersBonkersRedditRed extends TrainerCard {
	public static override name = 'Custom 1';
	public static override creatorURL = 'https://reddit.com/user/blakers_bonkers';
	public static override creator = '/u/blakers_bonkers';

	public override backgrounds = [
		{
			name: 'Custom 1',
			previewURL: '/images/trainer-cards/custom/blakers_bonkers-reddit/red/preview.png',
			backgroundURL: '/images/trainer-cards/custom/blakers_bonkers-reddit/red/background.png'
		}
	];

	protected override backgroundOriginalWidth = 250;
	protected override backgroundOriginalHeight = 162;
	protected override backgroundScale = 10;
	protected override pokemonScale = 10;
	protected override trainerImageX = 238;
	protected override trainerImageY = 133;
	protected override trainerImageBoundingBoxWidth = 49;
	protected override trainerImageBoundingBoxHeight = 88;
	protected override trainerImageScale = 10;
	protected override trainerNameScale = 10;

	async drawBackground(customURL: string | null) {
		this.rescaleCanvas();
		this.ctx.imageSmoothingEnabled = false;

		const displayWidth = this.backgroundOriginalWidth * this.backgroundScale;
		const displayHeight = this.backgroundOriginalHeight * this.backgroundScale;
		const backgroundURL = customURL ? customURL : this.backgrounds[this.selectedBackgroundIndex]!.backgroundURL;
		const backgroundImage = await loadImage(backgroundURL);

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(backgroundImage, 0, 0, displayWidth, displayHeight);
	}

	override async drawTrainerImage(trainer: TrainerImage): Promise<void> {
		await super.drawTrainerImage(trainer);

		const displayWidth = this.backgroundOriginalWidth * this.backgroundScale;
		const displayHeight = this.backgroundOriginalHeight * this.backgroundScale;
		const textOverlayImage = await loadImage('/images/trainer-cards/custom/blakers_bonkers-reddit/red/text-overlay.png');

		this.ctx.drawImage(textOverlayImage, 0, 0, displayWidth, displayHeight);
	}

	override async drawTrainerName(name: string): Promise<void> {
		await this.drawText(name, 66, 76, 7);
	}

	override async drawTrainerHometown(hometown: string): Promise<void> {
		await this.drawText(hometown, 66, 95, 7);
	}

	override async drawTrainerSpecialty(specialty: string): Promise<void> {
		await this.drawText(specialty, 66, 114, 7);
	}

	override async drawPokemonTeam(team: PokemonTeam) {
		const scale = this.pokemonScale;
		const containerLeft = 132 * scale;
		const containerTop = 31 * scale;

		const slotWidth = 52 * scale;
		const slotHeight = 30 * scale;

		const column1X = containerLeft + (3 * scale);
		const column2X = column1X + slotWidth + (4 * scale);

		const row1Y = containerTop + (3 * scale);
		const row2Y = row1Y + slotHeight + (3 * scale);
		const row3Y = row2Y + slotHeight + (3 * scale);

		if (team[1]) {
			await this.drawClippedPokemon(team[1], column1X, row1Y, slotWidth, slotHeight);
			await this.drawPokemonNickname(team[1], column1X, row1Y + slotHeight);
		}

		if (team[2]) {
			await this.drawClippedPokemon(team[2], column1X, row2Y, slotWidth, slotHeight);
			await this.drawPokemonNickname(team[2], column1X, row2Y + slotHeight);
		}

		if (team[3]) {
			await this.drawClippedPokemon(team[3], column1X, row3Y, slotWidth, slotHeight);
			await this.drawPokemonNickname(team[3], column1X, row3Y + slotHeight);
		}

		if (team[4]) {
			await this.drawClippedPokemon(team[4], column2X, row1Y, slotWidth, slotHeight);
			await this.drawPokemonNickname(team[4], column2X, row1Y + slotHeight);
		}

		if (team[5]) {
			await this.drawClippedPokemon(team[5], column2X, row2Y, slotWidth, slotHeight);
			await this.drawPokemonNickname(team[5], column2X, row2Y + slotHeight);
		}

		if (team[6]) {
			await this.drawClippedPokemon(team[6], column2X, row3Y, slotWidth, slotHeight);
			await this.drawPokemonNickname(team[6], column2X, row3Y + slotHeight);
		}

		const displayWidth = this.backgroundOriginalWidth * this.backgroundScale;
		const displayHeight = this.backgroundOriginalHeight * this.backgroundScale;
		const teamOverlayImage = await loadImage('/images/trainer-cards/custom/blakers_bonkers-reddit/red/team-overlay.png');

		this.ctx.drawImage(teamOverlayImage, 0, 0, displayWidth, displayHeight);

		if (team[1]?.pokemon.types) {
			await this.drawPokemonTypeColors(team[1], column1X, row1Y);
		}

		if (team[2]?.pokemon.types) {
			await this.drawPokemonTypeColors(team[2], column1X, row2Y);
		}

		if (team[3]?.pokemon.types) {
			await this.drawPokemonTypeColors(team[3], column1X, row3Y);
		}

		if (team[4]?.pokemon.types) {
			await this.drawPokemonTypeColors(team[4], column2X, row1Y);
		}

		if (team[5]?.pokemon.types) {
			await this.drawPokemonTypeColors(team[5], column2X, row2Y);
		}

		if (team[6]?.pokemon.types) {
			await this.drawPokemonTypeColors(team[6], column2X, row3Y);
		}

		// * It's really hacky to check this here and call these functions again, since they
		// * already get called in the TrainerCard class, but I really don't care right now

		if (team[1]?.pokeball) {
			await this.drawPokemonPokeball(team[1], 0, 0, 0, 0);
		}

		if (team[2]?.pokeball) {
			await this.drawPokemonPokeball(team[2], 0, 0, 0, 0);
		}

		if (team[3]?.pokeball) {
			await this.drawPokemonPokeball(team[3], 0, 0, 0, 0);
		}

		if (team[4]?.pokeball) {
			await this.drawPokemonPokeball(team[4], 0, 0, 0, 0);
		}

		if (team[5]?.pokeball) {
			await this.drawPokemonPokeball(team[5], 0, 0, 0, 0);
		}

		if (team[6]?.pokeball) {
			await this.drawPokemonPokeball(team[6], 0, 0, 0, 0);
		}

		if (team[1]?.held_item) {
			await this.drawPokemonHeldItem(team[1], 0, 0, 0, 0);
		}

		if (team[2]?.held_item) {
			await this.drawPokemonHeldItem(team[2], 0, 0, 0, 0);
		}

		if (team[3]?.held_item) {
			await this.drawPokemonHeldItem(team[3], 0, 0, 0, 0);
		}

		if (team[4]?.held_item) {
			await this.drawPokemonHeldItem(team[4], 0, 0, 0, 0);
		}

		if (team[5]?.held_item) {
			await this.drawPokemonHeldItem(team[5], 0, 0, 0, 0);
		}

		if (team[6]?.held_item) {
			await this.drawPokemonHeldItem(team[6], 0, 0, 0, 0);
		}
	}

	private async drawPokemonNickname(pokemon: PokemonInTeam, x: number, y: number): Promise<void> {
		if (pokemon.nickname === pokemon.pokemon.display_name) {
			return;
		}

		if (!pokemonNicknameFontLoaded) {
			const font = new FontFace('xenon2', 'url(/fonts/xenon2/xenon2.ttf)');
			await font.load();
			document.fonts.add(font);
			pokemonNicknameFontLoaded = true;
		}

		const baseFontSize = 5;
		const scaledFontSize = baseFontSize * this.backgroundScale;
		const padding = 1 * this.backgroundScale;

		this.ctx.font = `bold ${scaledFontSize}px "xenon2", sans-serif`;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'top';

		const textMetrics = this.ctx.measureText(pokemon.nickname);
		const textWidth = textMetrics.width;
		const textHeight = scaledFontSize;

		const boxWidth = textWidth + padding;
		const boxHeight = textHeight + (padding * 2);
		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(x, y - boxHeight, boxWidth, boxHeight);

		this.ctx.fillStyle = 'black';
		this.ctx.globalAlpha = 1;
		this.ctx.fillText(pokemon.nickname, x + padding, y - boxHeight + padding);
	}

	private async drawPokemonTypeColors(pokemon: PokemonInTeam, x: number, y: number): Promise<void> {
		const scale = this.backgroundScale;
		const squareSize = 2 * scale;

		// Offset from slot position
		const offsetX = 49 * scale;
		const offsetY = 25 * scale;

		const topSquareX = x + offsetX;
		const topSquareY = y + offsetY;
		const bottomSquareY = topSquareY + (3 * scale);

		const types = pokemon.pokemon.types;

		if (types[0]) {
			this.ctx.fillStyle = pokemonTypeColors[types[0]];
			this.ctx.fillRect(topSquareX, topSquareY, squareSize, squareSize);
		}

		if (types[1]) {
			this.ctx.fillStyle = pokemonTypeColors[types[1]];
			this.ctx.fillRect(topSquareX, bottomSquareY, squareSize, squareSize);
		}
	}

	override async drawBadges(urls: string[]) {
		const slotSize = 16;
		const startX = 52;
		const startY = 136;
		const slotSpacing = 24;

		// * Card only has 8 slots for badges
		for (let i = 0; i < 8; i++) {
			if (urls[i]) {
				const image = await loadImage(urls[i]!);

				const slotX = (startX + (i * slotSpacing)) * this.backgroundScale;
				const slotY = startY * this.backgroundScale;
				const scaledSlotSize = slotSize * this.backgroundScale;

				const scaleX = scaledSlotSize / (image.width * this.backgroundScale);
				const scaleY = scaledSlotSize / (image.height * this.backgroundScale);
				const fitScale = Math.min(1, scaleX, scaleY);

				const badgeWidth = image.width * this.backgroundScale * fitScale;
				const badgeHeight = image.height * this.backgroundScale * fitScale;

				const badgeX = slotX + (scaledSlotSize - badgeWidth) / 2 - this.backgroundScale;
				const badgeY = slotY + (scaledSlotSize - badgeHeight) / 2 - this.backgroundScale;

				this.ctx.drawImage(
					image,
					0, 0,
					image.width,
					image.height,
					badgeX,
					badgeY,
					badgeWidth,
					badgeHeight
				);
			}
		}
	}

	override async drawWatermark(): Promise<void> {
		await this.drawText('Made with https://trainercards.studio', 10, 39, 4);
	}

	private async drawText(text: string, x: number, y: number, fontSize: number) {
		if (!trainerFontLoaded) {
			const font = new FontFace('Ari W9500', 'url(/fonts/ari-w9500/ari-w9500.otf)');
			await font.load();
			document.fonts.add(font);
			trainerFontLoaded = true;
		}

		x = x * this.trainerNameScale;
		y = y * this.trainerNameScale;

		const baseFontSize = fontSize;
		const scaledFontSize = baseFontSize * this.backgroundScale;

		this.ctx.font = `bold ${scaledFontSize}px "Ari W9500", sans-serif`;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'top';

		this.ctx.fillStyle = 'white';
		this.ctx.globalAlpha = 1;
		this.ctx.fillText(text, x, y);
	}

	protected override async drawPokemonPokeball(pokemon: PokemonInTeam, _drawWidth: number, _drawHeight: number, _finalX: number, _finalY: number): Promise<void> {
		if (!pokemon.pokeball) {
			return;
		}

		const scale = this.pokemonScale;
		const containerLeft = 132 * scale;
		const containerTop = 31 * scale;

		const slotWidth = 52 * scale;
		const slotHeight = 30 * scale;

		const column1X = containerLeft + (3 * scale);
		const column2X = column1X + slotWidth + (4 * scale);

		const row1Y = containerTop + (3 * scale);
		const row2Y = row1Y + slotHeight + (3 * scale);
		const row3Y = row2Y + slotHeight + (3 * scale);

		let slotX: number;
		let slotY: number;

		if (pokemon.slot === 1 || pokemon.slot === 2 || pokemon.slot === 3) {
			slotX = column1X;
		} else {
			slotX = column2X;
		}

		if (pokemon.slot === 1 || pokemon.slot === 4) {
			slotY = row1Y;
		} else if (pokemon.slot === 2 || pokemon.slot === 5) {
			slotY = row2Y;
		} else {
			slotY = row3Y;
		}

		const pokeballImage = await loadImage(pokemon.pokeball.image.url);
		const pokeballPadding = pokemon.pokeball.image.dimensions.padding;
		const pokeballContentWidth = pokemon.pokeball.image.dimensions.content.width;
		const pokeballContentHeight = pokemon.pokeball.image.dimensions.content.height;

		const pokeballSize = 8 * scale;
		const pokeballScaleX = pokeballSize / pokeballContentWidth;
		const pokeballScaleY = pokeballSize / pokeballContentHeight;
		const pokeballScale = Math.min(pokeballScaleX, pokeballScaleY);

		const pokeballDrawWidth = pokeballContentWidth * pokeballScale;
		const pokeballDrawHeight = pokeballContentHeight * pokeballScale;

		const offsetX = 50 * scale;
		const offsetY = 3 * scale;

		const centerX = slotX + offsetX;
		const centerY = slotY + offsetY;

		const pokeballX = centerX - (pokeballDrawWidth / 2);
		const pokeballY = centerY - (pokeballDrawHeight / 2);

		this.ctx.drawImage(
			pokeballImage,
			pokeballPadding.left,
			pokeballPadding.top,
			pokeballContentWidth,
			pokeballContentHeight,
			pokeballX,
			pokeballY,
			pokeballDrawWidth,
			pokeballDrawHeight
		);
	}

	protected override async drawPokemonHeldItem(pokemon: PokemonInTeam, _drawWidth: number, _drawHeight: number, _finalX: number, _finalY: number): Promise<void> {
		if (!pokemon.held_item) {
			return;
		}

		const scale = this.pokemonScale;
		const containerLeft = 132 * scale;
		const containerTop = 31 * scale;

		const slotWidth = 52 * scale;
		const slotHeight = 30 * scale;

		const column1X = containerLeft + (3 * scale);
		const column2X = column1X + slotWidth + (4 * scale);

		const row1Y = containerTop + (3 * scale);
		const row2Y = row1Y + slotHeight + (3 * scale);
		const row3Y = row2Y + slotHeight + (3 * scale);

		let slotX: number;
		let slotY: number;

		if (pokemon.slot === 1 || pokemon.slot === 2 || pokemon.slot === 3) {
			slotX = column1X;
		} else {
			slotX = column2X;
		}

		if (pokemon.slot === 1 || pokemon.slot === 4) {
			slotY = row1Y;
		} else if (pokemon.slot === 2 || pokemon.slot === 5) {
			slotY = row2Y;
		} else {
			slotY = row3Y;
		}

		const heldItemImage = await loadImage(pokemon.held_item.image.url);
		const heldItemPadding = pokemon.held_item.image.dimensions.padding;
		const heldItemContentWidth = pokemon.held_item.image.dimensions.content.width;
		const heldItemContentHeight = pokemon.held_item.image.dimensions.content.height;

		const heldItemSize = 8 * scale;
		const heldItemScaleX = heldItemSize / heldItemContentWidth;
		const heldItemScaleY = heldItemSize / heldItemContentHeight;
		const heldItemScale = Math.min(heldItemScaleX, heldItemScaleY);

		const heldItemDrawWidth = heldItemContentWidth * heldItemScale;
		const heldItemDrawHeight = heldItemContentHeight * heldItemScale;

		const offsetX = 2 * scale;
		const offsetY = 3 * scale;

		const centerX = slotX + offsetX;
		const centerY = slotY + offsetY;

		const heldItemX = centerX - (heldItemDrawWidth / 2);
		const heldItemY = centerY - (heldItemDrawHeight / 2);

		this.ctx.drawImage(
			heldItemImage,
			heldItemPadding.left,
			heldItemPadding.top,
			heldItemContentWidth,
			heldItemContentHeight,
			heldItemX,
			heldItemY,
			heldItemDrawWidth,
			heldItemDrawHeight
		);
	}

	// * Not supported
	override async drawIcon1(_imageURL: string, _text: string): Promise<void> {}
	override async drawIcon2(_imageURL: string, _text: string): Promise<void> {}
}
