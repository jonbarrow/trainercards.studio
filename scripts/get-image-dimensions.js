import sharp from 'sharp';

export default async function getImageDimensions(path) {
	const { data, info } = await sharp(path)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const padding = {
		top: countTopPadding(info, data),
		left: countLeftPadding(info, data),
		bottom: countBottomPadding(info, data),
		right: countRightPadding(info, data)
	};

	return {
		content: {
			width: info.width - padding.left - padding.right,
			height: info.height - padding.top - padding.bottom
		},
		original: {
			width: info.width,
			height: info.height
		},
		padding
	};
}

function countLeftPadding(info, data) {
	const { width, height, channels } = info;

	let padding = width;
	for (let row = 0; row < height; row++) {
		let transparentCount = 0;

		for (let col = 0; col < width; col++) {
			const i = (row * width * channels) + (col * channels);
			const alpha = data[i + 3];

			if (alpha !== 0) {
				if (transparentCount < padding) {
					padding = transparentCount;
				}
				break;
			}

			transparentCount++;
		}
	}

	return padding;
}

function countRightPadding(info, data) {
	const { width, height, channels } = info;

	let padding = width;
	for (let row = 0; row < height; row++) {
		let transparentCount = 0;

		for (let col = width - 1; col >= 0; col--) {
			const i = (row * width * channels) + (col * channels);
			const alpha = data[i + 3];

			if (alpha !== 0) {
				if (transparentCount < padding) {
					padding = transparentCount;
				}
				break;
			}

			transparentCount++;
		}
	}

	return padding;
}

function countTopPadding(info, data) {
	const { width, height, channels } = info;

	let padding = height;
	for (let col = 0; col < width; col++) {
		let transparentCount = 0;

		for (let row = 0; row < height; row++) {
			const i = (row * width * channels) + (col * channels);
			const alpha = data[i + 3];

			if (alpha !== 0) {
				if (transparentCount < padding) {
					padding = transparentCount;
				}
				break;
			}

			transparentCount++;
		}
	}

	return padding;
}

function countBottomPadding(info, data) {
	const { width, height, channels } = info;

	let padding = height;
	for (let col = 0; col < width; col++) {
		let transparentCount = 0;

		for (let row = height - 1; row >= 0; row--) {
			const i = (row * width * channels) + (col * channels);
			const alpha = data[i + 3];

			if (alpha !== 0) {
				if (transparentCount < padding) {
					padding = transparentCount;
				}
				break;
			}

			transparentCount++;
		}
	}

	return padding;
}
