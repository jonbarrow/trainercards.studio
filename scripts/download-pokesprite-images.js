import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import sharp from 'sharp';
import cliProgress from 'cli-progress';
import getImageDimensions from './get-image-dimensions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pokesprites = fs.readJSONSync(`${__dirname}/../vendor/msikma-pokesprite/data/pokemon.json`);

// TODO - This skips any forms that PokeAPI has NOT added support for. Add these forms. See https://github.com/msikma/pokesprite/issues/143 for details

export default async function main(pokeapi) {
	const progress = new cliProgress.SingleBar({
		format: 'PokeSprite {bar} | {value}/{total} | {percentage}%'
	}, cliProgress.Presets.shades_classic);

	progress.start(Object.keys(pokesprites).length);

	for (const dexNumber in pokesprites) {
		try {
			const pokespriteEntry = pokesprites[dexNumber];
			const slugBase = pokespriteEntry.slug.eng;
			const forms = [];

			for (const formName in pokespriteEntry['gen-7'].forms) {
				const form = pokespriteEntry['gen-7'].forms[formName];
				let slug = slugBase;
				if (formName !== '$') {
					slug = `${slug}-${formName}`;
				}

				forms.push({
					generation: 7,
					name: slug,
					variants: form
				});
			}

			for (const formName in pokespriteEntry['gen-8'].forms) {
				const form = pokespriteEntry['gen-8'].forms[formName];
				let slug = slugBase;
				if (formName !== '$') {
					slug = `${slug}-${formName}`;
				}

				forms.push({
					generation: 8,
					name: slug,
					variants: form
				});
			}

			for (const pokemon of pokeapi) {
				for (const form of forms) {
					if (form.name === pokemon.name) {
						const generation = form.generation === 7 ? 'gen7x' : 'gen8';
						const basePath = path.join(__dirname, '..', 'vendor', 'msikma-pokesprite', `pokemon-${generation}`);
						const images = [
							{
								style: 'pixel_art',
								platform: 'msikma_pokesprite',
								platform_display_name: form.generation === 7 ? 'PokeSprite Generation VII' : 'PokeSprite Generation VIII',
								gender: 'male',
								gender_display_name: 'Male',
								shiny: true,
								creator: 'PokeSprite',
								creator_url: 'https://github.com/msikma/pokesprite',
								url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_male_shiny.png`,
								preview_url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_male_shiny_preview.png`
							}
						];

						if (form.variants.is_unofficial_icon) {
							images.push({
								style: 'pixel_art',
								platform: 'msikma_pokesprite',
								platform_display_name: form.generation === 7 ? 'PokeSprite Generation VII' : 'PokeSprite Generation VIII',
								gender: 'male',
								gender_display_name: 'Male',
								shiny: false,
								creator: 'PokeSprite',
								creator_url: 'https://github.com/msikma/pokesprite',
								url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_male.png`,
								preview_url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_male_preview.png`
							});
						}

						if (form.variants.has_female || form.variants.has_unofficial_female_icon) {
							images.push({
								style: 'pixel_art',
								platform: 'msikma_pokesprite',
								platform_display_name: form.generation === 7 ? 'PokeSprite Generation VII' : 'PokeSprite Generation VIII',
								gender: 'female',
								gender_display_name: 'Female',
								shiny: true,
								creator: 'PokeSprite',
								creator_url: 'https://github.com/msikma/pokesprite',
								url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_female_shiny.png`,
								preview_url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_female_shiny_preview.png`
							});
						}

						if (form.variants.has_unofficial_female_icon) {
							images.push({
								style: 'pixel_art',
								platform: 'msikma_pokesprite',
								platform_display_name: form.generation === 7 ? 'PokeSprite Generation VII' : 'PokeSprite Generation VIII',
								gender: 'female',
								gender_display_name: 'Female',
								shiny: false,
								creator: 'PokeSprite',
								creator_url: 'https://github.com/msikma/pokesprite',
								url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_female.png`,
								preview_url: `/images/pokemon/${pokemon.name}/msikma_pokesprite_${generation}_female_preview.png`
							});
						}

						for (const image of images) {
							// * Skip if already exists, since this script can make duplicates
							if (pokemon.images.some(({ url }) => url === image.url)) {
								continue;
							}

							const paths = [
								basePath
							];

							if (image.shiny) {
								paths.push('shiny');
							} else {
								paths.push('regular');
							}

							if (image.gender === 'female') {
								paths.push('female');
							}

							paths.push(`${form.name}.png`);

							const spritePath = path.join(...paths);
							const outPath = path.join(__dirname, '..', 'public', 'images', 'pokemon', pokemon.name, path.basename(image.url));
							const outPreviewPath = path.join(__dirname, '..', 'public', 'images', 'pokemon', pokemon.name, path.basename(image.preview_url));

							// * Skip bad paths. I'm lazy
							if (!fs.existsSync(spritePath)) {
								continue;
							}

							await fs.copyFile(spritePath, outPath);

							image.dimensions = await getImageDimensions(outPath);

							await sharp(outPath).extract({
								left: image.dimensions.padding.left,
								top: image.dimensions.padding.top,
								width: image.dimensions.content.width,
								height: image.dimensions.content.height
							}).png().toFile(outPreviewPath);

							pokemon.images.push(image);
						}
					}
				}
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
