import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pokemon = fs.readJSONSync(`${__dirname}/../public/metadata/pokemon.json`);
const trainers = fs.readJSONSync(`${__dirname}/../public/metadata/trainers.json`);

const totalPokemonImages = pokemon.reduce((total, pokemonObj) => {
	return total + (pokemonObj.images ? pokemonObj.images.length : 0);
}, 0);
const totalTrainers = trainers.length;

console.log({
	pokemon: totalPokemonImages,
	trainers: totalTrainers
});
