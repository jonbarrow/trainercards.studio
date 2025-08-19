import path from 'node:path';
import fs from 'fs-extra';
import type TrainerImage from '@/types/trainer-image';

const config = useRuntimeConfig();
const filePath = path.join(process.cwd(), 'public', 'metadata', 'trainers.json');
const fileContent = fs.readFileSync(filePath, {
	encoding: 'utf8'
});
const trainers: TrainerImage[] = JSON.parse(fileContent);

if (config.trainerImagesHost) {
	for (const trainer of trainers) {
		trainer.image_url = new URL(trainer.image_url, config.trainerImagesHost).href;
		trainer.preview_url = new URL(trainer.preview_url, config.trainerImagesHost).href;
	}
}

export default defineEventHandler(async (_event) => {
	return trainers;
});
