import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type FontCharacterImage from '@/types/font-character-image';

const { loadImage } = useImageCache();

export default class RubySapphire extends TrainerCard {
	public static override name = 'Ruby / Sapphire';
	public static override previewURL = '/images/trainer-cards/gen-3-trainer-card-no-id-no.png';
	protected override backgroundURL = '/images/trainer-cards/gen-3-trainer-card-no-id-no.png';
	protected override backgroundOriginalWidth = 228;
	protected override backgroundOriginalHeight = 140;
	protected override backgroundScale = 10;
	protected override pokemonScale = 10;
	protected override trainerImageScale = 10;
	protected override trainerNameScale = 10;

	private font?: FontCharacterImage[];

	async drawBackground() {
		this.rescaleCanvas();
		this.ctx.imageSmoothingEnabled = false;

		const displayWidth = this.backgroundOriginalWidth * this.backgroundScale;
		const displayHeight = this.backgroundOriginalHeight * this.backgroundScale;
		const backgroundImage = await loadImage(this.backgroundURL);

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(backgroundImage, 0, 0, displayWidth, displayHeight);
	}

	async drawTrainerImage(trainer: TrainerImage) {
		const trainerImage = await loadImage(trainer.image_url);

		const rightOffset = 48;
		const topOffset = 70;

		let scaledContentWidth = trainer.dimensions!.content.width * this.trainerImageScale;
		let scaledContentHeight = trainer.dimensions!.content.height * this.trainerImageScale;

		const maxWidth = (this.backgroundOriginalWidth - rightOffset) * this.backgroundScale;
		const maxHeight = (this.backgroundOriginalHeight - topOffset) * this.backgroundScale;

		const scaleX = maxWidth / scaledContentWidth;
		const scaleY = maxHeight / scaledContentHeight;
		const fitScale = Math.min(1, scaleX, scaleY);

		scaledContentWidth *= fitScale;
		scaledContentHeight *= fitScale;

		const x = (this.backgroundOriginalWidth - rightOffset) * this.backgroundScale - scaledContentWidth / 2;
		const y = topOffset * this.backgroundScale - scaledContentHeight / 2;

		this.ctx.drawImage(
			trainerImage,
			trainer.dimensions!.padding.left,
			trainer.dimensions!.padding.top,
			trainer.dimensions!.content.width,
			trainer.dimensions!.content.height,
			x,
			y,
			scaledContentWidth,
			scaledContentHeight
		);
	}

	override async drawTrainerName(name: string): Promise<void> {
		const x = 50 * this.trainerNameScale;
		const y = 36 * this.trainerNameScale;

		await this.drawText(name, x, y, this.trainerNameScale);
	}

	override async drawPokemonTeam(team: PokemonTeam) {
		// * The values 18 and 55 come from the pixel offsets from the original
		// * 1x scale card image.
		// *
		// * The rest of the values came from me monkey-slamming my keyboard
		// * until something that wasn't total garbage came out. This is my
		// * first time writing any sort of dynamic drawing code like this.
		// *
		// * I hope that you will forgive me, because I know God will not.
		const scale = this.pokemonScale;
		const pokemonSize = 20 * scale;
		const spacing = pokemonSize / 4;
		const slotOffset = pokemonSize + spacing;
		const columnBase = 18 * scale;
		const rowBase = 55 * scale;

		const column1X = columnBase;
		const column2X = columnBase + slotOffset;
		const column3X = columnBase + (slotOffset * 2);

		const row1Y = rowBase;
		const row2Y = rowBase + slotOffset;

		if (team[1]) {
			await this.drawPokemon(team[1], column1X, row1Y, pokemonSize, pokemonSize);
		}

		if (team[2]) {
			await this.drawPokemon(team[2], column2X, row1Y, pokemonSize, pokemonSize);
		}

		if (team[3]) {
			await this.drawPokemon(team[3], column3X, row1Y, pokemonSize, pokemonSize);
		}

		if (team[4]) {
			await this.drawPokemon(team[4], column1X, row2Y, pokemonSize, pokemonSize);
		}

		if (team[5]) {
			await this.drawPokemon(team[5], column2X, row2Y, pokemonSize, pokemonSize);
		}

		if (team[6]) {
			await this.drawPokemon(team[6], column3X, row2Y, pokemonSize, pokemonSize);
		}
	}

	override async drawBadges(urls: string[]) {
		const slotSize = 16;
		const startX = 27;
		const startY = 115;
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
		const x = 113 * this.backgroundScale;
		const y = 15 * this.backgroundScale;
		const scale = 5;

		await this.drawText('Made with https://trainercards.studio', x, y, scale);
	}

	private async drawText(text: string, x: number, y: number, scale: number) {
		// * There is no font for this, we just have raster images
		// * https://www.spriters-resource.com/fullview/8307/
		// *
		// * Draw it image-by-image like a caveman I guess
		// TODO - Support lowercase letters and other characters
		if (!this.font) {
			const response = await fetch('/api/font/gen3');
			this.font = await response.json();
		}

		for (let i = 0; i < text.length; i++) {
			const symbol = text[i]!.toUpperCase();
			const character = this.font!.find(char => char.symbol === symbol);

			if (symbol === ' ') {
				x += 6 * scale; // TODO - Should this default size go inside the font response?
				continue;
			}

			if (!character) {
				continue;
			}

			const image = await loadImage(character.url);

			this.ctx.drawImage(
				image,
				0,
				0,
				character.dimensions.original.width,
				character.dimensions.original.height,
				x,
				y,
				character.dimensions.original.width * scale,
				character.dimensions.original.height * scale
			);

			x += character.dimensions.original.width * scale;
		}
	}

	// * Not supported
	override async drawIcon1(_imageURL: string, _text: string): Promise<void> {}
	override async drawIcon2(_imageURL: string, _text: string): Promise<void> {}
}
