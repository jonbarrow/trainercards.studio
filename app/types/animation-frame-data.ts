interface AnimationFrameData {
	identifier: string;
	local_palette: boolean;
	local_palette_size: number;
	interlace: false;
	text: string;
	left: number;
	top: number;
	width: number;
	height: number;
	delay: number;
	disposal: number;
}

export default AnimationFrameData;
