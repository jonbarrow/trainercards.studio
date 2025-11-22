import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs-extra';
import sharp from 'sharp';
import cliProgress from 'cli-progress';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getCategoryImageURLs(categoryMembers) {
	const baseUrl = 'https://archives.bulbagarden.net/w/api.php';
	const allFiles = [];
	const batchSize = 50;

	for (let i = 0; i < categoryMembers.length; i += batchSize) {
		const batch = categoryMembers.slice(i, i + batchSize);
		const titles = batch.map(member => member.title).join('|');

		const params = new URLSearchParams({
			action: 'query',
			titles: titles,
			prop: 'imageinfo',
			iiprop: 'url|size|timestamp',
			format: 'json',
			origin: '*'
		});

		const response = await axios.get(`${baseUrl}?${params}`);
		const { data } = response;

		if (data.query && data.query.pages) {
			const files = Object.values(data.query.pages).map(page => ({
				title: page.title,
				url: page.imageinfo[0].url,
				size: page.imageinfo[0].size,
				timestamp: page.imageinfo[0].timestamp
			}));

			allFiles.push(...files);
		}

		await new Promise(resolve => setTimeout(resolve, 100));
	}

	return allFiles;
}

async function getMediaWikiFileURLs() {
	// * The API constantly throws 503 errors here, try just manually scraping it I guess?
	let response = await axios.post('https://archives.bulbagarden.net/wiki/Special:Export', {
		title: 'Special:Export',
		catname: 'Shuffle_icons',
		addcat: 'Add',
		pages: '',
		curonly: '1',
		wpDownload: '1',
		wpEditToken: '+\\'
	}, {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

	const html = response.data;
	const dom = new JSDOM(html);
	const document = dom.window.document;
	const div = document.getElementById('mw-input-pages');
	const ooui = JSON.parse(div.dataset.ooui);
	const fileList = ooui.value.split('\n').filter(title => /^File:Shuffle(\d+)/.test(title));
	const imageURLs = await getCategoryImageURLs(fileList.map(title => ({ title })));

	return imageURLs.map(({ title, url }) => {
		const parts = title.match(/^File:Shuffle(\d+)/);

		return {
			dex: Number(parts[1]),
			url
		};
	});
}

export default async function main(pokeapi) {
	const mediaWikiFiles = await getMediaWikiFileURLs();
	const progress = new cliProgress.SingleBar({
		format: 'Pokemon Shuffle {bar} | {value}/{total} | {percentage}%'
	}, cliProgress.Presets.shades_classic);

	progress.start(mediaWikiFiles.length);

	for (const mediaWikiFile of mediaWikiFiles) {
		try {
			// TODO - Put form variations with the right form. Images like https://archives.bulbagarden.net/wiki/File:Shuffle006MSX.png exist but aren't being placed in the right form
			const pokemon = pokeapi.find(p => p?.id?.pokeapi === mediaWikiFile.dex && p.is_default);

			if (!pokemon) {
				continue;
			}

			// TODO - Track shiny status. The way these images are named makes it REALLY annoying to get the shiny status. See https://archives.bulbagarden.net/wiki/File:Shuffle006MSX.png, where the shiny flag ("S") is mixed with the form name
			// * These always seem to be male?
			const imageURL = `/images/pokemon/${pokemon.name}/pokemon_shuffle_male.png`;
			const previewURL = `/images/pokemon/${pokemon.name}/pokemon_shuffle_male_preview.png`;

			// * Skip if already exists, since this script can make duplicates
			if (pokemon.images.some(({ url }) => url === imageURL)) {
				continue;
			}

			const fileImagePath = path.join(__dirname, '..', 'public', imageURL);
			const filePreviewPath = path.join(__dirname, '..', 'public', previewURL);

			await fs.ensureDir(path.dirname(fileImagePath));

			const response = await fetch(mediaWikiFile.url);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const writeStream = fs.createWriteStream(fileImagePath);

			await pipeline(response.body, writeStream);

			const image = {
				style: 'artwork',
				platform: 'pokemon_shuffle',
				platform_display_name: 'Pokémon Shuffle',
				gender: 'male',
				gender_display_name: 'Male',
				shiny: false,
				creator: 'GameFreak',
				url: imageURL,
				preview_url: previewURL,
				dimensions: await getImageDimensions(fileImagePath)
			};

			await sharp(fileImagePath).extract({
				left: image.dimensions.padding.left,
				top: image.dimensions.padding.top,
				width: image.dimensions.content.width,
				height: image.dimensions.content.height
			}).png().toFile(filePreviewPath);

			pokemon.images.push(image);
		} catch (error) {
			console.log(error);
			console.log(mediaWikiFile.url);
			process.exit();
		} finally {
			progress.increment();
		}
	}

	progress.stop();

	return pokeapi;
}
