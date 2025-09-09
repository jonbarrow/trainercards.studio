import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';
import yauzl from 'yauzl-promise';
import gifInfo from 'gif-info';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const pokeapi = fs.readJSONSync(`${__dirname}/../public/metadata/pokemon.json`);

const UUID_REGEX = /<input type="hidden" name="uuid" value="(.*?)">/;

const DEX_NAME_MAP = {
	'1': 'bulbasaur',
	'2': 'ivysaur',
	'3': 'venusaur',
	'4': 'charmander',
	'5': 'charmeleon',
	'6': 'charizard',
	'7': 'squirtle',
	'8': 'wartortle',
	'9': 'blastoise',
	'10': 'caterpie',
	'11': 'metapod',
	'12': 'butterfree',
	'13': 'weedle',
	'14': 'kakuna',
	'15': 'beedrill',
	'16': 'pidgey',
	'17': 'pidgeotto',
	'18': 'pidgeot',
	'19': 'rattata',
	'20': 'raticate',
	'21': 'spearow',
	'22': 'fearow',
	'23': 'ekans',
	'24': 'arbok',
	'25': 'pikachu',
	'26': 'raichu',
	'27': 'sandshrew',
	'28': 'sandslash',
	'29': 'nidoran-f',
	'30': 'nidorina',
	'31': 'nidoqueen',
	'32': 'nidoran-m',
	'33': 'nidorino',
	'34': 'nidoking',
	'35': 'clefairy',
	'36': 'clefable',
	'37': 'vulpix',
	'38': 'ninetales',
	'39': 'jigglypuff',
	'40': 'wigglytuff',
	'41': 'zubat',
	'42': 'golbat',
	'43': 'oddish',
	'44': 'gloom',
	'45': 'vileplume',
	'46': 'paras',
	'47': 'parasect',
	'48': 'venonat',
	'49': 'venomoth',
	'50': 'diglett',
	'51': 'dugtrio',
	'52': 'meowth',
	'53': 'persian',
	'54': 'psyduck',
	'55': 'golduck',
	'56': 'mankey',
	'57': 'primeape',
	'58': 'growlithe',
	'59': 'arcanine',
	'60': 'poliwag',
	'61': 'poliwhirl',
	'62': 'poliwrath',
	'63': 'abra',
	'64': 'kadabra',
	'65': 'alakazam',
	'66': 'machop',
	'67': 'machoke',
	'68': 'machamp',
	'69': 'bellsprout',
	'70': 'weepinbell',
	'71': 'victreebel',
	'72': 'tentacool',
	'73': 'tentacruel',
	'74': 'geodude',
	'75': 'graveler',
	'76': 'golem',
	'77': 'ponyta',
	'78': 'rapidash',
	'79': 'slowpoke',
	'80': 'slowbro',
	'81': 'magnemite',
	'82': 'magneton',
	'83': 'farfetchd',
	'84': 'doduo',
	'85': 'dodrio',
	'86': 'seel',
	'87': 'dewgong',
	'88': 'grimer',
	'89': 'muk',
	'90': 'shellder',
	'91': 'cloyster',
	'92': 'gastly',
	'93': 'haunter',
	'94': 'gengar',
	'95': 'onix',
	'96': 'drowzee',
	'97': 'hypno',
	'98': 'krabby',
	'99': 'kingler',
	'100': 'voltorb',
	'101': 'electrode',
	'102': 'exeggcute',
	'103': 'exeggutor',
	'104': 'cubone',
	'105': 'marowak',
	'106': 'hitmonlee',
	'107': 'hitmonchan',
	'108': 'lickitung',
	'109': 'koffing',
	'110': 'weezing',
	'111': 'rhyhorn',
	'112': 'rhydon',
	'113': 'chansey',
	'114': 'tangela',
	'115': 'kangaskhan',
	'116': 'horsea',
	'117': 'seadra',
	'118': 'goldeen',
	'119': 'seaking',
	'120': 'staryu',
	'121': 'starmie',
	'122': 'mr-mime',
	'123': 'scyther',
	'124': 'jynx',
	'125': 'electabuzz',
	'126': 'magmar',
	'127': 'pinsir',
	'128': 'tauros',
	'129': 'magikarp',
	'130': 'gyarados',
	'131': 'lapras',
	'132': 'ditto',
	'133': 'eevee',
	'134': 'vaporeon',
	'135': 'jolteon',
	'136': 'flareon',
	'137': 'porygon',
	'138': 'omanyte',
	'139': 'omastar',
	'140': 'kabuto',
	'141': 'kabutops',
	'142': 'aerodactyl',
	'143': 'snorlax',
	'144': 'articuno',
	'145': 'zapdos',
	'146': 'moltres',
	'147': 'dratini',
	'148': 'dragonair',
	'149': 'dragonite',
	'150': 'mewtwo',
	'151': 'mew',
	'152': 'chikorita',
	'153': 'bayleef',
	'154': 'meganium',
	'155': 'cyndaquil',
	'156': 'quilava',
	'157': 'typhlosion',
	'158': 'totodile',
	'159': 'croconaw',
	'160': 'feraligatr',
	'161': 'sentret',
	'162': 'furret',
	'163': 'hoothoot',
	'164': 'noctowl',
	'165': 'ledyba',
	'166': 'ledian',
	'167': 'spinarak',
	'168': 'ariados',
	'169': 'crobat',
	'170': 'chinchou',
	'171': 'lanturn',
	'172': 'pichu',
	'173': 'cleffa',
	'174': 'igglybuff',
	'175': 'togepi',
	'176': 'togetic',
	'177': 'natu',
	'178': 'xatu',
	'179': 'mareep',
	'180': 'flaaffy',
	'181': 'ampharos',
	'182': 'bellossom',
	'183': 'marill',
	'184': 'azumarill',
	'185': 'sudowoodo',
	'186': 'politoed',
	'187': 'hoppip',
	'188': 'skiploom',
	'189': 'jumpluff',
	'190': 'aipom',
	'191': 'sunkern',
	'192': 'sunflora',
	'193': 'yanma',
	'194': 'wooper',
	'195': 'quagsire',
	'196': 'espeon',
	'197': 'umbreon',
	'198': 'murkrow',
	'199': 'slowking',
	'200': 'misdreavus',
	'201': 'unown-a',
	'201-a': 'unown-a',
	'201-b': 'unown-b',
	'201-c': 'unown-c',
	'201-d': 'unown-d',
	'201-e': 'unown-e',
	'201-f': 'unown-f',
	'201-g': 'unown-g',
	'201-h': 'unown-h',
	'201-i': 'unown-i',
	'201-j': 'unown-j',
	'201-k': 'unown-k',
	'201-l': 'unown-l',
	'201-m': 'unown-m',
	'201-n': 'unown-n',
	'201-o': 'unown-o',
	'201-p': 'unown-p',
	'201-q': 'unown-q',
	'201-r': 'unown-r',
	'201-s': 'unown-s',
	'201-t': 'unown-t',
	'201-u': 'unown-u',
	'201-v': 'unown-v',
	'201-w': 'unown-w',
	'201-x': 'unown-x',
	'201-y': 'unown-y',
	'201-z': 'unown-z',
	'202': 'wobbuffet',
	'203': 'girafarig',
	'204': 'pineco',
	'205': 'forretress',
	'206': 'dunsparce',
	'207': 'gligar',
	'208': 'steelix',
	'209': 'snubbull',
	'210': 'granbull',
	'211': 'qwilfish',
	'212': 'scizor',
	'213': 'shuckle',
	'214': 'heracross',
	'215': 'sneasel',
	'216': 'teddiursa',
	'217': 'ursaring',
	'218': 'slugma',
	'219': 'magcargo',
	'220': 'swinub',
	'221': 'piloswine',
	'222': 'corsola',
	'223': 'remoraid',
	'224': 'octillery',
	'225': 'delibird',
	'226': 'mantine',
	'227': 'skarmory',
	'228': 'houndour',
	'229': 'houndoom',
	'230': 'kingdra',
	'231': 'phanpy',
	'232': 'donphan',
	'233': 'porygon2',
	'234': 'stantler',
	'235': 'smeargle',
	'236': 'tyrogue',
	'237': 'hitmontop',
	'238': 'smoochum',
	'239': 'elekid',
	'240': 'magby',
	'241': 'miltank',
	'242': 'blissey',
	'243': 'raikou',
	'244': 'entei',
	'245': 'suicune',
	'246': 'larvitar',
	'247': 'pupitar',
	'248': 'tyranitar',
	'249': 'lugia',
	'250': 'ho-oh',
	'251': 'celebi'
};

async function run(command, options = {}) {
	await execAsync(command, {
		stdio: ['pipe', 'pipe', 'pipe'],
		...options
	});
}

async function downloadFileBuffer(url) {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();

	return Buffer.from(arrayBuffer);
}

async function downloadGoogleDrive(fileID) {
	let buffer = await downloadFileBuffer(`https://drive.google.com/uc?export=download&id=${fileID}`);

	if (buffer.toString().includes('Google Drive can\'t scan this file for viruses.')) {
		const uuid = buffer.toString().match(UUID_REGEX)[1];

		buffer = await downloadFileBuffer(`https://drive.usercontent.google.com/download?id=${fileID}&export=download&authuser=0&confirm=t&uuid=${uuid}`);
	}

	return buffer;
}

async function processZipFile(buffer, style, platform, platform_display_name, shiny) {
	const zip = await yauzl.fromBuffer(buffer);

	try {
		for await (const entry of zip) {
			const filename = entry.filename;
			const dexID = path.basename(filename, path.extname(filename));
			const slug = DEX_NAME_MAP[dexID.toLowerCase()];

			if (!slug) {
				console.log(filename);
				process.exit();
			}

			let found = false;
			for (const pokemon of pokeapi) {
				if (slug === pokemon.name) {
					found = true;
					const url = shiny ? `/images/pokemon/${pokemon.name}/${platform}_male_shiny_animated_sheet.png` : `/images/pokemon/${pokemon.name}/${platform}_male_animated_sheet.png`;
					const previewURL = shiny ? `/images/pokemon/${pokemon.name}/${platform}_male_shiny_preview.gif` : `/images/pokemon/${pokemon.name}/${platform}_male_preview.gif`;
					const image = {
						style: style,
						platform: platform,
						platform_display_name: platform_display_name,
						gender: 'male',
						gender_display_name: 'Male',
						shiny: shiny,
						creator: 'GameFreak',
						url: url,
						preview_url: previewURL
					};

					// * Skip if already exists, since this script can make duplicates
					if (pokemon.images.some(({ url }) => url === image.url)) {
						continue;
					}

					const outPath = path.join(__dirname, entry.filename);
					const outSheetPath = path.join(__dirname, '..', 'public', 'images', 'pokemon', pokemon.name, path.basename(image.url));
					const outPreviewPath = path.join(__dirname, '..', 'public', 'images', 'pokemon', pokemon.name, path.basename(image.preview_url));

					const readStream = await entry.openReadStream();
					const writeStream = fs.createWriteStream(outPath);
					await pipeline(readStream, writeStream);

					if (style === 'pixel_art') {
						// * Crystal sprites have padding on all sides, need to
						// * crop it all out and rebuild the GIF for better sizing
						const framesPath = path.join(__dirname, 'frames');
						const framesCenteredPath = path.join(__dirname, 'frames_centered');
						const demuxerPath = path.join(__dirname, 'demuxer.txt');
						const palettePath = path.join(__dirname, 'palette.png');

						await fs.ensureDir(framesPath);
						await fs.emptyDir(framesPath);
						await run(`ffmpeg -vsync 0 -i ${outPath} -vf format=rgba ${framesPath}/frame_%03d.png`);

						const frames = (await fs.readdir(framesPath)).filter(file => file.endsWith('.png')).sort();

						let minContentX = Infinity;
						let minContentY = Infinity;
						let maxContentRight = 0;
						let maxContentBottom = 0;

						// * We can't just center frames in the new images because
						// * then GIFs that only have movement on one side may have
						// * content get cropped out. So we need to calculate the
						// * position each frame is offset by
						for (const frame of frames) {
							const framePath = path.join(framesPath, frame);
							const dimensions = await getImageDimensions(framePath);

							const contentX = dimensions.padding.left;
							const contentY = dimensions.padding.top;
							const contentRight = contentX + dimensions.content.width;
							const contentBottom = contentY + dimensions.content.height;

							minContentX = Math.min(minContentX, contentX);
							minContentY = Math.min(minContentY, contentY);
							maxContentRight = Math.max(maxContentRight, contentRight);
							maxContentBottom = Math.max(maxContentBottom, contentBottom);
						}

						const totalContentWidth = maxContentRight - minContentX;
						const totalContentHeight = maxContentBottom - minContentY;

						await fs.ensureDir(framesCenteredPath);
						await fs.emptyDir(framesCenteredPath);

						for (const frame of frames) {
							const inputPath = path.join(framesPath, frame);
							const outputPath = path.join(framesCenteredPath, frame);
							await run(`ffmpeg -i ${inputPath} -vf "crop=${totalContentWidth}:${totalContentHeight}:${minContentX}:${minContentY}" ${outputPath}`);
						}

						const gifBuffer = await fs.readFile(outPath);
						const info = gifInfo(Uint8Array.from(gifBuffer).buffer);
						const delays = info.images.map(frame => frame.delay);
						const ffmpegDelays = delays.map(delay => delay / 1000);

						let demuxer = frames.map((frame, i) => `file '${framesCenteredPath}/${frame}'\nduration ${ffmpegDelays[i]}`).join('\n');
						demuxer = `${demuxer}\nfile '${framesCenteredPath}/${frames[frames.length - 1]}'`;

						await fs.writeFile(demuxerPath, demuxer);
						await run(`ffmpeg -y -f concat -safe 0 -i ${demuxerPath} -vf palettegen=reserve_transparent=1 ${palettePath}`);
						await run(`ffmpeg -y -f concat -safe 0 -i ${demuxerPath} -i ${palettePath} -lavfi paletteuse=alpha_threshold=128 -gifflags -offsetting ${outPath}`);

						await fs.remove(framesPath);
						await fs.remove(framesCenteredPath);
						await fs.remove(demuxerPath);
						await fs.remove(palettePath);
					}

					const gifBuffer = await fs.readFile(outPath);
					const info = gifInfo(Uint8Array.from(gifBuffer).buffer);
					const frameCount = info.images.length;

					await run(`ffmpeg -y -i ${outPath} -vf "tile=${frameCount}x1" -update 1 ${outSheetPath}`);

					await fs.move(outPath, outPreviewPath, {
						overwrite: true
					});

					image.frame_data = info.images.map(i => ({
						width: i.width,
						height: i.height,
						delay: i.delay
					}));

					pokemon.images.push(image);
				}
			}

			if (!found) {
				console.log('Could not find matching pokemon for', filename);
			}
		}
	} catch (error) {
		console.error(error);
	}
}

async function main() {
	const stadium2RegularBuffer = await downloadGoogleDrive('1Zqh1rcQmW7hs8dqucWtT-hJuNwFwPFGX');
	const stadium2ShinyBuffer = await downloadGoogleDrive('1BNXGH5SlbsOeaKZQ9pyXL8nMg5rtHVO0');
	const crystalAnimatedRegularBuffer = await downloadFileBuffer('https://bluemoonfalls.com/downloads/Crystal-Sprites-Normal-Number-Sorted.zip');
	const crystalAnimatedShinyBuffer = await downloadFileBuffer('https://bluemoonfalls.com/downloads/Crystal-Sprites-Shiny-Number-Sorted.zip');

	await processZipFile(stadium2RegularBuffer, 'model_render', 'stadium_2', 'Stadium 2', false);
	await processZipFile(stadium2ShinyBuffer, 'model_render', 'stadium_2', 'Stadium 2', true);
	await processZipFile(crystalAnimatedRegularBuffer, 'pixel_art', 'crystal', 'Crystal', false);
	await processZipFile(crystalAnimatedShinyBuffer, 'pixel_art', 'crystal', 'Crystal', true);

	await fs.writeJSON(`${__dirname}/../public/metadata/pokemon.json`, pokeapi);
}

main();
