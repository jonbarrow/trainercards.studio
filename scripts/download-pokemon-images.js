import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import downloadBaseImages from './download-base-pokemon-images.js';
import downloadPokeSpriteImages from './download-pokesprite-images.js';
import downloadBluemoonFallsImages from './download-bluemoonfalls-images.js';
import downloadPokemonDBImages from './download-pokemondb-images.js';
import downloadPokemonSleepImages from './download-pokemon-sleep-images.js';
import downloadPokemonLinkBattleImages from './download-pokemon-link-battle-images.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	let pokemonData = await downloadBaseImages();
	pokemonData = await downloadPokeSpriteImages(pokemonData);
	pokemonData = await downloadBluemoonFallsImages(pokemonData);
	pokemonData = await downloadPokemonDBImages(pokemonData);
	pokemonData = await downloadPokemonSleepImages(pokemonData);
	pokemonData = await downloadPokemonLinkBattleImages(pokemonData);

	await fs.ensureDir(`${__dirname}/../public/metadata`);
	await fs.writeJSON(`${__dirname}/../public/metadata/pokemon.json`, pokemonData);
}

main();
