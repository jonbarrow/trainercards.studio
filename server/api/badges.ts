import path from 'node:path';
import fs from 'fs-extra';
import type BadgeData from '@/types/badge-data';

const config = useRuntimeConfig();
const filePath = path.join(process.cwd(), 'public', 'metadata', 'badges.json');
const fileContent = fs.readFileSync(filePath, {
	encoding: 'utf8'
});
const badges: BadgeData[] = JSON.parse(fileContent);

if (config.badgeImagesHost) {
	for (const badge of badges) {
		const modifiedURLs: string[] = [];
		for (const image of badge.images) {
			modifiedURLs.push(new URL(image, config.badgeImagesHost).href);
		}

		badge.images = modifiedURLs;
	}
}

export default defineEventHandler(async (_event) => {
	return badges;
});
