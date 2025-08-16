import type ImageDimensions from '@/types/image-dimensions';

interface TrainerImage {
	style: 'pixel_art' | 'model_render';
	name: string;
	platform: string;
	platform_display_name: string;
	creator: string;
	creator_url?: string;
	image_url: string;
	preview_url: string;
	dimensions?: ImageDimensions;
}

export default TrainerImage;
