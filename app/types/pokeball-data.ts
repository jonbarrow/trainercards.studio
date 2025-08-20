import type ImageDimensions from '@/types/image-dimensions';

interface PokeballData {
	name: string;
	display_name: string;
	image: {
		style: string;
		creator: string;
		url: string;
		preview_url: string;
		dimensions: ImageDimensions;
	};
}

export default PokeballData;
