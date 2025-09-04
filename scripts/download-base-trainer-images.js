import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import axios from 'axios';
import fs from 'fs-extra';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const spriteCategories = [
	'Generation_I_Trainer_sprites',
	'Generation_II_Trainer_sprites',
	'Generation_III_Trainer_sprites',
	'Generation_IV_Trainer_sprites',
	'Generation_V_Trainer_sprites',
	'Trainer_class_artwork',
	'Pokémon_Masters_Trainer_sprites'
];

function isAnimatedPNG(filePath) {
	try {
		const buffer = fs.readFileSync(filePath);

		if (!buffer.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
			return false;
		}

		let offset = 8;

		while (offset < buffer.length - 8) {
			const chunkLength = buffer.readUInt32BE(offset);
			offset += 4;

			const chunkType = buffer.slice(offset, offset + 4).toString('ascii');
			offset += 4;

			if (chunkType === 'acTL' || chunkType === 'fcTL' || chunkType === 'fdAT') {
				return true;
			}

			offset += chunkLength + 4;

			if (chunkType === 'IEND') {
				break;
			}
		}

		return false;
	} catch (error) {
		console.error(`Error reading ${filePath}:`, error.message);
		return false;
	}
}

function parseAPNGFrameData(filePath) {
	try {
		const buffer = fs.readFileSync(filePath);

		let offset = 8;
		const frames = [];

		while (offset < buffer.length - 8) {
			const chunkLength = buffer.readUInt32BE(offset);
			offset += 4;

			const chunkType = buffer.slice(offset, offset + 4).toString('ascii');
			offset += 4;

			if (chunkType === 'fcTL') {
				const frameWidth = buffer.readUInt32BE(offset + 4);
				const frameHeight = buffer.readUInt32BE(offset + 8);
				const delayNum = buffer.readUInt16BE(offset + 20);
				const delayDen = buffer.readUInt16BE(offset + 22);

				const denominator = delayDen === 0 ? 100 : delayDen;
				const delayMs = Math.round((delayNum / denominator) * 1000);

				frames.push({
					width: frameWidth,
					height: frameHeight,
					delay: delayMs
				});
			}

			offset += chunkLength + 4;

			if (chunkType === 'IEND') {
				break;
			}
		}

		if (frames.length === 0) {
			return null;
		}

		return frames;
	} catch (error) {
		console.error(`Error parsing APNG ${filePath}:`, error.message);
		return null;
	}
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

			await downloadImage(image.url, `${__dirname}/../public/${localPath}.${fileExtension}`);

			const animated = isAnimatedPNG(`${__dirname}/../public/${localPath}.${fileExtension}`);

			if (!animated) {
				localPath = `${localPath}.${fileExtension}`;
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
			} else {
				const localPreviewPath = `${localPath}_animated_preview.apng`;

				await fs.move(`${__dirname}/../public/${localPath}.${fileExtension}`, `${__dirname}/../public/${localPreviewPath}`, {
					overwrite: true
				});

				localPath = `${localPath}_animated_sheet.png`;
				const frames = parseAPNGFrameData(`${__dirname}/../public/${localPreviewPath}`);

				// * At the time of writing, September 2nd 2025, ffmpeg's latest release, 8.0, has a bug
				// * where it does not handle animated PNGs correctly. See https://code.ffmpeg.org/FFmpeg/FFmpeg/pulls/20208
				// * for details.
				// *
				// * This patch was merged, but has not made it's way into a release yet. Even still, some
				// * animated PNGs give errors in ffmpeg. Until those are solved, we have to use other tricks
				if (fs.existsSync(`${__dirname}/frames`)) {
					await fs.rmdir(`${__dirname}/frames`, { recursive: true, force: true });
				}

				// * https://github.com/apngasm/apngasm
				await execAsync(`apngasm -o ${__dirname}/frames -D ${__dirname}/../public/${localPreviewPath}`, {
					stdio: ['pipe', 'pipe', 'pipe']
				});

				await execAsync(`magick $(ls ${__dirname}/frames/*.png | sort -V) +append ${__dirname}/../public${localPath}`, {
					stdio: ['pipe', 'pipe', 'pipe'],
					shell: true // * Need shell for the $(ls ... | sort -V) command
				});

				trainers.push({
					style: normalizedName.style, // * Just hijacking the normalize function for this, it's not a name thing
					name: normalizedName.display_name,
					platform: normalizedName.platform,
					platform_display_name: normalizedName.platform_display_name,
					creator: 'GameFreak',
					image_url: localPath,
					preview_url: localPreviewPath,
					frame_data: frames
				});
			}
		}
	}

	fs.rmdirSync(`${__dirname}/frames`, { recursive: true, force: true });
	fs.ensureDirSync(`${__dirname}/../public/metadata`);
	fs.writeJSONSync(`${__dirname}/../public/metadata/trainers.json`, trainers);
}

main();
