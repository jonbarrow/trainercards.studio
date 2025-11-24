import type PokemonImage from '@/types/pokemon-image';

interface Pokemon {
	name: string;
	display_name: string;
	types: ('grass' | 'poison' | 'fire' | 'flying' | 'water' | 'bug' | 'normal' | 'electric' | 'ground' | 'fairy' | 'fighting' | 'psychic' | 'rock' | 'steel' | 'ice' | 'ghost' | 'dragon' | 'dark')[];
	images: PokemonImage[];
}

export default Pokemon;
