import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type { PokemonInTeam } from '@/types/pokemon-team';
import type FontCharacterImage from '@/types/font-character-image';

const { loadImage } = useImageCache();

export default class GoldSilver extends TrainerCard {
	public static override name = 'Gold /Silver';
	public static override previewURL = '/images/trainer-cards/gen-2.png';
	protected override backgroundURL = '/images/trainer-cards/gen-2.png';
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

		// * Shout out to https://www.spriters-resource.com/game_boy_gbc/pokemongoldsilver/sheet/9200/
		// * for having the actual bounding box position/size. We can actually place trainers
		// * perfectly now
		const boundingBoxWidth = 40;
		const boundingBoxHeight = 56;
		const rightOffset = 48;
		const topOffset = 64;

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
		const spacing = 6 * scale;
		const slotOffset = pokemonSize + spacing;
		const columnBase = 16 * scale;
		const rowBase = 30 * scale;

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

	private async drawPokemon(pokemon: PokemonInTeam, x: number, y: number, width: number, height: number) {
		// * Fuck it, we ball.
		// * This works well enough. Monkey-slamming the keyboard ftw.
		const image = pokemon.image;
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

		if (pokemon.pokeball) {
			const pokeballImage = await loadImage(pokemon.pokeball.image.url);
			const pokeballPadding = pokemon.pokeball.image.dimensions.padding;
			const pokeballContentWidth = pokemon.pokeball.image.dimensions.content.width;
			const pokeballContentHeight = pokemon.pokeball.image.dimensions.content.height;

			const pokeballTargetSize = Math.min(drawWidth, drawHeight) * 0.3;
			const pokeballScaleX = pokeballTargetSize / pokeballContentWidth;
			const pokeballScaleY = pokeballTargetSize / pokeballContentHeight;
			const pokeballScale = Math.min(pokeballScaleX, pokeballScaleY);

			const pokeballDrawWidth = pokeballContentWidth * pokeballScale;
			const pokeballDrawHeight = pokeballContentHeight * pokeballScale;

			const pokeballX = x + offsetX + drawWidth - pokeballDrawWidth;
			const pokeballY = y + offsetY + drawHeight - pokeballDrawHeight;

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

		if (pokemon.held_item) {
			const heldItemImage = await loadImage(pokemon.held_item.image.url);
			const heldItemPadding = pokemon.held_item.image.dimensions.padding;
			const heldItemContentWidth = pokemon.held_item.image.dimensions.content.width;
			const heldItemContentHeight = pokemon.held_item.image.dimensions.content.height;

			const heldItemTargetSize = Math.min(drawWidth, drawHeight) * 0.3;
			const heldItemScaleX = heldItemTargetSize / heldItemContentWidth;
			const heldItemScaleY = heldItemTargetSize / heldItemContentHeight;
			const heldItemScale = Math.min(heldItemScaleX, heldItemScaleY);

			const heldItemDrawWidth = heldItemContentWidth * heldItemScale;
			const heldItemDrawHeight = heldItemContentHeight * heldItemScale;

			const heldItemX = x + offsetX;
			const heldItemY = y + offsetY + drawHeight - heldItemDrawHeight;

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
	}

	private async drawText(text: string, x: number, y: number, scale: number) {
		// * I don't think the font changed between Red/Blue and Gold/Silver?
		// * Just reuse it for now, can change later if need be
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
