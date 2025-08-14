import type Pokemon from '@/types/pokemon';
import type PokemonImage from '@/types/pokemon-image';

export default interface PokemonTeam {
	[slot: number]: {
		pokemon: Pokemon;
		nickname: string;
		gender: string;
		image: PokemonImage;
	};
};
