import type ImageDimensions from '@/types/image-dimensions';

interface PokemonImage {
	style: 'pixel_art' | 'model_render' | 'artwork';
	platform: string;
	platform_display_name: string;
	gender: string;
	gender_display_name: string;
	shiny: boolean;
	creator: string;
	creator_url?: string;
	url: string;
	dimensions: ImageDimensions;
}

export default PokemonImage;
