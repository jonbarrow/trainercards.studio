import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import fs from 'fs-extra';
import sharp from 'sharp';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildPokemonImages(pokemon, form) {
	// * PokeAPI only exposes all image URLs for the default forms of Pokemon. Alternate forms
	// * only expose the "default" sprites, but not for other platforms, despite the images
	// * being present in the GitHub repo. This means we have to hand-craft the URLs and
	// * just hope for the best. This might require special cases in the future if not all
	// * Pokemon work with this implementation
	// *
	// * See https://github.com/PokeAPI/pokeapi/issues/1281 for details
	const fileName = form.is_default ? `${pokemon.id}` : `${pokemon.id}-${form.form_name}`;

	return [
		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/${fileName}.png` },
		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'default', platform_display_name: 'Default', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/shiny/female/${fileName}.png` },

		{ style: 'artwork', platform: 'dream_world', platform_display_name: 'Dream World', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/dream-world/${fileName}.svg` },
		{ style: 'artwork', platform: 'dream_world', platform_display_name: 'Dream World', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/dream-world/female/${fileName}.svg` },

		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/${fileName}.png` },
		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/female/${fileName}.png` },
		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'home', platform_display_name: 'Pokemon Home', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/home/shiny/female/${fileName}.png` },

		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/${fileName}.png` },
		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/female/${fileName}.png` },
		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/shiny/${fileName}.png` },
		{ style: 'artwork', platform: 'official_artwork', platform_display_name: 'Official Artwork', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/other/official-artwork/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'red_blue', platform_display_name: 'Red / Blue', gender: 'male', gender_display_name: 'Male', shiny: false, gray: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/red-blue/gray/${fileName}.png` },
		{ style: 'pixel_art', platform: 'red_blue', platform_display_name: 'Red / Blue', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/red-blue/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'yellow', platform_display_name: 'Yellow', gender: 'male', gender_display_name: 'Male', shiny: false, gray: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/yellow/gray/${fileName}.png` },
		{ style: 'pixel_art', platform: 'yellow', platform_display_name: 'Yellow', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-i/yellow/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'crystal', platform_display_name: 'Crystal', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/crystal/transparent/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'crystal', platform_display_name: 'Crystal', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/crystal/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'gold', platform_display_name: 'Gold', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/gold/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'gold', platform_display_name: 'Gold', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/gold/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'silver', platform_display_name: 'Silver', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/silver/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'silver', platform_display_name: 'Silver', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-ii/silver/transparent/${fileName}.png` },

		{ style: 'pixel_art', platform: 'emerald', platform_display_name: 'Emerald', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/emerald/${fileName}.png` },
		{ style: 'pixel_art', platform: 'emerald', platform_display_name: 'Emerald', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/emerald/shiny/${fileName}.png` },

		{ style: 'pixel_art', platform: 'firered_leafgreen', platform_display_name: 'Fire Red / Leaf Green', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/firered-leafgreen/${fileName}.png` },
		{ style: 'pixel_art', platform: 'firered_leafgreen', platform_display_name: 'Fire Red / Leaf Green', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/firered-leafgreen/shiny/${fileName}.png` },

		{ style: 'pixel_art', platform: 'ruby_sapphire', platform_display_name: 'Ruby / Sapphire', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/ruby-sapphire/${fileName}.png` },
		{ style: 'pixel_art', platform: 'ruby_sapphire', platform_display_name: 'Ruby / Sapphire', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iii/ruby-sapphire/shiny/${fileName}.png` },

		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/${fileName}.png` },
		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'diamond_pearl', platform_display_name: 'Diamond / Pearl', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/${fileName}.png` },
		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'heartgold_soulsilver', platform_display_name: 'Heart Gold / Soul Silver', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/${fileName}.png` },
		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'platinum', platform_display_name: 'Platinum', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-iv/platinum/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/${fileName}.png` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/female/${fileName}.png` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/shiny/${fileName}.png` },
		{ style: 'pixel_art', platform: 'black_white', platform_display_name: 'Black / White', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/shiny/female/${fileName}.png` },

		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/${fileName}.png` },
		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/female/${fileName}.png` },
		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'omegaruby_alphasapphire', platform_display_name: 'Omega Ruby / Alpha Sapphire', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/shiny/female/${fileName}.png` },

		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/${fileName}.png` },
		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/female/${fileName}.png` },
		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'x_y', platform_display_name: 'X / Y', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vi/x-y/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'generation_vii_icons', platform_display_name: 'Generation VII Icons', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/icons/${fileName}.png` },
		{ style: 'pixel_art', platform: 'generation_vii_icons', platform_display_name: 'Generation VII Icons', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/icons/female/${fileName}.png` },

		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/${fileName}.png` },
		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/female/${fileName}.png` },
		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'male', gender_display_name: 'Male', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/shiny/${fileName}.png` },
		{ style: 'model_render', platform: 'ultra_sun_ultra_moon', platform_display_name: 'Ultra Sun / Ultra Moon', gender: 'female', gender_display_name: 'Female', shiny: true, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/shiny/female/${fileName}.png` },

		{ style: 'pixel_art', platform: 'generation_viii_icons', platform_display_name: 'Generation VIII Icons', gender: 'male', gender_display_name: 'Male', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-viii/icons/${fileName}.png` },
		{ style: 'pixel_art', platform: 'generation_viii_icons', platform_display_name: 'Generation VIII Icons', gender: 'female', gender_display_name: 'Female', shiny: false, path: `${__dirname}/../vendor/pokeapi-sprites/sprites/pokemon/versions/generation-viii/icons/female/${fileName}.png` }
	];
}

async function main() {
	const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
	const pokemonData = [];

	for (const { url } of response.data.results) {
		try {
			const { data: pokemon } = await axios.get(url);
			const { data: species } = await axios.get(pokemon.species.url);
			const speciesTranslation = species.names.find(translation => translation.language.name === 'en');

			for (const formData of pokemon.forms) {
				const formURL = formData.url;
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

					const localPreviewPath = `${localPath}_preview.${extension}`;
					localPath = `${localPath}.${extension}`;

					await fs.ensureDir(path.dirname(`${__dirname}/../public${localPath}`));
					await fs.copyFile(image.path, `${__dirname}/../public${localPath}`);

					image.creator = 'GameFreak';
					image.url = localPath;
					image.dimensions = await getImageDimensions(`${__dirname}/../public${localPath}`);

					// * SVGs don't play nice with this, so fuck 'em
					if (extension !== 'svg') {
						await sharp(`${__dirname}/../public${localPath}`).extract({
							left: image.dimensions.padding.left,
							top: image.dimensions.padding.top,
							width: image.dimensions.content.width,
							height: image.dimensions.content.height
						}).png().toFile(`${__dirname}/../public${localPreviewPath}`);

						image.preview_url = localPreviewPath;
					} else {
						image.preview_url = image.url;
					}

					delete image.path;
					delete image.gray;
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
			break;
		}
	}

	await fs.ensureDir(`${__dirname}/../public/metadata`);
	await fs.writeJSON(`${__dirname}/../public/metadata/pokemon.json`, pokemonData);
}

main();
