import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import fs from 'fs-extra';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const trainers = fs.readJSONSync(path.join(__dirname, '..', 'public', 'metadata', 'trainers.json'));

async function main() {
	const basePage = 'https://pokengine.org/search?query=trainers+%23bw2';
	const response = await fetch(basePage);
	const html = await response.text();

	const dom = new JSDOM(html);
	const document = dom.window.document;
	const lastPage = parseInt(document.querySelector('.pages .tab:last-child')?.innerText || '1');

	for (let pageNumber = 1; pageNumber <= lastPage; pageNumber++) {
		const response = await fetch(`${basePage}&page=${pageNumber}`);
		const html = await response.text();

		const dom = new JSDOM(html);
		const document = dom.window.document;
		const sprites = [...document.querySelectorAll('.dex-block')].map(div => ({
			name: div.querySelector('span').innerHTML,
			uid: div.dataset.uid,
			url: div.querySelector('a img').dataset.src
		}));

		scrape_trainer: for (const sprite of sprites) {
			const fileExtension = sprite.url.split('.').pop().split('?')[0];
			const fileName = `${sprite.name.toLowerCase().replace(/ /g, '_')}_${sprite.uid}.${fileExtension}`;
			const filePath = `/images/trainers/black_2_white_2/${fileName}`;
			const outputPath = path.join(__dirname, '..', 'public', filePath);

			for (const trainer of trainers) {
				if (trainer.image_url === filePath) {
					continue scrape_trainer;
				}
			}

			const response = await fetch(sprite.url);
			const imageArrayBuffer = await response.arrayBuffer();
			const imageBuffer = Buffer.from(imageArrayBuffer);

			fs.writeFileSync(outputPath, imageBuffer);

			trainers.push({
				style: 'pixel_art',
				name: sprite.name,
				platform: 'black_2_white_2',
				platform_display_name: 'Black 2 / White 2',
				creator: 'GameFreak',
				image_url: filePath,
				preview_url: filePath,
				dimensions: await getImageDimensions(outputPath)
			});
		}
	}

	fs.writeJSONSync(path.join(__dirname, '..', 'public', 'metadata', 'trainers.json'), trainers);
}

main();
