import type ImageDimensions from '@/types/image-dimensions';

export default interface TrainerImage {
	style: 'pixel_art' | 'model_render';
	name: string;
	image_url: string;
	preview_url: string;
	dimensions?: ImageDimensions;
};
