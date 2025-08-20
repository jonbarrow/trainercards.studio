import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type PokemonImage from '@/types/pokemon-image';
import type FontCharacterImage from '@/types/font-character-image';

const { loadImage } = useImageCache();

export default class RedBlueGB extends TrainerCard {
	public static override name = 'Red / Blue (GB)';
	public static override previewURL = '/images/trainer-cards/gen-1.png';
	protected override backgroundURL = '/images/trainer-cards/gen-1.png';
	protected override backgroundOriginalWidth = 160;
	protected override backgroundOriginalHeight = 64;
	protected override backgroundScale = 20;
	protected override pokemonScale = 20;
	protected override trainerImageScale = 20;
	protected override trainerNameScale = 20;

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

		// * Shout out to https://www.spriters-resource.com/game_boy_gbc/pokemonredblue/sheet/8733/
		// * for having the actual bounding box position/size. We can actually place trainers
		// * perfectly now
		const boundingBoxWidth = 32;
		const boundingBoxHeight = 48;
		const rightOffset = 40;
		const topOffset = 56;

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
		const x = 56 * this.trainerNameScale;
		const y = 16 * this.trainerNameScale;

		await this.drawText(name, x, y, this.trainerNameScale);
	}

	override async drawPokemonTeam(team: PokemonTeam) {
		const scale = this.pokemonScale;
		const pokemonSize = 12 * scale;
		const spacing = 8 * scale;
		const slotOffset = pokemonSize + spacing;
		const columnBase = 16 * scale;
		const rowBase = 26 * scale;

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

	override async drawWatermark(): Promise<void> {
		const x = 8 * this.backgroundScale;
		const y = 8 * this.backgroundScale;
		const scale = 7;

		await this.drawText('Made with https://trainercards.studio', x, y, scale);
	}

	private async drawText(text: string, x: number, y: number, scale: number) {
		// * There is no font for this, we just have raster images
		// * https://www.spriters-resource.com/game_boy_gbc/pokemonredblue/sheet/8734/
		// *
		// * Draw it image-by-image like a caveman I guess
		// TODO - Support lowercase letters and other characters
		if (!this.font) {
			const response = await fetch('/api/font/gen1');
			this.font = await response.json();
		}

		for (let i = 0; i < text.length; i++) {
			const symbol = text[i]!.toUpperCase();
			const character = this.font!.find(char => char.symbol === symbol);

			if (symbol === ' ') {
				x += 8 * scale; // TODO - Should this default size go inside the font response?
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
	override async drawBadges(_urls: string[]) {}
	override async drawIcon1(_imageURL: string, _text: string): Promise<void> {}
	override async drawIcon2(_imageURL: string, _text: string): Promise<void> {}
}
