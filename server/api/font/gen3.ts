import path from 'node:path';
import fs from 'fs-extra';
import type FontCharacterImage from '@/types/font-character-image';

const config = useRuntimeConfig();
const filePath = path.join(process.cwd(), 'public', 'metadata', 'fonts', 'gen3.json');
const fileContent = fs.readFileSync(filePath, {
	encoding: 'utf8'
});
const font: FontCharacterImage[] = JSON.parse(fileContent);

if (config.fontImagesHost) {
	for (const character of font) {
		character.url = new URL(character.url, config.fontImagesHost).href;
	}
}

export default defineEventHandler(async (_event) => {
	return font;
});
