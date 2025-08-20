import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type PokemonImage from '@/types/pokemon-image';
import type FontCharacterImage from '@/types/font-character-image';

const { loadImage } = useImageCache();

export default class DiamondPearlRed extends TrainerCard {
	public static override name = 'Diamond / Pearl (0 Star)';
	public static override previewURL = '/images/trainer-cards/gen-4-custom-red.png';
	protected override backgroundURL = '/images/trainer-cards/gen-4-custom-red.png';
	protected override backgroundOriginalWidth = 240;
	protected override backgroundOriginalHeight = 176;
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

		const boundingBoxWidth = 72;
		const boundingBoxHeight = 91;
		const rightOffset = 84;
		const topOffset = 116;

		const boundingBoxX = (this.backgroundOriginalWidth - rightOffset) * this.backgroundScale;
		const boundingBoxY = (topOffset - boundingBoxHeight) * this.backgroundScale;

		let scaledContentWidth = trainer.dimensions!.content.width * this.trainerImageScale;
		let scaledContentHeight = trainer.dimensions!.content.height * this.trainerImageScale;

		const maxWidth = boundingBoxWidth * this.backgroundScale;
		const maxHeight = boundingBoxHeight * this.backgroundScale;

		const scaleX = maxWidth / scaledContentWidth;
		const scaleY = maxHeight / scaledContentHeight;
		const fitScale = Math.min(1, scaleX, scaleY);

		scaledContentWidth *= fitScale;
		scaledContentHeight *= fitScale;

		const x = boundingBoxX + (maxWidth - scaledContentWidth) / 2;
		const y = boundingBoxY + (maxHeight - scaledContentHeight) / 2;

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
		const x = 144 * this.trainerNameScale; // * This is offset by 7 from the real position to account for some jank math in this.drawText
		const y = 26 * this.trainerNameScale;

		await this.drawText(name, x, y, this.trainerNameScale);
	}

	override async drawPokemonTeam(team: PokemonTeam) {
		const scale = this.pokemonScale;
		const pokemonSize = 30 * scale;
		const spacing = 15 * scale;
		const slotOffset = pokemonSize + spacing;
		const columnBase = (7 + 8) * scale;
		const rowBase = (41 + 8) * scale;

		const column1X = columnBase;
		const column2X = columnBase + slotOffset;
		const column3X = columnBase + (slotOffset * 2);

		const row1Y = rowBase;
		const row2Y = rowBase + slotOffset;

		if (team[1]) {
			await this.drawPokemon(team[1].image, column1X, row1Y, pokemonSize, pokemonSize);
		}

		if (team[2]) {
			await this.drawPokemon(team[2].image, column2X, row1Y, pokemonSize, pokemonSize);
		}

		if (team[3]) {
			await this.drawPokemon(team[3].image, column3X, row1Y, pokemonSize, pokemonSize);
		}

		if (team[4]) {
			await this.drawPokemon(team[4].image, column1X, row2Y, pokemonSize, pokemonSize);
		}

		if (team[5]) {
			await this.drawPokemon(team[5].image, column2X, row2Y, pokemonSize, pokemonSize);
		}

		if (team[6]) {
			await this.drawPokemon(team[6].image, column3X, row2Y, pokemonSize, pokemonSize);
		}
	}

	private async drawPokemon(image: PokemonImage, x: number, y: number, width: number, height: number) {
		// * Fuck it, we ball.
		// * This works well enough. Monkey-slamming the keyboard ftw.
		const padding = image.dimensions.padding;
		const pokemonImage = await loadImage(image.url);

		const contentWidth = pokemonImage.width - padding.left - padding.right;
		const contentHeight = pokemonImage.height - padding.top - padding.bottom;

		const scaleX = width / contentWidth;
		const scaleY = height / contentHeight;
		const scale = Math.min(scaleX, scaleY);

		const drawWidth = contentWidth * scale;
		const drawHeight = contentHeight * scale;

		const offsetX = (width - drawWidth) / 2;
		const offsetY = (height - drawHeight) / 2;

		this.ctx.drawImage(
			pokemonImage,
			padding.left,
			padding.top,
			contentWidth,
			contentHeight,
			x + offsetX,
			y + offsetY,
			drawWidth,
			drawHeight
		);
	}

	override async drawBadges(urls: string[]) {
		const slotSize = 16;
		const startX = (7 + 8);
		const startY = (167 - 30) + ((30 - 16) / 2);
		const slotSpacing = (228 - 18 - (8 * 16)) / 7;

		// * Card only has 8 slots for badges
		for (let i = 0; i < 8; i++) {
			if (urls[i]) {
				const image = await loadImage(urls[i]!);

				const slotX = (startX + (i * (slotSize + slotSpacing))) * this.backgroundScale;
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
		const x = 222 * this.backgroundScale;
		const y = 12 * this.backgroundScale;
		const scale = 5;

		await this.drawText('https://trainercards.studio', x, y, scale);
	}

	private async drawText(text: string, x: number, y: number, scale: number) {
		// * The sprite sheet https://www.spriters-resource.com/ds_dsi/pokemondiamondpearl/sheet/6963/
		// * has the wrong font. You can see this at https://archives.bulbagarden.net/media/upload/8/84/Trainer_Card_Pt.png
		// * where clearly the "N" and other characters are different.
		// *
		// TODO - Support lowercase letters and other characters
		if (!this.font) {
			const response = await fetch('/api/font/gen4');
			this.font = await response.json();
		}

		// * Since we're writing text backwards, we need to do some extra handling here
		// * to make sure variable-width characters are positioned correctly
		let totalWidth = 0;
		for (let i = 0; i < text.length; i++) {
			const symbol = text[i]!.toUpperCase();
			if (symbol === ' ') {
				totalWidth += 7 * scale; // TODO - Should this default size go inside the font response?
			} else {
				const character = this.font!.find(char => char.symbol === symbol);
				if (character) {
					totalWidth += character.dimensions.original.width * scale;
				}
			}
		}

		x = x - totalWidth;

		for (let i = 0; i < text.length; i++) {
			const symbol = text[i]!.toUpperCase();

			if (symbol === ' ') {
				x += 7 * scale; // TODO - Should this default size go inside the font response?
				continue;
			}

			const character = this.font!.find(char => char.symbol === symbol);
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
