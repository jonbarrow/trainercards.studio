import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type PokemonImage from '@/types/pokemon-image';

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
		// * I don't think the font changed between Red/Blue and Gold/Silver?
		// * Just reuse it for now, can change later if need be
		const characterWidth = 8;
		const characterHeight = 8;

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
		let x = 56 * this.trainerNameScale;

		for (let i = 0; i < name.length; i++) {
			const char = name[i]!.toUpperCase();

			if (char === ' ' || !characterImageMap[char]) {
				x += characterWidth * this.trainerNameScale;
				continue;
			}

			const image = await loadImage(`/images/fonts/red-blue/${characterImageMap[char]}`);

			this.ctx.drawImage(
				image,
				0,
				0,
				characterWidth,
				characterHeight,
				x,
				(24 - characterHeight) * this.trainerNameScale,
				characterWidth * this.trainerNameScale,
				characterHeight * this.trainerNameScale
			);

			x += characterWidth * this.trainerNameScale;
		}
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

	// * Not supported
	override async drawBadges(_urls: string[]) {}
	override async drawIcon1(_imageURL: string, _text: string): Promise<void> {}
	override async drawIcon2(_imageURL: string, _text: string): Promise<void> {}
}
