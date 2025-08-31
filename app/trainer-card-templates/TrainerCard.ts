import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type { PokemonInTeam } from '@/types/pokemon-team';

const { loadImage } = useImageCache();

export interface TrainerCardConstructor {
	new (): TrainerCard;

	readonly name: string;
	readonly previewURL: string;
}

export default abstract class TrainerCard {
	public static name: string;
	public static previewURL: string;

	public canvas!: HTMLCanvasElement;
	public ctx!: CanvasRenderingContext2D;

	protected backgroundURL!: string;
	protected backgroundOriginalWidth!: number;
	protected backgroundOriginalHeight!: number;
	protected backgroundScale!: number;
	protected pokemonScale!: number;
	protected trainerImageX!: number; // TODO - Rename this, or change the values/math? Right now this means "how many pixels from the RIGHT SIDE of the canvas until the LEFT MOST SIDE of the bounding box"
	protected trainerImageY!: number; // TODO - Rename this, or change the values/math? Right now this means "how many pixels from the TOP SIDE of the canvas until the BOTTOM MOST SIDE of the bounding box"
	protected trainerImageBoundingBoxWidth!: number;
	protected trainerImageBoundingBoxHeight!: number;
	protected trainerImageScale!: number;
	protected trainerNameScale!: number;

	protected rescaleCanvas(): void {
		const displayWidth = this.backgroundOriginalWidth * this.backgroundScale;
		const displayHeight = this.backgroundOriginalHeight * this.backgroundScale;

		this.canvas.width = displayWidth;
		this.canvas.height = displayHeight;
	}

	abstract drawBackground(): Promise<void>;
	abstract drawIcon1(imageURL: string, text: string): Promise<void>;
	abstract drawIcon2(imageURL: string, text: string): Promise<void>;
	abstract drawTrainerName(name: string): Promise<void>;
	abstract drawPokemonTeam(team: PokemonTeam): Promise<void>;
	abstract drawBadges(images: string[]): Promise<void>;
	abstract drawWatermark(): Promise<void>;

	public async drawTrainerImage(trainer: TrainerImage): Promise<void> {
		const trainerImage = await loadImage(trainer.image_url);

		const boundingBoxWidth = this.trainerImageBoundingBoxWidth;
		const boundingBoxHeight = this.trainerImageBoundingBoxHeight;
		const rightOffset = this.trainerImageX;
		const topOffset = this.trainerImageY;

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

	protected async drawPokemon(pokemon: PokemonInTeam, x: number, y: number, width: number, height: number) {
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
}
