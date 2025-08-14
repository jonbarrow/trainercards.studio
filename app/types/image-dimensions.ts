export default interface ImageDimensions {
	content: {
		width: number;
		height: number;
	};
	original: {
		width: number;
		height: number;
	};
	padding: {
		top: number;
		left: number;
		bottom: number;
		right: number;
	};
};
