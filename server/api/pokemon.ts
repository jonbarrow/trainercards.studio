import path from 'node:path';
import fs from 'fs-extra';
import type Pokemon from '@/types/pokemon';

const filePath = path.join(process.cwd(), 'public', 'metadata', 'pokemon.json');
const fileContent = fs.readFileSync(filePath, {
	encoding: 'utf8'
});
const pokemon: Pokemon[] = JSON.parse(fileContent);
const customHost = process.env.TCS_IMAGE_HOST || process.env.TCS_POKEMON_IMAGE_HOST;

if (customHost) {
	for (const p of pokemon) {
		for (const image of p.images) {
			image.url = new URL(image.url, customHost).href;
			image.preview_url = new URL(image.preview_url, customHost).href;
		}
	}
}

export default defineEventHandler(async (_event) => {
	return pokemon;
});
