import type Pokemon from '@/types/pokemon';
import type PokeballData from '@/types/pokeball-data';
import type PokemonImage from '@/types/pokemon-image';

export interface PokemonInTeam {
	pokemon: Pokemon;
	nickname: string;
	gender: string;
	pokeball?: PokeballData;
	image: PokemonImage;
}

interface PokemonTeam {
	[slot: number]: PokemonInTeam;
}

export default PokemonTeam;
