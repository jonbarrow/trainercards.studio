import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import fs from 'fs-extra';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const spriteCategories = [
	'Generation_I_Trainer_sprites',
	'Generation_II_Trainer_sprites',
	'Generation_III_Trainer_sprites',
	'Generation_IV_Trainer_sprites',
	'Generation_V_Trainer_sprites',
	'Trainer_class_artwork',
	'Pokémon_Masters_Trainer_sprites'
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

async function getImageURLs(categoryMembers) {
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

function removePrefix(prefix, string) {
	if (string.startsWith(prefix)) {
		return string.slice(prefix.length);
	}

	return string;
}

function removeSuffix(suffix, string) {
	if (string.endsWith(suffix)) {
		return string.slice(0, -suffix.length);
	}

	return string;
}

function normalizeMemberFileName(title) {
	let name = title.split('.')[0]; // * Remove file extension
	name = removePrefix('File:', name);
	name = removePrefix('Spr ', name);

	const parts = name.split(' ');
	const platformAbbreviation = parts.shift();
	name = parts.join(' ');

	let platform = '';
	let platformDisplayName = '';
	let style = '';
	switch (platformAbbreviation) {
		case 'RG':
			platform = 'red_green';
			platformDisplayName = 'Red / Green';
			style = 'pixel_art';
			break;

		case 'RB':
			platform = 'red_blue';
			platformDisplayName = 'Red / Blue';
			style = 'pixel_art';
			break;

		case 'RGB':
			platform = 'red_green_blue';
			platformDisplayName = 'Red / Green / Blue';
			style = 'pixel_art';
			break;

		case 'Y':
			platform = 'yellow';
			platformDisplayName = 'Yellow';
			style = 'pixel_art';
			break;

		case 'GS':
		case 'Gold':
			platform = 'gold_silver';
			platformDisplayName = 'Gold / Silver';
			style = 'pixel_art';
			break;

		case 'C':
			platform = 'crystal';
			platformDisplayName = 'Crystal';
			style = 'pixel_art';
			break;

		case 'RS':
		case 'Ruby':
			platform = 'ruby_sapphire';
			platformDisplayName = 'Ruby / Sapphire';
			style = 'pixel_art';
			break;

		case 'E':
		case 'Emerald':
			platform = 'emerald';
			platformDisplayName = 'Emerald';
			style = 'pixel_art';
			break;

		case 'FRLG':
			platform = 'fire_red_leaf_green';
			platformDisplayName = 'Fire Red / Leaf Green';
			style = 'pixel_art';
			break;

		case 'DP':
		case 'Diamond':
			platform = 'diamond_pearl';
			platformDisplayName = 'Diamond / Pearl';
			style = 'pixel_art';
			break;

		case 'Pt':
			platform = 'platinum';
			platformDisplayName = 'Platinum';
			style = 'pixel_art';
			break;

		case 'GoldHGSS':
		case 'HGSS':
			platform = 'heart_gold_soul_silver';
			platformDisplayName = 'Heart Gold / Soul Silver';
			style = 'pixel_art';
			break;

		case 'BW':
			platform = 'black_white';
			platformDisplayName = 'Black / White';
			style = 'pixel_art';
			break;

		case 'B2W2':
			platform = 'black_2_white_2';
			platformDisplayName = 'Black 2 / White 2';
			style = 'pixel_art';
			break;

		case 'XY':
			platform = 'x_y';
			platformDisplayName = 'X / Y';
			// style = 'pixel_art'; // TODO - Figure this out, there's a mix of model renders and artwork
			break;

		case 'ORAS':
		case 'Omega':
			platform = 'omegaruby_alphasapphire';
			platformDisplayName = 'Omega Ruby / Alpha Sapphire';
			// style = 'pixel_art'; // TODO - Figure this out, there's a mix of model renders and artwork
			break;

		case 'SM':
			platform = 'sun_moon';
			platformDisplayName = 'Sun / Moon';
			// style = 'pixel_art'; // TODO - Figure this out, there's a mix of model renders and artwork
			break;

		case 'Masters':
			platform = 'masters';
			platformDisplayName = 'Masters';
			style = 'model_render';
			break;
	}

	if (!platform) {
		// console.log('unknown platform', title);
		// process.exit(0);
		return null;
	}

	const data = {
		style,
		platform,
		platform_display_name: platformDisplayName
	};

	if (name.endsWith(' M')) {
		data.gender = 'male';
		name = removeSuffix(' M', name);
	} else if (name.endsWith(' F')) {
		data.gender = 'female';
		name = removeSuffix(' F', name);
	}

	data.name = name.toLowerCase().replace(/ /g, '_');
	data.display_name = name;

	return data;
}

async function main() {
	const trainers = [];

	for (const category of spriteCategories) {
		const categoryMembers = await getCategoryMembers(category);
		let imageURLs = await getImageURLs(categoryMembers);

		// * Remove back sprites
		imageURLs = imageURLs.filter(image => !image.title.includes(' Back') && !image.title.includes('Back ') && !image.title.includes(' back') && !image.title.includes('back '));

		for (const image of imageURLs) {
			const fileExtension = image.url.split('.').pop();
			const normalizedName = normalizeMemberFileName(image.title);
			if (!normalizedName) {
				continue;
			}

			let localPath = `/images/trainers/${normalizedName.platform}/${normalizedName.name}`;

			if (normalizedName.gender) {
				localPath = `${localPath}_${normalizedName.gender}`;
			}

			localPath = `${localPath}.${fileExtension}`;

			await downloadImage(image.url, `${__dirname}/../public/${localPath}`);

			const dimensions = await getImageDimensions(`${__dirname}/../public/${localPath}`);

			trainers.push({
				style: normalizedName.style, // * Just hijacking the normalize function for this, it's not a name thing
				name: normalizedName.display_name,
				platform: normalizedName.platform,
				platform_display_name: normalizedName.platform_display_name,
				creator: 'GameFreak',
				image_url: localPath,
				preview_url: localPath,
				dimensions
			});
		}
	}

	fs.ensureDirSync(`${__dirname}/../public/metadata`);
	fs.writeJSONSync(`${__dirname}/../public/metadata/trainers.json`, trainers);
}

main();
