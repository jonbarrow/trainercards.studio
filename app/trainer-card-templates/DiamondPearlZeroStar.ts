import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type PokemonImage from '@/types/pokemon-image';

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
		// * The sprite sheet https://www.spriters-resource.com/ds_dsi/pokemondiamondpearl/sheet/6963/
		// * has the wrong font. You can see this at https://archives.bulbagarden.net/media/upload/8/84/Trainer_Card_Pt.png
		// * where clearly the "N" and other characters are different.
		// *
		// * I can't find any source for these sprites, so I just used the wrong font and recolored it. Sue me
		const characterWidth = 7;
		const characterHeight = 11;

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
			// '.': 'period.png', // TODO - Font seems to have multiple period characters?
			'?': 'question.png',
			// '': 'single-quote-backward.png',  // TODO - How to handle this?
			// '': 'single-quote-forward.png',  // TODO - How to handle this?
			'/': 'slash.png'
		};
		let x = (144 - characterWidth) * this.trainerNameScale;

		for (let i = name.length - 1; i >= 0; i--) {
			const char = name[i]!.toUpperCase();

			if (char === ' ' || !characterImageMap[char]) {
				x += characterWidth * this.trainerNameScale;
				continue;
			}

			const image = await loadImage(`/images/fonts/diamond-pearl/${characterImageMap[char]}`);

			this.ctx.drawImage(
				image,
				0,
				0,
				characterWidth,
				characterHeight,
				x,
				(37 - characterHeight) * this.trainerNameScale,
				characterWidth * this.trainerNameScale,
				characterHeight * this.trainerNameScale
			);

			x -= characterWidth * this.trainerNameScale;
		}
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

	// * Not supported
	override async drawIcon1(_imageURL: string, _text: string): Promise<void> {}
	override async drawIcon2(_imageURL: string, _text: string): Promise<void> {}
}
