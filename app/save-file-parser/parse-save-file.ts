import { validateGeneration1SaveChecksum, parseGeneration1SaveParty, parseGeneration1SaveHallOfFame } from '@/save-file-parser/generation-1';
import {
	validateGeneration2SaveChecksums, validateGoldSilverSaveChecksum, validateCrystalSaveChecksum,
	parseGeneration2SaveParty, parseGeneration2SaveHallOfFame
} from '@/save-file-parser/generation-2';

// TODO - Remove the "hallOfFame" flag and make a dedicated function
export function parseSave(saveFile: ArrayBuffer, hallOfFame: boolean) {
	const saveFileLength = saveFile.byteLength;

	if (saveFileLength === 0x8000) {
		// * Generation 2 saves are also 0x8000 on original hardware
		const isGeneration1 = validateGeneration1SaveChecksum(saveFile);
		const isGeneration2 = validateGeneration2SaveChecksums(saveFile);

		if (isGeneration1 && !isGeneration2) {
			return {
				platform: 'red_blue', // TODO - Detect Yellow?
				data: hallOfFame ? parseGeneration1SaveHallOfFame(saveFile) : parseGeneration1SaveParty(saveFile)
			};
		}
	}

	// * Original hardware saves are 0x8000, matching generation 1
	// * Gold, Silver, and Crystal VC saves are 0x8010 bytes
	// * Saves from unofficial emulators seem to be 0x8030?
	// TODO - Generation 2 saves have a lot of differences between versions and languages, currently only English is officially supported
	if (saveFileLength === 0x8000 || saveFileLength === 0x8010 || saveFileLength === 0x8030) {
		const isGoldSilver = validateGoldSilverSaveChecksum(saveFile);
		const isCrystal = validateCrystalSaveChecksum(saveFile);

		if (isGoldSilver && !isCrystal) {
			return {
				platform: 'gold', // TODO - Detect silver?
				data: hallOfFame ? parseGeneration2SaveHallOfFame(saveFile) : parseGeneration2SaveParty(saveFile)
			};
		}

		if (isCrystal && !isGoldSilver) {
			return {
				platform: 'crystal',
				data: hallOfFame ? parseGeneration2SaveHallOfFame(saveFile) : parseGeneration2SaveParty(saveFile)
			};
		}
	}
}
