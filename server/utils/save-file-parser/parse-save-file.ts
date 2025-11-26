import SaveFileType from '@/types/save-file-type';

// TODO - Remove the "hallOfFame" flag and make a dedicated function
export function parseSaveFile(saveFile: Buffer, hallOfFame: boolean) {
	const saveFileType = detectSaveFileType(saveFile);

	if (saveFileType === SaveFileType.RedBlueGreenINT || saveFileType === SaveFileType.RedBlueGreenJPN) {
		return {
			platform: 'red_blue',
			data: hallOfFame ? parseGeneration1SaveHallOfFame(saveFile) : parseGeneration1SaveParty(saveFile)
		};
	}

	if (saveFileType === SaveFileType.YellowINT || saveFileType === SaveFileType.YellowJPN) {
		return {
			platform: 'yellow',
			data: hallOfFame ? parseGeneration1SaveHallOfFame(saveFile) : parseGeneration1SaveParty(saveFile)
		};
	}

	if (saveFileType === SaveFileType.GoldSilverINT) {
		return {
			platform: 'gold', // TODO - Detect silver specifically?
			data: hallOfFame ? parseGeneration2SaveHallOfFame(saveFile) : parseGeneration2SaveParty(saveFile)
		};
	}

	if (saveFileType === SaveFileType.CrystalINT) {
		return {
			platform: 'crystal',
			data: hallOfFame ? parseGeneration2SaveHallOfFame(saveFile) : parseGeneration2SaveParty(saveFile)
		};
	}
}
