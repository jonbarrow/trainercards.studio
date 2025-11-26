import SaveFileType from '@/types/save-file-type';

// * Credit to https://github.com/kwsch/PKHeX/blob/master/PKHeX.Core/Saves/Util/SaveUtil.cs
// * for the detection logic
// TODO - Break this out into save file classes?

export function detectSaveFileType(saveFile: Buffer): SaveFileType {
	const saveFileLength = saveFile.length;

	// * Original hardware saves are 0x8000
	// * Gold, Silver, and Crystal VC saves are 0x8010 bytes
	// * Gold, Silver, and Crystal VC saves from unofficial emulators seem to be 0x8030?
	if (saveFileLength === 0x8000 || saveFileLength === 0x8010 || saveFileLength === 0x8030) {
		return detectSaveFileTypeGeneration1Or2(saveFile);
	}

	if (saveFileLength === 0x20000) {
		return detectSaveFileTypeGeneration3(saveFile);
	}

	return SaveFileType.Unknown;
}

function detectSaveFileTypeGeneration1Or2(saveFile: Buffer): SaveFileType {
	if (isYellowJPN(saveFile)) {
		return SaveFileType.YellowJPN;
	}

	if (isYellowINT(saveFile)) {
		return SaveFileType.YellowINT;
	}

	if (isRedBlueGreenJPN(saveFile)) {
		return SaveFileType.RedBlueGreenJPN;
	}

	if (isRedBlueGreenINT(saveFile)) {
		return SaveFileType.RedBlueGreenINT;
	}

	if (isGoldSilverJPN(saveFile)) {
		return SaveFileType.GoldSilverJPN;
	}

	if (isGoldSilverKOR(saveFile)) {
		return SaveFileType.GoldSilverKOR;
	}

	if (isGoldSilverINT(saveFile)) {
		return SaveFileType.GoldSilverINT;
	}

	if (isCrystalJPN(saveFile)) {
		return SaveFileType.CrystalJPN;
	}

	if (isCrystalINT(saveFile)) {
		return SaveFileType.CrystalINT;
	}

	return SaveFileType.Unknown;
}

function detectSaveFileTypeGeneration3(saveFile: Buffer): SaveFileType {
	if (isRubySapphire(saveFile)) {
		return SaveFileType.RubySapphire;
	}

	if (isEmerald(saveFile)) {
		return SaveFileType.Emerald;
	}

	if (isFireRedLeafGreen(saveFile)) {
		return SaveFileType.FireRedLeafGreen;
	}

	return SaveFileType.Unknown;
}

function validateListGeneration1Or2(data: Buffer, offset1: number, offset2: number, maxCount: number): boolean {
	return isValidListGeneration1Or2(data, offset1, maxCount) && isValidListGeneration1Or2(data, offset2, maxCount);
}

function isValidListGeneration1Or2(data: Buffer, offset: number, maxCount: number): boolean {
	const count = data[offset];
	return count <= maxCount && data[offset + 1 + count] === 0xFF;
}

function isRedBlueGreenJPN(saveFile: Buffer): boolean {
	return validateListGeneration1Or2(saveFile, 0x2F2C, 0x30C0, 20);
}

function isRedBlueGreenINT(saveFile: Buffer): boolean {
	return validateListGeneration1Or2(saveFile, 0x2ED5, 0x302D, 30);
}

function isYellowJPN(saveFile: Buffer): boolean {
	const starterOffset = 0x29B9;
	const friendshipOffset = 0x2712;

	return saveFile[starterOffset] === 0x54 || saveFile[friendshipOffset] !== 0;
}

function isYellowINT(saveFile: Buffer): boolean {
	const starterOffset = 0x29C3;
	const friendshipOffset = 0x271C;

	return saveFile[starterOffset] === 0x54 || saveFile[friendshipOffset] !== 0;
}

function isGoldSilverJPN(saveFile: Buffer): boolean {
	return validateListGeneration1Or2(saveFile, 0x2D10, 0x283E, 30);
}

function isGoldSilverKOR(saveFile: Buffer): boolean {
	return validateListGeneration1Or2(saveFile, 0x2DAE, 0x28CC, 20);
}

function isGoldSilverINT(saveFile: Buffer): boolean {
	return validateListGeneration1Or2(saveFile, 0x288A, 0x2D6C, 20);
}

function isCrystalJPN(saveFile: Buffer): boolean {
	return validateListGeneration1Or2(saveFile, 0x2D10, 0x281A, 30);
}

function isCrystalINT(saveFile: Buffer): boolean {
	return validateListGeneration1Or2(saveFile, 0x2865, 0x2D10, 20);
}

function hasGeneration3GBAExtendedData(data: Buffer): boolean {
	const remainder = data.subarray(0x890, 0xF2C);

	for (let i = 0; i < remainder.length; i++) {
		if (remainder[i] !== 0) {
			return true;
		}
	}

	return false;
}

function isRubySapphire(data: Buffer): boolean {
	return data.readUInt32LE(0xAC) !== 1 && !hasGeneration3GBAExtendedData(data);
}

function isEmerald(data: Buffer): boolean {
	return data.readUInt32LE(0xAC) !== 1 && hasGeneration3GBAExtendedData(data);
}

function isFireRedLeafGreen(data: Buffer): boolean {
	return data.readUInt32LE(0xAC) === 1;
}
