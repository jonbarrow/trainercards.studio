import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type PokemonImage from '@/types/pokemon-image';

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
		// * There is no font for this, we just have raster images
		// * https://www.spriters-resource.com/fullview/8307/
		// *
		// * Draw it image-by-image like a caveman I guess
		// TODO - This is designed around the size of uppercase letters. Lowercase has variable sizing, need to implement that
		const characterWidth = 6;
		const characterHeight = 12;

		// TODO - Support lowercase letters and other characters
		const characterImageMap: Record<string, string> = {
			'A': 'A.png',
			'B': 'B.png',
			'C': 'C.png',
			'D': 'D.png',
			'E': 'E.png',
			'F': 'F.png',
			'G': 'G.png',
			'H': 'H.png',
			'I': 'I.png',
			'J': 'J.png',
			'K': 'K.png',
			'L': 'L.png',
			'M': 'M.png',
			'N': 'N.png',
			'O': 'O.png',
			'P': 'P.png',
			'Q': 'Q.png',
			'R': 'R.png',
			'S': 'S.png',
			'T': 'T.png',
			'U': 'U.png',
			'V': 'V.png',
			'W': 'W.png',
			'X': 'X.png',
			'Y': 'Y.png',
			'Z': 'Z.png',
			'0': '0.png',
			'1': '1.png',
			'2': '2.png',
			'3': '3.png',
			'4': '4.png',
			'5': '5.png',
			'6': '6.png',
			'7': '7.png',
			'8': '8.png',
			'9': '9.png',
			':': 'colon.png',
			',': 'comma.png',
			'-': 'dash.png',
			// '': 'double-dot.png', // TODO - How to handle this?
			// '': 'double-quote-backward.png', // TODO - How to handle this?
			// '': 'double-quote-forward.png', // TODO - How to handle this?
			'!': 'exclamation.png',
			'.': 'period.png',
			'?': 'question.png',
			// '': 'single-quote-backward.png',  // TODO - How to handle this?
			// '': 'single-quote-forward.png',  // TODO - How to handle this?
			'/': 'slash.png'
		};
		let x = 50 * this.trainerNameScale;

		for (let i = 0; i < name.length; i++) {
			const char = name[i]!.toUpperCase();

			if (char === ' ' || !characterImageMap[char]) {
				x += characterWidth * this.trainerNameScale;
				continue;
			}

			const image = await loadImage(`/images/fonts/ruby-sapphire/${characterImageMap[char]}`);

			this.ctx.drawImage(
				image,
				0,
				0,
				characterWidth,
				characterHeight,
				x,
				(48 - characterHeight) * this.trainerNameScale,
				characterWidth * this.trainerNameScale,
				characterHeight * this.trainerNameScale
			);

			x += characterWidth * this.trainerNameScale;
		}
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

				const badgeWidth = image.width * this.backgroundScale;
				const badgeHeight = image.height * this.backgroundScale;

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

	// * Not supported
	override async drawIcon1(_imageURL: string, _text: string): Promise<void> {}
	override async drawIcon2(_imageURL: string, _text: string): Promise<void> {}
}
