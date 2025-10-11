import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { JSDOM } from 'jsdom';
import fs from 'fs-extra';
import sharp from 'sharp';
import cliProgress from 'cli-progress';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeFormName(form) {
	// * Fuck my stupid baka life,
	// * why can't we have consistency between platforms

	if (form.endsWith('-color')) {
		const parts = form.split('-');
		parts.pop();

		form = parts.join('-');
	}

	if (form.includes('-alolan')) {
		form = form.replace(/-alolan/g, '-alola');
	}

	if (form.includes('-gigantamax')) {
		form = form.replace(/-gigantamax/g, '-gmax');
	}

	if (form.includes('-hisuian')) {
		form = form.replace(/-hisuian/g, '-hisui');
	}

	if (form.includes('-galarian')) {
		form = form.replace(/-galarian/g, '-galar');
	}

	if (form.includes('-paldean')) {
		form = form.replace(/-paldean/g, '-paldea');
	}

	if (form.endsWith('-f') && !form.startsWith('unown-') && !form.startsWith('nidoran-')) {
		const parts = form.split('-');
		parts.pop();

		form = parts.join('-');
	}

	if (form.endsWith('-em') && form.startsWith('unown-')) {
		form = form.replace(/-em/g, '-exclamation');
	}

	if (form.endsWith('-qm') && form.startsWith('unown-')) {
		form = form.replace(/-qm/g, '-question');
	}

	if (form.endsWith('-curse')) {
		form = form.replace(/-curse/g, '-unknown');
	}

	if (form === 'arceus') {
		form = 'arceus-normal';
	}

	if (form === 'basculin-red' || form === 'basculin-blue') {
		form = `${form}-striped`;
	}

	if (form === 'mothim') {
		form = 'mothim-plant';
	}

	if (form === 'cherrim-sunny') {
		form = 'cherrim-sunshine';
	}

	if (form === 'rotom-normal') {
		form = 'rotom';
	}

	if (form === 'kyurem-normal') {
		form = 'kyurem';
	}

	if (form === 'scatterbug') {
		form = 'scatterbug-icy-snow';
	}

	if (form === 'spewpa') {
		form = 'spewpa-icy-snow';
	}

	if (form === 'pyroar-male' || form === 'pyroar-female') {
		form = 'pyroar';
	}

	if (form === 'vivillon-pokeball') {
		form = 'vivillon-poke-ball';
	}

	if (form === 'furfrou') {
		form = 'furfrou-natural';
	}

	if (form === 'furfrou-pharoah') {
		form = 'furfrou-pharaoh';
	}

	if (form === 'pumpkaboo') {
		form = 'pumpkaboo-average';
	}

	if (form === 'gourgeist') {
		form = 'gourgeist-average';
	}

	if (form === 'tauros-paldea-aqua') {
		form = 'tauros-paldea-aqua-breed';
	}

	if (form === 'tauros-paldea-blaze') {
		form = 'tauros-paldea-blaze-breed';
	}

	if (form === 'tauros-paldea-combat') {
		form = 'tauros-paldea-combat-breed';
	}

	if (form === 'sneasel-f-hisui') {
		form = 'sneasel-hisui';
	}

	if (form === 'xerneas') {
		form = 'xerneas-neutral';
	}

	if (form === 'zygarde') {
		form = 'zygarde-50';
	}

	if (form === 'hoopa-confined') {
		form = 'hoopa';
	}

	if (form === 'rockruff-dusk') {
		form = 'rockruff-own-tempo';
	}

	if (form === 'silvally') {
		form = 'silvally-normal';
	}

	if (form === 'alcremie') {
		form = 'alcremie-vanilla-cream';
	}

	if (form.startsWith('alcremie') && form !== 'alcremie-gmax') {
		const parts = form.split('-');
		const species = parts[0];
		const flavor = `${parts[1]}-${parts[2]}`;
		const sweet = `${parts[3] || 'strawberry'}-sweet`;

		form = `${species}-${flavor}-${sweet}`;
	}

	if (form === 'mimikyu') {
		form = 'mimikyu-disguised';
	}

	if (form === 'toxtricity-gmax') {
		form = 'toxtricity-amped-gmax';
	}

	if (form === 'zacian-hero') {
		form = 'zacian';
	}

	if (form === 'zamazenta-hero') {
		form = 'zamazenta';
	}

	if (form.startsWith('ogerpon')) {
		const mask = form.split('-')[1];
		if (mask === 'teal') {
			form = 'ogerpon';
		} else {
			form = `${form}-mask`;
		}
	}

	if (form === 'terapagos-normal') {
		form = 'terapagos';
	}

	if (form === 'sinistea') {
		form = 'sinistea-phony';
	}

	if (form === 'sinistcha') {
		form = 'sinistcha-unremarkable';
	}

	if (form === 'poltchageist') {
		form = 'poltchageist-counterfeit';
	}

	if (form === 'polteageist') {
		form = 'polteageist-phony';
	}

	if (form === 'necrozma-dawn-wings') {
		form = 'necrozma-dawn';
	}

	if (form === 'necrozma-dusk-mane') {
		form = 'necrozma-dusk';
	}

	if (form === 'urshifu') {
		form = 'urshifu-single-strike';
	}

	if (form === 'urshifu-gmax-rapid-strike') {
		form = 'urshifu-rapid-strike-gmax';
	}

	if (form === 'urshifu-gmax-single-strike') {
		form = 'urshifu-single-strike-gmax';
	}

	if (form === 'calyrex-ice-rider') {
		form = 'calyrex-ice';
	}

	if (form === 'calyrex-shadow-rider') {
		form = 'calyrex-shadow';
	}

	if (form === 'oinkologne') {
		form = 'oinkologne-male';
	}

	if (form === 'maushold-family3') {
		form = 'maushold-family-of-three';
	}

	if (form === 'maushold-family4') {
		form = 'maushold-family-of-four';
	}

	if (form.startsWith('squawkabilly-')) {
		form = `${form}-plumage`;
	}

	if (form === 'dudunsparce') {
		form = 'dudunsparce-two-segment';
	}

	if (form === 'gimmighoul') {
		form = 'gimmighoul-chest';
	}

	if (form === 'gimmighoul-coin') {
		form = 'gimmighoul-roaming';
	}

	if (form === 'koraidon') {
		form = 'koraidon-apex-build';
	}

	if (form === 'koraidon-sprinting') {
		form = 'koraidon-sprinting-build';
	}

	if (form === 'miraidon') {
		form = 'miraidon-ultimate-mode';
	}

	if (form === 'miraidon-drive') {
		form = 'miraidon-drive-mode';
	}

	// * This is just me saying fuck it, PokeAPI kinda fucked these forms tbh
	if (form === 'minior-meteor') {
		form = 'minior-red-meteor';
	}

	if (form === 'minior-core') {
		// * pokemondb uses this form only for the shiny variant,
		// * which applies to all colors, but idc at this point
		form = 'minior-red';
	}

	if (form.startsWith('minior-') && form.endsWith('-core')) {
		const parts = form.split('-');
		parts.pop();

		form = parts.join('-');
	}

	return form;
}

function normalizePlatformName(platform) {
	platform = platform.replace(/-/g, '_');

	if (platform === 'black_white_2') {
		platform = 'black_white';
	}

	if (platform === 'omega_ruby_alpha_sapphire') {
		platform = 'omegaruby_alphasapphire';
	}

	if (platform === 'sun_moon') {
		platform = 'ultra_sun_ultra_moon';
	}

	if (platform === 'sword_shield') {
		platform = 'generation_viii_icons';
	}

	return platform;
}

function platformDisplayName(platform) {
	switch (platform) {
		case 'official_artwork':
			return 'Official Artwork';
		case 'generation_vii_icons':
			return 'Generation VII Icons';
		case 'generation_viii_icons':
			return 'Generation VIII Icons';
		case 'default':
			return 'Default';
		case 'home':
			return 'Pokemon Home';
		case 'red_blue':
			return 'Red / Blue';
		case 'yellow':
			return 'Yellow';
		case 'gold':
			return 'Gold';
		case 'silver':
			return 'Silver';
		case 'crystal':
			return 'Crystal';
		case 'ruby_sapphire':
			return 'Ruby / Sapphire';
		case 'emerald':
			return 'Emerald';
		case 'firered_leafgreen':
			return 'Fire Red / Leaf Green';
		case 'diamond_pearl':
			return 'Diamond / Pearl';
		case 'platinum':
			return 'Platinum';
		case 'heartgold_soulsilver':
			return 'Heart Gold / Soul Silver';
		case 'black_white':
			return 'Black / White';
		case 'x_y':
			return 'X / Y';
		case 'omegaruby_alphasapphire':
			return 'Omega Ruby / Alpha Sapphire';
		case 'ultra_sun_ultra_moon':
			return 'Ultra Sun / Ultra Moon';
		case 'showdown':
			return 'Pokémon Showdown';
		case 'scarlet_violet':
			return 'Scarlet / Violet';
		case 'brilliant_diamond_shining_pearl':
			return 'Brilliant Diamond / Shining Pearl';
		case 'sword_shield':
			return 'Sword / Shield';
		case 'lets_go_pikachu_eevee':
			return 'Let\'s Go Pikachu / Let\'s Go Eevee';
		case 'bank':
			return 'Pokémon Bank';
		case 'go':
			return 'Pokémon GO';
		case 'legends_arceus':
			return 'Legends Arceus';
	}
}

function imageStyle(platform) {
	switch (platform) {
		case 'official_artwork':
			return 'artwork';
		case 'generation_vii_icons':
			return 'pixel_art';
		case 'generation_viii_icons':
			return 'pixel_art';
		case 'default':
			return 'pixel_art';
		case 'home':
			return 'model_render';
		case 'red_blue':
			return 'pixel_art';
		case 'yellow':
			return 'pixel_art';
		case 'gold':
			return 'pixel_art';
		case 'silver':
			return 'pixel_art';
		case 'crystal':
			return 'pixel_art';
		case 'ruby_sapphire':
			return 'pixel_art';
		case 'emerald':
			return 'pixel_art';
		case 'firered_leafgreen':
			return 'pixel_art';
		case 'diamond_pearl':
			return 'pixel_art';
		case 'platinum':
			return 'pixel_art';
		case 'heartgold_soulsilver':
			return 'pixel_art';
		case 'black_white':
			return 'pixel_art';
		case 'x_y':
			return 'model_render';
		case 'omegaruby_alphasapphire':
			return 'model_render';
		case 'ultra_sun_ultra_moon':
			return 'model_render';
		case 'showdown':
			return 'model_render';
		case 'scarlet_violet':
			return 'artwork';
		case 'brilliant_diamond_shining_pearl':
			return 'artwork';
		case 'sword_shield':
			return 'pixel_art';
		case 'lets_go_pikachu_eevee':
			return 'pixel_art';
		case 'bank':
			return 'model_render';
		case 'go':
			return 'model_render';
		case 'legends_arceus':
			return 'model_render';
	}
}

export default async function main(pokeapi) {
	const response = await fetch('https://pokemondb.net/sprites');
	const html = await response.text();
	const dom = new JSDOM(html);
	const document = dom.window.document;
	const spriteLinks = [...document.querySelectorAll('.infocard-list.infocard-list-pkmn-sm .infocard')].map(a => path.join('https://pokemondb.net', a.href));
	const progress = new cliProgress.SingleBar({
		format: 'PokemonDB {bar} | {value}/{total} | {percentage}%'
	}, cliProgress.Presets.shades_classic);

	progress.start(spriteLinks.length);

	for (const spriteLink of spriteLinks) {
		try {
			const response = await fetch(spriteLink);
			const html = await response.text();
			const dom = new JSDOM(html);
			const document = dom.window.document;
			const formLinks = [...document.querySelectorAll('.sprites-table-card')]
				.map((card) => {
					const href = card.querySelector('.sprite-share-link').href;
					const smallTexts = card.querySelectorAll('small.text-muted');
					let displayName = '';

					if (smallTexts.length === 1) {
						displayName = smallTexts.item(0).innerHTML;
					}

					if (smallTexts.length === 2) {
						displayName = smallTexts.item(1).innerHTML;
					}

					if (displayName === 'Male' || displayName === 'Female') {
						displayName = '';
					}

					return {
						url: href,
						display_name: displayName,
						gender: href.endsWith('-f.png') || href.endsWith('-female.png') ? 'female' : 'male'
					};
				})
				.filter(formLink => !formLink.url.includes('/back-'))
				.filter(formLink => !formLink.url.endsWith('.gif'));

			for (const formLink of formLinks) {
				const url = new URL(formLink.url);
				const platform = normalizePlatformName(url.pathname.split('/').filter(part => part)[1]);
				const formName = normalizeFormName(path.basename(url.pathname, path.extname(url.pathname)));
				let pokemon = pokeapi.find(({ name }) => name === formName);

				if (!pokemon) {
					const speciesName = spriteLink.split('/').filter(part => part).pop();
					const speciesDisplayName = document.querySelector('main#main h1').innerHTML.match(/(.*?) sprites/)[1];
					const displayName = `${speciesDisplayName} ${formLink.display_name}`;

					pokemon = {
						species: speciesName,
						species_display_name: speciesDisplayName,
						name: formName,
						display_name: displayName,
						images: []
					};

					pokeapi.push(pokemon);
				}

				// * Just skip these platforms cuz we know we have all the forms
				if (platform === 'red_blue' || platform === 'yellow' || platform === 'gold' || platform === 'silver' || platform === 'crystal') {
					continue;
				}

				const shiny = formLink.url.includes('/shiny/');
				const imageURL = shiny ? `/images/pokemon/${pokemon.name}/${platform}_${formLink.gender}_shiny.png` : `/images/pokemon/${pokemon.name}/${platform}_${formLink.gender}.png`;
				const previewURL = shiny ? `/images/pokemon/${pokemon.name}/${platform}_${formLink.gender}_shiny_preview.png` : `/images/pokemon/${pokemon.name}/${platform}_${formLink.gender}_preview.png`;

				// * Skip if already exists, since this script can make duplicates
				if (pokemon.images.some(({ url }) => url === imageURL)) {
					continue;
				}

				const fileImagePath = path.join(__dirname, '..', 'public', imageURL);
				const filePreviewPath = path.join(__dirname, '..', 'public', previewURL);

				await fs.ensureDir(path.dirname(fileImagePath));

				const response = await fetch(formLink.url);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const writeStream = fs.createWriteStream(fileImagePath);

				await pipeline(response.body, writeStream);

				const image = {
					style: imageStyle(platform),
					platform: platform,
					platform_display_name: platformDisplayName(platform),
					gender: formLink.gender,
					gender_display_name: formLink.gender === 'female' ? 'Female' : 'Male',
					shiny: shiny,
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
			}
		} catch (error) {
			console.log(error);
		} finally {
			progress.increment();
		}
	}

	progress.stop();

	return pokeapi;
}
