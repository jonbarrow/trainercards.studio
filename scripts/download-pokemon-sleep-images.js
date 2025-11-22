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

// TODO - Support form variations. Some images like https://archives.bulbagarden.net/wiki/File:Sleep_Style_0038A-1_s.png exist but aren't supported here yet

async function getPokemonSleepImageURLs(categoryMembers) {
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

async function getAllPokemonSleepArt() {
	// * The API constantly throws 503 errors here, try just manually scraping it I guess?
	let response = await axios.post('https://archives.bulbagarden.net/wiki/Special:Export', {
		title: 'Special:Export',
		catname: 'Pokémon_Sleep_sleep_style_sprites',
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
	const fileList = ooui.value.split('\n').filter(title => /^File:Sleep_Style_(\d+)-(\d+)(_s)?\.png/.test(title));
	const imageURLs = await getPokemonSleepImageURLs(fileList.map(title => ({ title })));

	return imageURLs.map(({ title, url }) => {
		const parts = title.match(/^File:Sleep Style (\d+)-(\d+)( s)?\.png/);

		return {
			dex: Number(parts[1]),
			variation: Number(parts[2]),
			shiny: !!parts[3],
			url
		};
	}).filter(({ variation }) => variation !== 4); // * Variation 4 seems to always be the Snorlax one?
}

export default async function main(pokeapi) {
	const sleepArt = await getAllPokemonSleepArt();
	const progress = new cliProgress.SingleBar({
		format: 'Pokemon Sleep {bar} | {value}/{total} | {percentage}%'
	}, cliProgress.Presets.shades_classic);

	progress.start(sleepArt.length);

	for (const sleepPokemon of sleepArt) {
		try {
			const pokemon = pokeapi.find(p => p.id.pokeapi === sleepPokemon.dex && p.is_default);

			if (!pokemon) {
				continue;
			}

			// * These always seem to be male?
			const imageURL = sleepPokemon.shiny ? `/images/pokemon/${pokemon.name}/pokemon_sleep_male_${sleepPokemon.variation}_shiny.png` : `/images/pokemon/${pokemon.name}/pokemon_sleep_male_${sleepPokemon.variation}.png`;
			const previewURL = sleepPokemon.shiny ? `/images/pokemon/${pokemon.name}/pokemon_sleep_male_${sleepPokemon.variation}_shiny_preview.png` : `/images/pokemon/${pokemon.name}/pokemon_sleep_male_${sleepPokemon.variation}_preview.png`;

			// * Skip if already exists, since this script can make duplicates
			if (pokemon.images.some(({ url }) => url === imageURL)) {
				continue;
			}

			const fileImagePath = path.join(__dirname, '..', 'public', imageURL);
			const filePreviewPath = path.join(__dirname, '..', 'public', previewURL);

			await fs.ensureDir(path.dirname(fileImagePath));

			const response = await fetch(sleepPokemon.url);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const writeStream = fs.createWriteStream(fileImagePath);

			await pipeline(response.body, writeStream);

			const image = {
				style: 'artwork',
				platform: 'pokemon_sleep',
				platform_display_name: 'Pokémon Sleep',
				gender: 'male',
				gender_display_name: 'Male',
				shiny: sleepPokemon.shiny,
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
			console.log(sleepPokemon.url);
			process.exit();
		} finally {
			progress.increment();
		}
	}

	progress.stop();

	return pokeapi;
}
