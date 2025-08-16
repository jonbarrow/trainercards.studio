import type ImageDimensions from '@/types/image-dimensions';

interface PokemonImage {
	style: 'pixel_art' | 'model_render' | 'artwork';
	platform: string;
	type: string;
	url: string;
	dimensions: ImageDimensions;
}

export default PokemonImage;
