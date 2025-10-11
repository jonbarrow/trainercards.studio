import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import axios from 'axios';
import fs from 'fs-extra';
import sharp from 'sharp';
import gifInfo from 'gif-info';
import { JSDOM } from 'jsdom';
import cliProgress from 'cli-progress';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

function buildPokemonImages(pokemon, form) {
	// * PokeAPI only exposes all image URLs for the default forms of Pokemon. Alternate forms
	// * only expose the "default" sprites, but not for other platforms, despite the images
	// * being present in the GitHub repo. This means we have to hand-craft the URLs and
	// * just hope for the best. This might require special cases in the future if not all
	// * Pokemon work with this implementation
	// *
	// * See https://github.com/PokeAPI/pokeapi/issues/1281 for details
	// *
	// * Dream World art is skipped here, taken from https://archives.bulbagarden.net/wiki/Category:Pok%C3%A9mon_Dream_World_artwork
	// * instead later down
	const fileName = form.is_default ? `${pokemon.id}` : `${pokemon.id}-${form.form_name}`;

	return [
		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/${fileName}.png` },
		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/female/${fileName}.png` },
		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/shiny/${fileName}.png` },
		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'generation_vii_icons', platform_display_name: 'Generation VII Icons', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/icons/${fileName}.png` },
		{ style: 'pixel_art', platform: 'generation_vii_icons', platform_display_name: 'Generation VII Icons', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/icons/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'generation_viii_icons', platform_display_name: 'Generation VIII Icons', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-viii/icons/${fileName}.png` },
		{ style: 'pixel_art', platform: 'generation_viii_icons', platform_display_name: 'Generation VIII Icons', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-viii/icons/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/${fileName}.png` },
		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/shiny/female/${fileName}.png` },

		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/${fileName}.png` },
		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/female/${fileName}.png` },
		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'red_blue', platform_display_name: 'Red / Blue', gender: 'male', gender_display_name: 'Male', shiny: false, gray: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/red-blue/gray/${fileName}.png` },
		{ style: 'pixel_art', platform: 'red_blue', platform_display_name: 'Red / Blue', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/red-blue/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'yellow', platform_display_name: 'Yellow', gender: 'male', gender_display_name: 'Male', shiny: false, gray: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/yellow/gray/${fileName}.png` },
		{ style: 'pixel_art', platform: 'yellow', platform_display_name: 'Yellow', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/yellow/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'gold', platform_display_name: 'Gold', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/gold/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'gold', platform_display_name: 'Gold', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/gold/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'silver', platform_display_name: 'Silver', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/silver/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'silver', platform_display_name: 'Silver', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/silver/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'crystal', platform_display_name: 'Crystal', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/crystal/transparent/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'crystal', platform_display_name: 'Crystal', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/crystal/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'ruby_sapphire', platform_display_name: 'Ruby / Sapphire', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/ruby-sapphire/${fileName}.png` },
		{ style: 'pixel_art', platform: 'ruby_sapphire', platform_display_name: 'Ruby / Sapphire', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/ruby-sapphire/shiny/${fileName}.png` },

		{ style: 'pixel_art', platform: 'emerald', platform_display_name: 'Emerald', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/emerald/${fileName}.png` },
		{ style: 'pixel_art', platform: 'emerald', platform_display_name: 'Emerald', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/emerald/shiny/${fileName}.png` },

		{ style: 'pixel_art', platform: 'firered_leafgreen', platform_display_name: 'Fire Red / Leaf Green', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/firered-leafgreen/${fileName}.png` },
		{ style: 'pixel_art', platform: 'firered_leafgreen', platform_display_name: 'Fire Red / Leaf Green', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/firered-leafgreen/shiny/${fileName}.png` },

		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/${fileName}.png` },
		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/${fileName}.png` },
		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/${fileName}.png` },
		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/${fileName}.png` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions//generation-v/black-white/animated/${fileName}.gif` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions//generation-v/black-white/animated/female/${fileName}.gif` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions//generation-v/black-white/animated/shiny/${fileName}.gif` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions//generation-v/black-white/animated/shiny/female/${fileName}.gif` },

		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/${fileName}.png` },
		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/female/${fileName}.png` },
		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/shiny/female/${fileName}.png` },

		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/${fileName}.png` },
		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/female/${fileName}.png` },
		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/shiny/female/${fileName}.png` },

		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/${fileName}.png` },
		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/female/${fileName}.png` },
		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/shiny/female/${fileName}.png` },

		{ style: 'model_render', platform: 'showdown', platform_display_name: 'Pokémon Showdown', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/showdown/${fileName}.gif` },
		{ style: 'model_render', platform: 'showdown', platform_display_name: 'Pokémon Showdown', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/showdown/female/${fileName}.gif` },
		{ style: 'model_render', platform: 'showdown', platform_display_name: 'Pokémon Showdown', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/showdown/shiny/${fileName}.gif` },
		{ style: 'model_render', platform: 'showdown', platform_display_name: 'Pokémon Showdown', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/showdown/shiny/female/${fileName}.gif` }
	];
}

/*
async function getCategoryMembers(category) {
	const baseUrl = 'https://archives.bulbagarden.net/w/api.php';
	let allMembers = [];
	let continueToken = null;

	do {
		const params = new URLSearchParams({
			action: 'query',
			list: 'categorymembers',
			cmtitle: `Category:${category}`,
			cmtype: 'file',
			cmlimit: '500',
			format: 'json',
			origin: '*'
		});

		if (continueToken) {
			params.append('cmcontinue', continueToken);
		}

		const response = await axios.get(`${baseUrl}?${params}`);
		const { data } = response;

		if (data.query && data.query.categorymembers) {
			allMembers.push(...data.query.categorymembers);
		}

		continueToken = data.continue ? data.continue.cmcontinue : null;
	} while (continueToken);

	return allMembers;
}
*/

async function getDreamWorldImageURLs(categoryMembers) {
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

async function getAllDreamWorldArt() {
	// * The API constantly throws 503 errors here, try just manually scraping it I guess?
	/*
	const pokedexNumberRegex = /^File:\d{3,}/;
	let categoryMembers = await getCategoryMembers('Pokémon_Dream_World_artwork');
	categoryMembers = categoryMembers.filter(({ title }) => pokedexNumberRegex.test(title));

	const imageURLs = await getDreamWorldImageURLs(categoryMembers);

	return imageURLs.map(({ title, url }) => ({
		id: parseInt(title.match(/^File:(\d{3,})/)[1]),
		title,
		url
	}));
	*/

	const pokedexNumberRegex = /^File:\d{3,}/;
	let response = await axios.post('https://archives.bulbagarden.net/wiki/Special:Export', {
		title: 'Special:Export',
		catname: 'Pokémon_Dream_World_artwork',
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
	const fileList = ooui.value.split('\n').filter(title => pokedexNumberRegex.test(title));
	const imageURLs = await getDreamWorldImageURLs(fileList.map(title => ({ title })));

	return imageURLs.map(({ title, url }) => ({
		id: parseInt(title.match(/^File:(\d{3,})/)[1]),
		title,
		url
	}));
}

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

export default async function main() {
	console.log('Downloading all Dream World images...');

	const dreamWorldArt = await getAllDreamWorldArt();

	console.log('Found', dreamWorldArt.length, 'Dream World images');

	const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
	const pokemonData = [];
	const progress = new cliProgress.SingleBar({
		format: 'Base Pokemon {bar} | {value}/{total} | {percentage}%'
	}, cliProgress.Presets.shades_classic);

	progress.start(response.data.results.length);

	for (const { url } of response.data.results) {
		try {
			// * PokeAPI has issues with trailing slashes sometimes.
			// * See https://github.com/PokeAPI/pokeapi/issues/1286
			const { data: pokemon } = await axios.get(url.replace(/\/+$/, ''));
			const { data: species } = await axios.get(pokemon.species.url.replace(/\/+$/, ''));
			const speciesTranslation = species.names.find(translation => translation.language.name === 'en');

			for (const formData of pokemon.forms) {
				const formURL = formData.url.replace(/\/+$/, '');
				const { data: form } = await axios.get(formURL);
				let displayName = speciesTranslation.name;

				if (form.names.length !== 0) {
					// * See https://github.com/jonbarrow/trainercards.studio/issues/25
					// * for details
					let formTranslation = form.names.find(translation => translation.language.name === 'en');
					if (formTranslation) {
						displayName = formTranslation.name;
					} else if (form.form_names.length !== 0) {
						formTranslation = form.form_names.find(translation => translation.language.name === 'en');

						// * Prevent results like "Kyogre (Kyogre)"
						if (displayName !== formTranslation.name) {
							displayName = `${displayName} ${formTranslation.name}`;
						}
					}
				}

				const images = buildPokemonImages(pokemon, form).filter((image) => {
					// * See https://github.com/PokeAPI/sprites/issues/174
					// * for details
					if (fs.pathExistsSync(image.path)) {
						return true;
					}

					const extension = image.path.split('/').pop().split('.').pop();
					const newPath = `${path.dirname(image.path)}/${species.id}-${form.form_name}.${extension}`;

					if (fs.pathExistsSync(newPath)) {
						image.path = newPath;
						return true;
					}

					return false;
				});

				for (const image of images) {
					const extension = image.path.split('/').pop().split('.').pop();
					let localPath = `/images/pokemon/${formData.name}/${image.platform}_${image.gender}`;

					if (image.shiny) {
						localPath = `${localPath}_shiny`;
					}

					if (image.gray) {
						localPath = `${localPath}_gray`;
					}

					image.creator = 'GameFreak'; // TODO - Are showdown sprites made by GameFreak?

					if (extension !== 'gif') {
						const localPreviewPath = `${localPath}_preview.${extension}`;
						localPath = `${localPath}.${extension}`;

						await fs.ensureDir(path.dirname(`${__dirname}/../public${localPath}`));
						await fs.copyFile(image.path, `${__dirname}/../public${localPath}`);

						image.url = localPath;
						image.preview_url = localPreviewPath;
						image.dimensions = await getImageDimensions(`${__dirname}/../public${localPath}`);

						await sharp(`${__dirname}/../public${localPath}`).extract({
							left: image.dimensions.padding.left,
							top: image.dimensions.padding.top,
							width: image.dimensions.content.width,
							height: image.dimensions.content.height
						}).png().toFile(`${__dirname}/../public${localPreviewPath}`);
					} else {
						// * GIFs are special
						const localPreviewPath = `${localPath}_animated_preview.${extension}`;
						localPath = `${localPath}_animated_sheet.png`;

						const buffer = fs.readFileSync(image.path);
						const info = gifInfo(Uint8Array.from(buffer).buffer);
						const frameCount = info.images.length;

						await fs.ensureDir(path.dirname(`${__dirname}/../public${localPath}`));
						await execAsync(`ffmpeg -y -i ${image.path} -vf "tile=${frameCount}x1" -update 1 ${__dirname}/../public${localPath}`, {
							stdio: ['pipe', 'pipe', 'pipe']
						});

						await fs.copyFile(image.path, `${__dirname}/../public${localPreviewPath}`);

						image.url = localPath;
						image.preview_url = localPreviewPath;
						image.frame_data = info.images.map(i => ({
							width: i.width,
							height: i.height,
							delay: i.delay
						}));
					}

					delete image.path;
					delete image.gray;
				}

				if (form.is_default) {
					const dreamWorldImages = dreamWorldArt.filter(({ id }) => id === pokemon.id);

					for (let i = 0; i < dreamWorldImages.length; i++) {
						const dreamWorldImage = dreamWorldImages[i];
						const extension = dreamWorldImage.url.split('/').pop().split('.').pop();
						const localPath = `/images/pokemon/${formData.name}/dream_world_${i + 1}.${extension}`;
						const localPreviewPath = `/images/pokemon/${formData.name}/dream_world_${i + 1}_preview.${extension}`;

						await downloadImage(dreamWorldImage.url, `${__dirname}/../public${localPath}`);

						const image = {
							style: 'artwork',
							platform: 'dream_world',
							platform_display_name: 'Dream World',
							gender: dreamWorldImage.title.includes('_Female') ? 'female' : 'male',
							gender_display_name: dreamWorldImage.title.includes('_Female') ? 'Female' : 'Male',
							shiny: false,
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

						images.push(image);
					}
				}

				pokemonData.push({
					name: formData.name,
					display_name: displayName,
					images
				});
			}
		} catch (error) {
			console.log(error);
			console.log(url);
			process.exit();
		} finally {
			progress.increment();
		}
	}

	progress.stop();

	return pokemonData;
}
