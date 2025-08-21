import type Pokemon from '@/types/pokemon';
import type ItemData from '@/types/item-data';
import type PokemonImage from '@/types/pokemon-image';

export interface PokemonInTeam {
	pokemon: Pokemon;
	nickname: string;
	gender: string;
	pokeball?: ItemData;
	held_item?: ItemData;
	image: PokemonImage;
}

interface PokemonTeam {
	[slot: number]: PokemonInTeam;
}

export default PokemonTeam;
