import type ImageDimensions from '@/types/image-dimensions';
import type AnimationFrameData from '@/types/animation-frame-data';

interface BasePokemonImage {
	style: 'pixel_art' | 'model_render' | 'artwork';
	platform: string;
	platform_display_name: string;
	gender: string;
	gender_display_name: string;
	shiny: boolean;
	creator: string;
	creator_url?: string;
	url: string;
	preview_url: string;
}

export interface StaticPokemonImage extends BasePokemonImage {
	dimensions: ImageDimensions;
}

export interface AnimatedPokemonImage extends BasePokemonImage {
	frame_data: AnimationFrameData[];
}

type PokemonImage = StaticPokemonImage | AnimatedPokemonImage;

export default PokemonImage;
