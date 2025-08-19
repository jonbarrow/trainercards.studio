import path from 'node:path';
import fs from 'fs-extra';
import type BadgeData from '@/types/badge-data';

const filePath = path.join(process.cwd(), 'public', 'metadata', 'badges.json');
const fileContent = fs.readFileSync(filePath, {
	encoding: 'utf8'
});
const badges: BadgeData[] = JSON.parse(fileContent);
const customHost = process.env.TCS_IMAGE_HOST || process.env.TCS_BADGE_IMAGE_HOST;

if (customHost) {
	for (const badge of badges) {
		const modifiedURLs: string[] = [];
		for (const image of badge.images) {
			modifiedURLs.push(new URL(image, customHost).href);
		}

		badge.images = modifiedURLs;
	}
}

export default defineEventHandler(async (_event) => {
	return badges;
});
