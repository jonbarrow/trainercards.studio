import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pokemon = fs.readJSONSync(path.join(__dirname, '..', 'public', 'metadata', 'pokemon.json'));
const pokeApiIndex = fs.readJSONSync(path.join(__dirname, '..', 'vendor', 'pokeapi-api-data', 'data', 'api', 'v2', 'pokemon', 'index.json'));

for (const entry of pokemon) {
	if (entry?.id?.pokeapi) {
		for (const { url } of pokeApiIndex.results) {
			if (url.endsWith(`/${entry.id.pokeapi}/`) || url.endsWith(`/${entry.id.pokeapi}/`)) {
				const json = fs.readJSONSync(path.join(__dirname, '..', 'vendor', 'pokeapi-api-data', 'data', url, 'index.json'));
				let types = json.types.sort((a, b) => a.slot - b.slot).map(({ type }) => type.name);

				// * Pure type
				if (types.length !== 2) {
					types = [types[0], types[0]];
				}

				entry.types = types;
			}
		}
	}
}

fs.writeJSONSync(path.join(__dirname, '..', 'public', 'metadata', 'pokemon.json'), pokemon);
