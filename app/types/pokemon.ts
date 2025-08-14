import type PokemonImage from '@/types/pokemon-image';

export default interface Pokemon {
	name: string;
	display_name: string;
	images: PokemonImage[];
};
