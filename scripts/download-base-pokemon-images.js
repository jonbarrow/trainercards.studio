import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import fs from 'fs-extra';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
	const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
	const pokemonData = [];

	for (const { url } of response.data.results) {
		try {
			const { data: pokemon } = await axios.get(url);
			const formURL = pokemon.forms[0].url;
			const speciesURL = pokemon.species.url;

			const { data: form } = await axios.get(formURL);
			const { data: species } = await axios.get(speciesURL);

			const speciesTranslation = species.names.find(translation => translation.language.name === 'en');
			let displayName = speciesTranslation.name;

			if (form.form_names.length !== 0) {
				// * Handle some edge cases like https://pokeapi.co/api/v2/pokemon-form/10195/
				// * where the form doesn't have an English translation in `form_names`
				let formTranslation = form.form_names.find(translation => translation.language.name === 'en');
				if (!formTranslation) {
					formTranslation = form.names.find(translation => translation.language.name === 'en');
				}

				if (formTranslation) {
					displayName = formTranslation.name;
				}
			}

			const sprites = pokemon.sprites;
			const images = [];

			if (sprites.front_default) {
				images.push({ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.front_default });
			}
			if (sprites.front_female) {
				images.push({ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.front_female });
			}
			if (sprites.front_shiny) {
				images.push({ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.front_shiny });
			}
			if (sprites.front_shiny_female) {
				images.push({ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.front_shiny_female });
			}

			if (sprites.other.dream_world.front_default) {
				images.push({ style: 'artwork', platform: 'dream_world', platform_display_name: 'Dream World', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.other.dream_world.front_default });
			}
			if (sprites.other.dream_world.front_female) {
				images.push({ style: 'artwork', platform: 'dream_world', platform_display_name: 'Dream World', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.other.dream_world.front_female });
			}

			if (sprites.other.home.front_default) {
				images.push({ style: 'model_render', platform: 'home', platform_display_name: 'Home', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.other.home.front_default });
			}
			if (sprites.other.home.front_female) {
				images.push({ style: 'model_render', platform: 'home', platform_display_name: 'Home', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.other.home.front_female });
			}
			if (sprites.other.home.front_shiny) {
				images.push({ style: 'model_render', platform: 'home', platform_display_name: 'Home', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.other.home.front_shiny });
			}
			if (sprites.other.home.front_shiny_female) {
				images.push({ style: 'model_render', platform: 'home', platform_display_name: 'Home', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.other.home.front_shiny_female });
			}

			if (sprites.other['official-artwork'].front_default) {
				images.push({ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.other['official-artwork'].front_default });
			}
			if (sprites.other['official-artwork'].front_shiny) {
				images.push({ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'male', gender_display_name: 'male', shiny: true, url: sprites.other['official-artwork'].front_shiny });
			}

			if (sprites.versions['generation-i']['red-blue'].front_transparent) {
				images.push({ style: 'pixel_art', platform: 'red_blue', platform_display_name: 'Red / Blue', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-i']['red-blue'].front_transparent });
			}
			if (sprites.versions['generation-i']['red-blue'].front_gray) {
				images.push({ style: 'pixel_art', platform: 'red_blue_gray', platform_display_name: 'Red / Blue (Gray)', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-i']['red-blue'].front_gray });
			}

			if (sprites.versions['generation-i'].yellow.front_transparent) {
				images.push({ style: 'pixel_art', platform: 'yellow', platform_display_name: 'Yellow', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-i'].yellow.front_transparent });
			}
			if (sprites.versions['generation-i'].yellow.front_gray) {
				images.push({ style: 'pixel_art', platform: 'yellow_gray', platform_display_name: 'Yellow (Gray)', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-i'].yellow.front_gray });
			}

			if (sprites.versions['generation-ii'].gold.front_transparent) {
				images.push({ style: 'pixel_art', platform: 'gold', platform_display_name: 'Gold', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-ii'].gold.front_transparent });
			}
			if (sprites.versions['generation-ii'].gold.front_shiny_transparent || sprites.versions['generation-ii'].gold.front_shiny) {
				images.push({ style: 'pixel_art', platform: 'gold', platform_display_name: 'Gold', gender: 'male', gender_display_name: 'male', shiny: true, url: sprites.versions['generation-ii'].gold.front_shiny_transparent || sprites.versions['generation-ii'].gold.front_shiny });
			}

			if (sprites.versions['generation-ii'].silver.front_transparent) {
				images.push({ style: 'pixel_art', platform: 'silver', platform_display_name: 'Silver', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-ii'].silver.front_transparent });
			}
			if (sprites.versions['generation-ii'].silver.front_shiny_transparent || sprites.versions['generation-ii'].silver.front_shiny) {
				images.push({ style: 'pixel_art', platform: 'silver', platform_display_name: 'Silver', gender: 'male', gender_display_name: 'male', shiny: true, url: sprites.versions['generation-ii'].silver.front_shiny_transparent || sprites.versions['generation-ii'].silver.front_shiny });
			}

			if (sprites.versions['generation-ii'].crystal.front_transparent) {
				images.push({ style: 'pixel_art', platform: 'crystal', platform_display_name: 'Crystal', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-ii'].crystal.front_transparent });
			}
			if (sprites.versions['generation-ii'].crystal.front_shiny_transparent || sprites.versions['generation-ii'].crystal.front_shiny) {
				images.push({ style: 'pixel_art', platform: 'crystal', platform_display_name: 'Crystal', gender: 'male', gender_display_name: 'male', shiny: true, url: sprites.versions['generation-ii'].crystal.front_shiny_transparent || sprites.versions['generation-ii'].crystal.front_shiny });
			}

			if (sprites.versions['generation-iii']['ruby-sapphire'].front_default) {
				images.push({ style: 'pixel_art', platform: 'ruby_sapphire', platform_display_name: 'Ruby / Sapphire', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-iii']['ruby-sapphire'].front_default });
			}
			if (sprites.versions['generation-iii']['ruby-sapphire'].front_shiny) {
				images.push({ style: 'pixel_art', platform: 'ruby_sapphire', platform_display_name: 'Ruby / Sapphire', gender: 'male', gender_display_name: 'male', shiny: true, url: sprites.versions['generation-iii']['ruby-sapphire'].front_shiny });
			}

			if (sprites.versions['generation-iii'].emerald.front_default) {
				images.push({ style: 'pixel_art', platform: 'emerald', platform_display_name: 'Emerald', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-iii'].emerald.front_default });
			}
			if (sprites.versions['generation-iii'].emerald.front_shiny) {
				images.push({ style: 'pixel_art', platform: 'emerald', platform_display_name: 'Emerald', gender: 'male', gender_display_name: 'male', shiny: true, url: sprites.versions['generation-iii'].emerald.front_shiny });
			}

			if (sprites.versions['generation-iii']['firered-leafgreen'].front_default) {
				images.push({ style: 'pixel_art', platform: 'firered_leafgreen', platform_display_name: 'FireRed / LeafGreen', gender: 'male', gender_display_name: 'male', shiny: false, url: sprites.versions['generation-iii']['firered-leafgreen'].front_default });
			}
			if (sprites.versions['generation-iii']['firered-leafgreen'].front_shiny) {
				images.push({ style: 'pixel_art', platform: 'firered_leafgreen', platform_display_name: 'FireRed / LeafGreen', gender: 'male', gender_display_name: 'male', shiny: true, url: sprites.versions['generation-iii']['firered-leafgreen'].front_shiny });
			}

			if (sprites.versions['generation-iv']['diamond-pearl'].front_default) {
				images.push({ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.versions['generation-iv']['diamond-pearl'].front_default });
			}
			if (sprites.versions['generation-iv']['diamond-pearl'].front_female) {
				images.push({ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.versions['generation-iv']['diamond-pearl'].front_female });
			}
			if (sprites.versions['generation-iv']['diamond-pearl'].front_shiny) {
				images.push({ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.versions['generation-iv']['diamond-pearl'].front_shiny });
			}
			if (sprites.versions['generation-iv']['diamond-pearl'].front_shiny_female) {
				images.push({ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.versions['generation-iv']['diamond-pearl'].front_shiny_female });
			}

			if (sprites.versions['generation-iv'].platinum.front_default) {
				images.push({ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.versions['generation-iv'].platinum.front_default });
			}
			if (sprites.versions['generation-iv'].platinum.front_female) {
				images.push({ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.versions['generation-iv'].platinum.front_female });
			}
			if (sprites.versions['generation-iv'].platinum.front_shiny) {
				images.push({ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.versions['generation-iv'].platinum.front_shiny });
			}
			if (sprites.versions['generation-iv'].platinum.front_shiny_female) {
				images.push({ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.versions['generation-iv'].platinum.front_shiny_female });
			}

			if (sprites.versions['generation-iv']['heartgold-soulsilver'].front_default) {
				images.push({ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'HeartGold / SoulSilver', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.versions['generation-iv']['heartgold-soulsilver'].front_default });
			}
			if (sprites.versions['generation-iv']['heartgold-soulsilver'].front_female) {
				images.push({ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'HeartGold / SoulSilver', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.versions['generation-iv']['heartgold-soulsilver'].front_female });
			}
			if (sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny) {
				images.push({ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'HeartGold / SoulSilver', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny });
			}
			if (sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny_female) {
				images.push({ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'HeartGold / SoulSilver', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny_female });
			}

			if (sprites.versions['generation-v']['black-white'].front_default) {
				images.push({ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.versions['generation-v']['black-white'].front_default });
			}
			if (sprites.versions['generation-v']['black-white'].front_female) {
				images.push({ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.versions['generation-v']['black-white'].front_female });
			}
			if (sprites.versions['generation-v']['black-white'].front_shiny) {
				images.push({ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.versions['generation-v']['black-white'].front_shiny });
			}
			if (sprites.versions['generation-v']['black-white'].front_shiny_female) {
				images.push({ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.versions['generation-v']['black-white'].front_shiny_female });
			}

			if (sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_default) {
				images.push({ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_default });
			}
			if (sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_female) {
				images.push({ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_female });
			}
			if (sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_shiny) {
				images.push({ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_shiny });
			}
			if (sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_shiny_female) {
				images.push({ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_shiny_female });
			}

			if (sprites.versions['generation-vi']['x-y'].front_default) {
				images.push({ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.versions['generation-vi']['x-y'].front_default });
			}
			if (sprites.versions['generation-vi']['x-y'].front_female) {
				images.push({ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.versions['generation-vi']['x-y'].front_female });
			}
			if (sprites.versions['generation-vi']['x-y'].front_shiny) {
				images.push({ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.versions['generation-vi']['x-y'].front_shiny });
			}
			if (sprites.versions['generation-vi']['x-y'].front_shiny_female) {
				images.push({ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.versions['generation-vi']['x-y'].front_shiny_female });
			}

			if (sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_default) {
				images.push({ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'male', gender_display_name: 'Male', shiny: false, url: sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_default });
			}
			if (sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_female) {
				images.push({ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'female', gender_display_name: 'Female', shiny: false, url: sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_female });
			}
			if (sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_shiny) {
				images.push({ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'male', gender_display_name: 'Male', shiny: true, url: sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_shiny });
			}
			if (sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_shiny_female) {
				images.push({ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'female', gender_display_name: 'Female', shiny: true, url: sprites.versions['generation-vii']['ultra-sun-ultra-moon'].front_shiny_female });
			}

			for (const image of images) {
				const url = image.url;
				const extension = url.split('/').pop().split('.').pop();
				let localPath = `/images/pokemon/${pokemon.name}/${image.platform}_${image.gender}.${extension}`;
				if (image.shiny) {
					localPath = `/images/pokemon/${pokemon.name}/${image.platform}_${image.gender}_shiny.${extension}`;
				}

				await downloadImage(url, `${__dirname}/../public/${localPath}`);

				image.url = localPath;
				image.dimensions = await getImageDimensions(`${__dirname}/../public/${localPath}`);
			}

			pokemonData.push({
				name: pokemon.name,
				display_name: displayName,
				images
			});
		} catch (error) {
			console.log(error);
			console.log(url);
			break;
		}
	}

	fs.ensureDirSync(`${__dirname}/../public/metadata`);
	fs.writeJSONSync(`${__dirname}/../public/metadata/pokemon.json`, pokemonData);
}

main();
