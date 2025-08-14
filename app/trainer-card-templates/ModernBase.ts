import TrainerCard from '@/trainer-card-templates/TrainerCard';
import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';
import type PokemonImage from '@/types/pokemon-image';

const { loadImage } = useImageCache();

// * ModernBase is the base template for all "modern" cards.
// * Any "modern" card just needs to extend this class and
// * change `name` and `previewURL`
export default class ModernBase extends TrainerCard {
	public static override name = '';
	public static override previewURL = '';
	protected override backgroundURL = '';
	protected override backgroundOriginalWidth = 780;
	protected override backgroundOriginalHeight = 440;
	protected override backgroundScale = 4.5;
	protected override pokemonScale = 4.5;
	protected override trainerImageScale = 4.5;
	protected override trainerNameScale = 1;

	async drawBackground() {
		this.rescaleCanvas();

		console.log()

		const displayWidth = this.backgroundOriginalWidth * this.backgroundScale;
		const displayHeight = this.backgroundOriginalHeight * this.backgroundScale;
		const backgroundImage = await loadImage(this.backgroundURL);
		const whitePokeball = await loadImage('/images/pokeball-white.png');
		const blackPokeball = await loadImage('/images/pokeball-black.png');

		this.ctx.imageSmoothingEnabled = true;
		this.ctx.imageSmoothingQuality = 'high';
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(backgroundImage, 0, 0, displayWidth, displayHeight);

		this.drawIconCircles();

		const row1Y = 160 * this.backgroundScale;
		const row2Y = row1Y + (98 * this.backgroundScale) + (50 * this.backgroundScale);

		const column1X = 30 * this.backgroundScale;
		const column2X = (30 + 98 + 45) * this.backgroundScale;
		const column3X = (30 + 98 + 45 + 98 + 45) * this.backgroundScale;

		this.drawWhitePokeball(whitePokeball, column1X, row1Y);
		this.drawWhitePokeball(whitePokeball, column2X, row1Y);
		this.drawWhitePokeball(whitePokeball, column3X, row1Y);

		this.drawWhitePokeball(whitePokeball, column1X, row2Y);
		this.drawWhitePokeball(whitePokeball, column2X, row2Y);
		this.drawWhitePokeball(whitePokeball, column3X, row2Y);

		this.drawBlackPokeball(blackPokeball);

		this.ctx.imageSmoothingEnabled = false;
	}

	private drawIconCircles(): void {
		this.ctx.save();

		const circleSize = 34 * this.backgroundScale;
		const radius = circleSize / 2;
		const leftOffset = 28 * this.backgroundScale;

		const circle1Y = 70 * this.backgroundScale;
		const circle1X = leftOffset + radius;

		const circle2Y = circle1Y + circleSize + (10 * this.backgroundScale);
		const circle2X = leftOffset + radius;

		this.ctx.beginPath();
		this.ctx.arc(circle1X, circle1Y + radius, radius, 0, 2 * Math.PI);
		this.ctx.fillStyle = 'white';
		this.ctx.globalAlpha = 0.75;
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.arc(circle2X, circle2Y + radius, radius, 0, 2 * Math.PI);
		this.ctx.fillStyle = 'white';
		this.ctx.globalAlpha = 0.75;
		this.ctx.fill();

		this.ctx.restore();
		this.ctx.globalAlpha = 1.0;
	}

	private drawWhitePokeball(image: HTMLImageElement, offsetX: number, offsetY: number): void {
		const pokeballWidth = 98 * this.backgroundScale;
		const pokeballHeight = 98 * this.backgroundScale;

		const x = offsetX + pokeballWidth / 2;
		const y = offsetY + pokeballHeight / 2;

		const shadowOffsetX = 4 * this.backgroundScale;
		const shadowOffsetY = 4 * this.backgroundScale;

		// * This looks like shit because iOS Safari doesn't
		// * support `this.ctx.filter = 'brightness(0) opacity(0.6)'`
		// *
		// * So now we get to do this bullshit in the name of
		// * wide compatibility, and I didn't feel like making
		// * a duplicate of the image file itself
		{
			const off = document.createElement('canvas');
			const octx = off.getContext('2d')!;

			off.width = pokeballWidth;
			off.height = pokeballHeight;

			octx.drawImage(image, 0, 0, pokeballWidth, pokeballHeight);
			octx.globalCompositeOperation = 'source-in';
			octx.fillStyle = '#000';
			octx.globalAlpha = 0.6;
			octx.fillRect(0, 0, pokeballWidth, pokeballHeight);
			octx.globalCompositeOperation = 'source-over';
			octx.globalAlpha = 1;

			this.ctx.save();
			this.ctx.translate(x + shadowOffsetX, y + shadowOffsetY);
			this.ctx.rotate(Math.PI / 4);
			this.ctx.drawImage(off, -pokeballWidth / 2, -pokeballHeight / 2);
			this.ctx.restore();
		}

		this.ctx.save();
		this.ctx.globalAlpha = 0.85;
		this.ctx.translate(x, y);
		this.ctx.rotate(Math.PI / 4);
		this.ctx.drawImage(image, -pokeballWidth / 2, -pokeballHeight / 2, pokeballWidth, pokeballHeight);
		this.ctx.restore();
		this.ctx.globalAlpha = 1;

		const nameAreaY = offsetY + pokeballHeight + (5 * this.backgroundScale);
		const nameAreaCenterX = offsetX + pokeballWidth / 2;

		this.drawPokemonNameArea(nameAreaCenterX, nameAreaY);
	}


	private drawPokemonNameArea(x: number, y: number): void {
		const width = 120 * this.backgroundScale;
		const height = 21 * this.backgroundScale;
		const radius = height / 2;

		const pillX = x - width / 2;
		const pillY = y;

		this.ctx.save();

		this.ctx.beginPath();
		this.ctx.moveTo(pillX + radius, pillY);
		this.ctx.lineTo(pillX + width - radius, pillY);
		this.ctx.arc(pillX + width - radius, pillY + radius, radius, -Math.PI / 2, Math.PI / 2);
		this.ctx.lineTo(pillX + radius, pillY + height);
		this.ctx.arc(pillX + radius, pillY + radius, radius, Math.PI / 2, -Math.PI / 2);
		this.ctx.closePath();

		this.ctx.fillStyle = 'white';
		this.ctx.globalAlpha = 0.8;
		this.ctx.fill();

		this.ctx.restore();
		this.ctx.globalAlpha = 1.0;
	}

	private drawBlackPokeball(image: HTMLImageElement): void {
		this.ctx.globalAlpha = 0.7;
		this.ctx.save();

		const pokeballWidth = 360 * this.backgroundScale;
		const pokeballHeight = 360 * this.backgroundScale;

		const x = this.canvas.width - (160 * this.backgroundScale);
		const y = 300 * this.backgroundScale;

		this.ctx.translate(x, y);
		this.ctx.rotate(Math.PI / 4);
		this.ctx.drawImage(image, -pokeballWidth / 2, -pokeballHeight / 2, pokeballWidth, pokeballHeight);

		this.ctx.restore();
		this.ctx.globalAlpha = 1.0;
	}

	async drawTrainerImage(trainer: TrainerImage) {
		const trainerImage = await loadImage(trainer.image_url);

		const blackPokeballCenterX = this.canvas.width - (160 * this.backgroundScale);
		const blackPokeballCenterY = 300 * this.backgroundScale;

		let scaledWidth = (trainer.dimensions!.content.width * this.trainerImageScale) * this.backgroundScale;
		let scaledHeight = (trainer.dimensions!.content.height * this.trainerImageScale) * this.backgroundScale;


		const maxSize = 360 * this.backgroundScale;

		const scaleX = maxSize / scaledWidth;
		const scaleY = maxSize / scaledHeight;
		const fitScale = Math.min(1, scaleX, scaleY);

		scaledWidth *= fitScale;
		scaledHeight *= fitScale;

		const x = blackPokeballCenterX - scaledWidth / 2;
		const y = blackPokeballCenterY - scaledHeight / 2;

		this.ctx.drawImage(
			trainerImage,
			trainer.dimensions!.padding.left,
			trainer.dimensions!.padding.top,
			trainer.dimensions!.content.width,
			trainer.dimensions!.content.height,
			x,
			y,
			scaledWidth,
			scaledHeight
		);
	}

	override async drawTrainerName(name: string): Promise<void> {
		const x = 32 * this.backgroundScale;
		const y = 20 * this.backgroundScale;

		const baseFontSize = 36;
		const scaledFontSize = baseFontSize * this.backgroundScale;

		this.ctx.font = `bold ${scaledFontSize}px "Varela Round", sans-serif`;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'top';

		this.ctx.save();

		const shadowOffsetX = 2.5 * this.backgroundScale;
		const shadowOffsetY = 2.5 * this.backgroundScale;

		this.ctx.fillStyle = 'black';
		this.ctx.globalAlpha = 0.6;
		this.ctx.fillText(name, x + shadowOffsetX, y + shadowOffsetY);

		this.ctx.restore();

		this.ctx.fillStyle = 'white';
		this.ctx.globalAlpha = 1;
		this.ctx.fillText(name, x, y);
	}

	override async drawPokemonTeam(team: PokemonTeam) {
		// * Your guess is as good as mine, I messed around till it worked
		const scale = this.pokemonScale;
		const pokemonSize = (20 * scale) * this.backgroundScale;

		const pokeballSize = 98 * this.backgroundScale;

		const column1X = (30 * this.backgroundScale) + pokeballSize / 2 - pokemonSize / 2;
		const column2X = ((30 + 98 + 45) * this.backgroundScale) + pokeballSize / 2 - pokemonSize / 2;
		const column3X = ((30 + 98 + 45 + 98 + 45) * this.backgroundScale) + pokeballSize / 2 - pokemonSize / 2;

		const row1Y = (160 * this.backgroundScale) + pokeballSize / 2 - pokemonSize / 2;
		const row2Y = ((160 * this.backgroundScale) + (98 * this.backgroundScale) + (50 * this.backgroundScale)) + pokeballSize / 2 - pokemonSize / 2;

		const nameY1 = (160 * this.backgroundScale) + (98 * this.backgroundScale) + (5 * this.backgroundScale) + (21 * this.backgroundScale) / 2;
		const nameY2 = ((160 * this.backgroundScale) + (98 * this.backgroundScale) + (50 * this.backgroundScale)) + (98 * this.backgroundScale) + (5 * this.backgroundScale) + (21 * this.backgroundScale) / 2;

		const nameX1 = (30 * this.backgroundScale) + pokeballSize / 2;
		const nameX2 = ((30 + 98 + 45) * this.backgroundScale) + pokeballSize / 2;
		const nameX3 = ((30 + 98 + 45 + 98 + 45) * this.backgroundScale) + pokeballSize / 2;

		if (team[1]) {
			await this.drawPokemon(team[1].image, column1X, row1Y, pokemonSize, pokemonSize);
			this.drawPokemonNickname(team[1].nickname, nameX1, nameY1);
			await this.drawPokemonGender(team[1].gender, nameX1, nameY1);
		}

		if (team[2]) {
			await this.drawPokemon(team[2].image, column2X, row1Y, pokemonSize, pokemonSize);
			this.drawPokemonNickname(team[2].nickname, nameX2, nameY1);
			await this.drawPokemonGender(team[2].gender, nameX2, nameY1);
		}

		if (team[3]) {
			await this.drawPokemon(team[3].image, column3X, row1Y, pokemonSize, pokemonSize);
			this.drawPokemonNickname(team[3].nickname, nameX3, nameY1);
			await this.drawPokemonGender(team[3].gender, nameX3, nameY1);
		}

		if (team[4]) {
			await this.drawPokemon(team[4].image, column1X, row2Y, pokemonSize, pokemonSize);
			this.drawPokemonNickname(team[4].nickname, nameX1, nameY2);
			await this.drawPokemonGender(team[4].gender, nameX1, nameY2);
		}

		if (team[5]) {
			await this.drawPokemon(team[5].image, column2X, row2Y, pokemonSize, pokemonSize);
			this.drawPokemonNickname(team[5].nickname, nameX2, nameY2);
			await this.drawPokemonGender(team[5].gender, nameX2, nameY2);
		}

		if (team[6]) {
			await this.drawPokemon(team[6].image, column3X, row2Y, pokemonSize, pokemonSize);
			this.drawPokemonNickname(team[6].nickname, nameX3, nameY2);
			await this.drawPokemonGender(team[6].gender, nameX3, nameY2);
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

	private drawPokemonNickname(name: string, x: number, y: number): void {
		const baseFontSize = 12;
		const scaledFontSize = baseFontSize * this.backgroundScale;

		this.ctx.font = `bold ${scaledFontSize}px "Varela Round", sans-serif`;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillStyle = 'black';
		this.ctx.globalAlpha = 0.8;

		this.ctx.fillText(name, x, y);
		this.ctx.globalAlpha = 1.0;
	}

	private async drawPokemonGender(gender: string, x: number, y: number): Promise<void> {
		if (!gender) {
			return;
		}

		const maleWidth = 12 * this.backgroundScale;
		const maleHeight = 12 * this.backgroundScale;
		const femaleWidth = 9 * this.backgroundScale;
		const femaleHeight = 12 * this.backgroundScale;

		const nameAreaX = x - (120 * this.backgroundScale) / 2;

		const iconX = nameAreaX + (6 * this.backgroundScale);
		const iconY = y - (12 * this.backgroundScale) / 2;

		let iconWidth = 0;
		let iconHeight = 0;

		if (gender === 'male') {
			iconWidth = maleWidth;
			iconHeight = maleHeight;
		} else if (gender === 'female') {
			iconWidth = femaleWidth;
			iconHeight = femaleHeight;
		}

		const genderIcon = await loadImage(`/images/icons/gender/${gender}.png`);

		this.ctx.save();
		this.ctx.globalAlpha = 0.8;
		this.ctx.drawImage(genderIcon, iconX, iconY, iconWidth, iconHeight);
		this.ctx.restore();
		this.ctx.globalAlpha = 1.0;
	}

	override async drawIcon1(imageURL: string, text: string): Promise<void> {
		const circleSize = 34 * this.backgroundScale;
		const radius = circleSize / 2;
		const leftOffset = 28 * this.backgroundScale;
		const firstCircleY = 70 * this.backgroundScale;

		const circleX = leftOffset + radius;
		const circleY = firstCircleY + radius;

		await this.drawIconInfo(imageURL, circleX, circleY, text);
	}

	override async drawIcon2(imageURL: string, text: string): Promise<void> {
		const circleSize = 34 * this.backgroundScale;
		const radius = circleSize / 2;
		const leftOffset = 28 * this.backgroundScale;
		const firstCircleY = 70 * this.backgroundScale;

		const circleX = leftOffset + radius;
		const circleY = firstCircleY + circleSize + (10 * this.backgroundScale) + radius;

		await this.drawIconInfo(imageURL, circleX, circleY, text);
	}

	private async drawIconInfo(imageURL: string, circleX: number, circleY: number, text: string): Promise<void> {
		const image = await loadImage(imageURL);

		this.ctx.save();

		const circleSize = 34 * this.backgroundScale;
		const radius = circleSize / 2;

		const iconSize = radius * 1.4;

		const iconX = circleX - iconSize / 2;
		const iconY = circleY - iconSize / 2;

		this.ctx.globalAlpha = 0.85;
		this.ctx.drawImage(image, iconX, iconY, iconSize, iconSize);

		const fontSize = 24;
		const scaledFontSize = fontSize * this.backgroundScale;
		this.ctx.font = `bold ${scaledFontSize}px "Varela Round", sans-serif`;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'middle';

		const textX = circleX + radius + (5 * this.backgroundScale);
		const textY = circleY;

		const shadowOffsetX = 2 * this.backgroundScale;
		const shadowOffsetY = 2 * this.backgroundScale;

		this.ctx.fillStyle = 'black';
		this.ctx.globalAlpha = 0.6;
		this.ctx.fillText(text, textX + shadowOffsetX, textY + shadowOffsetY);

		this.ctx.fillStyle = 'white';
		this.ctx.globalAlpha = 1.0;
		this.ctx.fillText(text, textX, textY);

		this.ctx.restore();
		this.ctx.globalAlpha = 1.0;
	}

	// * Not supported
	override async drawBadges(_urls: string[]) {}
}
