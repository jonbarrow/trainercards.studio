import type TrainerImage from '@/types/trainer-image';
import type PokemonTeam from '@/types/pokemon-team';

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
	abstract drawTrainerImage(trainer: TrainerImage): Promise<void>;
	abstract drawTrainerName(name: string): Promise<void>;
	abstract drawPokemonTeam(team: PokemonTeam): Promise<void>;
	abstract drawBadges(images: string[]): Promise<void>;
	abstract drawWatermark(): Promise<void>;
}
