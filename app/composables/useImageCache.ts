export const useImageCache = () => {
	const imageCache = ref<Map<string, HTMLImageElement>>(new Map());

	const loadImage = async (url: string): Promise<HTMLImageElement> => {
		if (imageCache.value.has(url)) {
			return imageCache.value.get(url)!;
		}

		return new Promise((resolve, reject) => {
			const image = new Image();

			image.onload = () => {
				imageCache.value.set(url, image);
				resolve(image);
			};

			image.onerror = reject;
			image.src = url;
		});
	};

	const getImage = (url: string): HTMLImageElement | undefined => {
		return imageCache.value.get(url);
	};

	return {
		loadImage,
		getImage,
		imageCache
	};
};
