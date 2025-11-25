import { parseGeneration1SaveParty, parseGeneration1SaveHallOfFame } from '@/save-file-parser/generation-1';

// TODO - Remove the "hallOfFame" flag and make a dedicated function
export function parseSave(saveFile: ArrayBuffer, hallOfFame: boolean) {
	const saveFileLength = saveFile.byteLength;

	if (saveFileLength === 0x8000) {
		return {
			platform: 'red_blue', // TODO - Detect Yellow?
			data: hallOfFame ? parseGeneration1SaveHallOfFame(saveFile) : parseGeneration1SaveParty(saveFile)
		};
	}
}
