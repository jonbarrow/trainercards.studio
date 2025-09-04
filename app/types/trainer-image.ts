import type ImageDimensions from '@/types/image-dimensions';
import type AnimationFrameData from '@/types/animation-frame-data';

interface BaseTrainerImage {
	style: 'pixel_art' | 'model_render';
	name: string;
	platform: string;
	platform_display_name: string;
	creator: string;
	creator_url?: string;
	image_url: string;
	preview_url: string;
	offset_x: number;
	offset_y: number;
	scale: number;
}

export interface StaticTrainerImage extends BaseTrainerImage {
	dimensions: ImageDimensions;
}

export interface AnimatedTrainerImage extends BaseTrainerImage {
	frame_data: AnimationFrameData[];
}

type TrainerImage = StaticTrainerImage | AnimatedTrainerImage;

export default TrainerImage;
