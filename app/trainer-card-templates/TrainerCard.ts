import type TrainerImage from '@/types/trainer-image';
import type { StaticTrainerImage, AnimatedTrainerImage } from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type { PokemonInTeam } from '@/types/pokemon-team';
import type { StaticPokemonImage, AnimatedPokemonImage } from '@/types/pokemon-image';
import type AnimationFrameData from '@/types/animation-frame-data';

const { loadImage } = useImageCache();

// TODO - Move this, I *HATE* that it's in this file. It doesn't belong here
class SpriteAnimation {
	public animationLength: number;

	private frames: HTMLCanvasElement[] = [];
	private frameDelays: number[];
	private currentFrame: number = 0;
	private lastFrameTime: number = 0;
	private frameWidth: number;
	private frameHeight: number;

	constructor(spriteImage: HTMLImageElement, frameData: AnimationFrameData[]) {
		this.animationLength = frameData.reduce((length, frame) => length + frame.delay, 0);
		this.frameDelays = frameData.map(frame => frame.delay);
		this.frameWidth = frameData[0]!.width;
		this.frameHeight = frameData[0]!.height;

		this.preRenderFrames(spriteImage, frameData);
	}

	private preRenderFrames(spriteImage: HTMLImageElement, frameData: AnimationFrameData[]) {
		for (let i = 0; i < frameData.length; i++) {
			const frameCanvas = document.createElement('canvas');
			frameCanvas.width = this.frameWidth;
			frameCanvas.height = this.frameHeight;
			const ctx = frameCanvas.getContext('2d')!;
			ctx.imageSmoothingEnabled = false;

			ctx.drawImage(
				spriteImage,
				i * this.frameWidth,
				0,
				this.frameWidth,
				this.frameHeight,
				0,
				0,
				this.frameWidth,
				this.frameHeight
			);

			this.frames.push(frameCanvas);
		}
	}

	getCurrentFrame(): HTMLCanvasElement {
		return this.frames[this.currentFrame]!;
	}

	getFrameSize(): { width: number; height: number } {
		return { width: this.frameWidth, height: this.frameHeight };
	}

	update(currentTime: number) {
		const currentFrameDelay = this.frameDelays[this.currentFrame]!;

		if (currentTime - this.lastFrameTime >= currentFrameDelay) {
			this.currentFrame = (this.currentFrame + 1) % this.frames.length;
			this.lastFrameTime = currentTime;
		}
	}
}

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
	public animations: Map<string, SpriteAnimation> = new Map();
	public watermarkEnabled = true; // * Hack for modern templates

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

	protected backgroundCanvas?: HTMLCanvasElement;
	protected animationFrameIDs: Set<number> = new Set();

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

	protected async drawStaticPokemon(pokemon: PokemonInTeam, x: number, y: number, width: number, height: number) {
		// * Fuck it, we ball.
		// * This works well enough. Monkey-slamming the keyboard ftw.
		const image = pokemon.image as StaticPokemonImage;
		const padding = image.dimensions.padding;
		const pokemonImage = await loadImage(image.url);

		const contentWidth = pokemonImage.width - padding.left - padding.right;
		const contentHeight = pokemonImage.height - padding.top - padding.bottom;

		const userScale = pokemon.scale;
		const scaleX = (width / contentWidth) * userScale;
		const scaleY = (height / contentHeight) * userScale;
		const scale = Math.min(scaleX, scaleY);

		const drawWidth = contentWidth * scale;
		const drawHeight = contentHeight * scale;

		const baseOffsetX = (width - drawWidth) / 2;
		const baseOffsetY = (height - drawHeight) / 2;
		const finalX = x + baseOffsetX + pokemon.offset_x;
		const finalY = y + baseOffsetY + pokemon.offset_y;

		this.ctx.drawImage(
			pokemonImage,
			padding.left,
			padding.top,
			contentWidth,
			contentHeight,
			finalX,
			finalY,
			drawWidth,
			drawHeight
		);

		pokemon.original_x = x + baseOffsetX;
		pokemon.original_y = y + baseOffsetY;
		pokemon.drawn_x = finalX;
		pokemon.drawn_y = finalY;
		pokemon.drawn_width = drawWidth;
		pokemon.drawn_height = drawHeight;

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

			const pokeballX = finalX + drawWidth - pokeballDrawWidth;
			const pokeballY = finalY + drawHeight - pokeballDrawHeight;

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

			const heldItemX = finalX;
			const heldItemY = finalY + drawHeight - heldItemDrawHeight;

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

	private async drawAnimatedPokemon(pokemon: PokemonInTeam, x: number, y: number, width: number, height: number) {
		// * GIFs don't animate automatically in a canvas, MP4
		// * videos don't support transparency, and formats like
		// * aPNG and WebP are not widely supported by ALL devices
		// *
		// * That means we get to animate things by hand using sprite sheets
		// TODO - Can this be made better? I feel like this sucks ass, first attempt at something like this
		const image = pokemon.image as AnimatedPokemonImage;
		const animationKey = `${image.url}_${x}_${y}_${pokemon.offset_x}_${pokemon.offset_y}_${pokemon.scale}`; // TODO - This will break if the same Pokemon is set to the EXACT same values

		if (!this.animations.has(animationKey)) {
			const spriteSheet = await loadImage(image.url);
			const animation = new SpriteAnimation(spriteSheet, image.frame_data);
			this.animations.set(animationKey, animation);
		}

		const animation = this.animations.get(animationKey)!;
		animation.update(performance.now());

		const frameSize = animation.getFrameSize();
		const currentFrame = animation.getCurrentFrame();

		// * GIFs have padding because not every frame is the same size.
		// * Static images have padding removed. Scale GIFs up by just a
		// * little to account for this and make them look ~the same size
		const scaleMultiplier = 1.1;

		const userScale = pokemon.scale;
		const scaleX = (width / frameSize.width) * scaleMultiplier * userScale;
		const scaleY = (height / frameSize.height) * scaleMultiplier * userScale;
		const scale = Math.min(scaleX, scaleY);

		const drawWidth = frameSize.width * scale;
		const drawHeight = frameSize.height * scale;

		const baseOffsetX = (width - drawWidth) / 2;
		const baseOffsetY = (height - drawHeight) / 2;
		const finalX = x + baseOffsetX + pokemon.offset_x;
		const finalY = y + baseOffsetY + pokemon.offset_y;

		// * Sort of a hack. Need to clear the previous animation from
		// * the canvas before drawing the new one to prevent ghosting.
		// * Calling just this.ctx.clearRect() in the area of the sprite
		// * also clears the background data leaving a hole. Calling
		// * this.drawBackground() also clears data like the trainer,
		// * which is not drawn on a loop and we have no knowledge of the
		// * relevant data in this function. To get around this we stored
		// * the result of the drawn background using this.captureBackgroundState()
		// * and then sample a portion of it. I'm unsure how good this is
		// * for performance, but it works so /shrug
		this.ctx.clearRect(finalX, finalY, drawWidth, drawHeight);
		await this.redrawBackgroundArea(finalX, finalY, drawWidth, drawHeight);

		this.ctx.drawImage(
			currentFrame,
			0,
			0,
			frameSize.width,
			frameSize.height,
			finalX,
			finalY,
			drawWidth,
			drawHeight
		);

		pokemon.original_x = x + baseOffsetX;
		pokemon.original_y = y + baseOffsetY;
		pokemon.drawn_x = finalX;
		pokemon.drawn_y = finalY;
		pokemon.drawn_width = drawWidth;
		pokemon.drawn_height = drawHeight;

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

			const pokeballX = finalX + drawWidth - pokeballDrawWidth;
			const pokeballY = finalY + drawHeight - pokeballDrawHeight;

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

			const heldItemX = finalX;
			const heldItemY = finalY + drawHeight - heldItemDrawHeight;

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

		const frameID = requestAnimationFrame(() => {
			this.drawAnimatedPokemon(pokemon, x, y, width, height);
		});

		this.animationFrameIDs.add(frameID);
	}

	protected async redrawBackgroundArea(x: number, y: number, width: number, height: number) {
		this.ctx.drawImage(
			this.backgroundCanvas!,
			x,
			y,
			width,
			height,
			x,
			y,
			width,
			height
		);
	}

	public async drawPokemon(pokemon: PokemonInTeam, x: number, y: number, width: number, height: number) {
		if ('dimensions' in pokemon.image) {
			await this.drawStaticPokemon(pokemon, x, y, width, height);
		} else {
			await this.drawAnimatedPokemon(pokemon, x, y, width, height);
		}
	}

	protected async drawStaticTrainerImage(trainer: StaticTrainerImage): Promise<void> {
		const trainerImage = await loadImage(trainer.image_url);

		const boundingBoxWidth = this.trainerImageBoundingBoxWidth;
		const boundingBoxHeight = this.trainerImageBoundingBoxHeight;
		const rightOffset = this.trainerImageX;
		const topOffset = this.trainerImageY;

		const boundingBoxX = (this.backgroundOriginalWidth - rightOffset) * this.backgroundScale;
		const boundingBoxY = (topOffset - boundingBoxHeight) * this.backgroundScale;

		const baseScaledContentWidth = trainer.dimensions!.content.width * this.trainerImageScale;
		const baseScaledContentHeight = trainer.dimensions!.content.height * this.trainerImageScale;

		const maxWidth = boundingBoxWidth * this.backgroundScale;
		const maxHeight = boundingBoxHeight * this.backgroundScale;

		const baseScaleX = maxWidth / baseScaledContentWidth;
		const baseScaleY = maxHeight / baseScaledContentHeight;
		const baseFitScale = Math.min(1, baseScaleX, baseScaleY);

		const userScale = trainer.scale;
		const finalScale = baseFitScale * userScale;
		const scaledContentWidth = baseScaledContentWidth * finalScale;
		const scaledContentHeight = baseScaledContentHeight * finalScale;

		const baseX = boundingBoxX + (maxWidth - scaledContentWidth) / 2;
		const baseY = boundingBoxY + (maxHeight - scaledContentHeight) / 2;
		const finalX = baseX + trainer.offset_x;
		const finalY = baseY + trainer.offset_y;

		this.ctx.drawImage(
			trainerImage,
			trainer.dimensions!.padding.left,
			trainer.dimensions!.padding.top,
			trainer.dimensions!.content.width,
			trainer.dimensions!.content.height,
			finalX,
			finalY,
			scaledContentWidth,
			scaledContentHeight
		);

		trainer.original_x = baseX;
		trainer.original_y = baseY;
		trainer.drawn_x = finalX;
		trainer.drawn_y = finalY;
		trainer.drawn_width = scaledContentWidth;
		trainer.drawn_height = scaledContentHeight;
	}

	protected async drawAnimatedTrainerImage(trainer: AnimatedTrainerImage): Promise<void> {
		const boundingBoxWidth = this.trainerImageBoundingBoxWidth;
		const boundingBoxHeight = this.trainerImageBoundingBoxHeight;
		const rightOffset = this.trainerImageX;
		const topOffset = this.trainerImageY;

		const boundingBoxX = (this.backgroundOriginalWidth - rightOffset) * this.backgroundScale;
		const boundingBoxY = (topOffset - boundingBoxHeight) * this.backgroundScale;

		const animationKey = `trainer_${trainer.image_url}_${boundingBoxX}_${boundingBoxY}_${trainer.offset_x}_${trainer.offset_y}_${trainer.scale}`; // TODO - Is this overkill?

		if (!this.animations.has(animationKey)) {
			const spriteSheet = await loadImage(trainer.image_url);
			const animation = new SpriteAnimation(spriteSheet, trainer.frame_data);
			this.animations.set(animationKey, animation);
		}

		const animation = this.animations.get(animationKey)!;
		animation.update(performance.now());

		const frameSize = animation.getFrameSize();
		const currentFrame = animation.getCurrentFrame();

		const baseScaledContentWidth = frameSize.width * this.trainerImageScale;
		const baseScaledContentHeight = frameSize.height * this.trainerImageScale;

		const maxWidth = boundingBoxWidth * this.backgroundScale;
		const maxHeight = boundingBoxHeight * this.backgroundScale;

		const baseScaleX = maxWidth / baseScaledContentWidth;
		const baseScaleY = maxHeight / baseScaledContentHeight;
		const baseFitScale = Math.min(1, baseScaleX, baseScaleY);

		const userScale = trainer.scale;
		const finalScale = baseFitScale * userScale;
		const scaledContentWidth = baseScaledContentWidth * finalScale;
		const scaledContentHeight = baseScaledContentHeight * finalScale;

		const baseX = boundingBoxX + (maxWidth - scaledContentWidth) / 2;
		const baseY = boundingBoxY + (maxHeight - scaledContentHeight) / 2;
		const finalX = baseX + trainer.offset_x;
		const finalY = baseY + trainer.offset_y;

		this.ctx.clearRect(finalX, finalY, scaledContentWidth, scaledContentHeight);
		await this.redrawBackgroundArea(finalX, finalY, scaledContentWidth, scaledContentHeight);

		this.ctx.drawImage(
			currentFrame,
			0,
			0,
			frameSize.width,
			frameSize.height,
			finalX,
			finalY,
			scaledContentWidth,
			scaledContentHeight
		);

		trainer.original_x = baseX;
		trainer.original_y = baseY;
		trainer.drawn_x = finalX;
		trainer.drawn_y = finalY;
		trainer.drawn_width = scaledContentWidth;
		trainer.drawn_height = scaledContentHeight;

		const frameID = requestAnimationFrame(async () => {
			this.drawAnimatedTrainerImage(trainer);
		});

		this.animationFrameIDs.add(frameID);
	}

	public async drawTrainerImage(trainer: TrainerImage): Promise<void> {
		if ('dimensions' in trainer) {
			await this.drawStaticTrainerImage(trainer);
		} else {
			await this.drawAnimatedTrainerImage(trainer);
		}
	}

	public cleanup() {
		this.animationFrameIDs.forEach(cancelAnimationFrame);
		this.animationFrameIDs.clear();
		this.animations.clear();
	}

	public captureBackgroundState() {
		if (!this.backgroundCanvas) {
			this.backgroundCanvas = document.createElement('canvas');
		}

		this.backgroundCanvas.width = this.canvas.width;
		this.backgroundCanvas.height = this.canvas.height;
		const bgCtx = this.backgroundCanvas.getContext('2d')!;

		bgCtx.drawImage(this.canvas, 0, 0);
	}
}
