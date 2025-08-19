import path from 'node:path';
import fs from 'fs-extra';
import type Pokemon from '@/types/pokemon';

const config = useRuntimeConfig();
const filePath = path.join(process.cwd(), 'public', 'metadata', 'pokemon.json');
const fileContent = fs.readFileSync(filePath, {
	encoding: 'utf8'
});
const pokemon: Pokemon[] = JSON.parse(fileContent);

if (config.pokemonImagesHost) {
	for (const p of pokemon) {
		for (const image of p.images) {
			image.url = new URL(image.url, config.pokemonImagesHost).href;
			image.preview_url = new URL(image.preview_url, config.pokemonImagesHost).href;
		}
	}
}

export default defineEventHandler(async (_event) => {
	return pokemon;
});
