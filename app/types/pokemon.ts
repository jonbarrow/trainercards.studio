import type PokemonImage from '@/types/pokemon-image';

interface Pokemon {
	name: string;
	display_name: string;
	images: PokemonImage[];
}

export default Pokemon;
