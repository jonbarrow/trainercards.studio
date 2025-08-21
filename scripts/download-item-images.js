import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import fs from 'fs-extra';
import sharp from 'sharp';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ballCategories = [
	'standard-balls',
	'special-balls',
	'apricorn-balls'
];

async function downloadImage(url, output) {
	const response = await axios({
		method: 'GET',
		url: url,
		responseType: 'stream'
	});

	await fs.ensureDir(path.dirname(output));

	const writer = fs.createWriteStream(output);
	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
}

async function main() {
	const response = await axios.get('https://pokeapi.co/api/v2/item?limit=100000&offset=0');
	const items = [];

	for (const { url } of response.data.results) {
		try {
			const { data: item } = await axios.get(url);

			if (ballCategories.includes(item.category.name)) {
				continue; // * Skip pokeballs
			}

			if (!item.sprites.default) {
				// * https://github.com/PokeAPI/sprites/issues/133
				continue; // * Some of these don't have images
			}

			const displayName = item.names.find(translation => translation.language.name === 'en').name;
			const extension = item.sprites.default.split('/').pop().split('.').pop();
			const localPath = `/images/items/${item.name}.${extension}`;
			const localPreviewPath = `/images/items/${item.name}_preview.${extension}`;

			await downloadImage(item.sprites.default, `${__dirname}/../public${localPath}`);

			const image = {
				style: 'pixel_art',
				creator: 'GameFreak',
				url: localPath,
				preview_url: localPreviewPath,
				dimensions: await getImageDimensions(`${__dirname}/../public${localPath}`)
			};

			await sharp(`${__dirname}/../public${localPath}`).extract({
				left: image.dimensions.padding.left,
				top: image.dimensions.padding.top,
				width: image.dimensions.content.width,
				height: image.dimensions.content.height
			}).png().toFile(`${__dirname}/../public${localPreviewPath}`);

			items.push({
				name: item.name,
				display_name: displayName,
				image
			});
		} catch (error) {
			console.log(url);
			console.log(error);
			break;
		}
	}

	await fs.ensureDir(`${__dirname}/../public/metadata`);
	await fs.writeJSON(`${__dirname}/../public/metadata/items.json`, items);
}

main();
