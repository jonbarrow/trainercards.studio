import StreamIn from '@/save-file-parser/stream-in';

// * https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_II)

type PokemonSpecies = {
	dex: number;
	name: string;
};

type PartyPokemon = {
	index: number;
	dex: number;
	name: string;
	nickname: string;
};

// * Taken from the generation 1 parser, seems to work well enough
// * Currently only supports the English text encoding. Will probably work
// * in other languages, besides Japanese. Only includes characters the user
// * can input
// * https://bulbapedia.bulbagarden.net/wiki/Character_encoding_(Generation_II)#English
// TODO - Support all languages
const ENGLISH_CHARSET: { [key: number]: string } = {
	0x7F: ' ',
	0x80: 'A',
	0x81: 'B',
	0x82: 'C',
	0x83: 'D',
	0x84: 'E',
	0x85: 'F',
	0x86: 'G',
	0x87: 'H',
	0x88: 'I',
	0x89: 'J',
	0x8A: 'K',
	0x8B: 'L',
	0x8C: 'M',
	0x8D: 'N',
	0x8E: 'O',
	0x8F: 'P',
	0x90: 'Q',
	0x91: 'R',
	0x92: 'S',
	0x93: 'T',
	0x94: 'U',
	0x95: 'V',
	0x96: 'W',
	0x97: 'X',
	0x98: 'Y',
	0x99: 'Z',
	0x9A: '(',
	0x9B: ')',
	0x9C: ':',
	0x9D: ';',
	0x9E: '[',
	0x9F: ']',
	0xA0: 'a',
	0xA1: 'b',
	0xA2: 'c',
	0xA3: 'd',
	0xA4: 'e',
	0xA5: 'f',
	0xA6: 'g',
	0xA7: 'h',
	0xA8: 'i',
	0xA9: 'j',
	0xAA: 'k',
	0xAB: 'l',
	0xAC: 'm',
	0xAD: 'n',
	0xAE: 'o',
	0xAF: 'p',
	0xB0: 'q',
	0xB1: 'r',
	0xB2: 's',
	0xB3: 't',
	0xB4: 'u',
	0xB5: 'v',
	0xB6: 'w',
	0xB7: 'x',
	0xB8: 'y',
	0xB9: 'z',
	0xE1: 'PK',
	0xE2: 'MN',
	0xE3: '-',
	0xE6: '?',
	0xE7: '!',
	0xE8: '.',
	0xEF: '♂',
	0xF1: '×',
	0xF2: '.',
	0xF3: '/',
	0xF4: ',',
	0xF5: '♀',
	0xF6: '0',
	0xF7: '1',
	0xF8: '2',
	0xF9: '3',
	0xFA: '4',
	0xFB: '5',
	0xFC: '6',
	0xFD: '7',
	0xFE: '8',
	0xFF: '9'
};

// * Generation 2 made the indexes match the national dex number
// * https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_index_number_in_Generation_II
const SPECIES_INDEX_MAP: { [key: number]: PokemonSpecies } = {
	1: { dex: 1, name: 'BULBASAUR' },
	2: { dex: 2, name: 'IVYSAUR' },
	3: { dex: 3, name: 'VENUSAUR' },
	4: { dex: 4, name: 'CHARMANDER' },
	5: { dex: 5, name: 'CHARMELEON' },
	6: { dex: 6, name: 'CHARIZARD' },
	7: { dex: 7, name: 'SQUIRTLE' },
	8: { dex: 8, name: 'WARTORTLE' },
	9: { dex: 9, name: 'BLASTOISE' },
	10: { dex: 10, name: 'CATERPIE' },
	11: { dex: 11, name: 'METAPOD' },
	12: { dex: 12, name: 'BUTTERFREE' },
	13: { dex: 13, name: 'WEEDLE' },
	14: { dex: 14, name: 'KAKUNA' },
	15: { dex: 15, name: 'BEEDRILL' },
	16: { dex: 16, name: 'PIDGEY' },
	17: { dex: 17, name: 'PIDGEOTTO' },
	18: { dex: 18, name: 'PIDGEOT' },
	19: { dex: 19, name: 'RATTATA' },
	20: { dex: 20, name: 'RATICATE' },
	21: { dex: 21, name: 'SPEAROW' },
	22: { dex: 22, name: 'FEAROW' },
	23: { dex: 23, name: 'EKANS' },
	24: { dex: 24, name: 'ARBOK' },
	25: { dex: 25, name: 'PIKACHU' },
	26: { dex: 26, name: 'RAICHU' },
	27: { dex: 27, name: 'SANDSHREW' },
	28: { dex: 28, name: 'SANDSLASH' },
	29: { dex: 29, name: 'NIDORAN♀' },
	30: { dex: 30, name: 'NIDORINA' },
	31: { dex: 31, name: 'NIDOQUEEN' },
	32: { dex: 32, name: 'NIDORAN♂' },
	33: { dex: 33, name: 'NIDORINO' },
	34: { dex: 34, name: 'NIDOKING' },
	35: { dex: 35, name: 'CLEFAIRY' },
	36: { dex: 36, name: 'CLEFABLE' },
	37: { dex: 37, name: 'VULPIX' },
	38: { dex: 38, name: 'NINETALES' },
	39: { dex: 39, name: 'JIGGLYPUFF' },
	40: { dex: 40, name: 'WIGGLYTUFF' },
	41: { dex: 41, name: 'ZUBAT' },
	42: { dex: 42, name: 'GOLBAT' },
	43: { dex: 43, name: 'ODDISH' },
	44: { dex: 44, name: 'GLOOM' },
	45: { dex: 45, name: 'VILEPLUME' },
	46: { dex: 46, name: 'PARAS' },
	47: { dex: 47, name: 'PARASECT' },
	48: { dex: 48, name: 'VENONAT' },
	49: { dex: 49, name: 'VENOMOTH' },
	50: { dex: 50, name: 'DIGLETT' },
	51: { dex: 51, name: 'DUGTRIO' },
	52: { dex: 52, name: 'MEOWTH' },
	53: { dex: 53, name: 'PERSIAN' },
	54: { dex: 54, name: 'PSYDUCK' },
	55: { dex: 55, name: 'GOLDUCK' },
	56: { dex: 56, name: 'MANKEY' },
	57: { dex: 57, name: 'PRIMEAPE' },
	58: { dex: 58, name: 'GROWLITHE' },
	59: { dex: 59, name: 'ARCANINE' },
	60: { dex: 60, name: 'POLIWAG' },
	61: { dex: 61, name: 'POLIWHIRL' },
	62: { dex: 62, name: 'POLIWRATH' },
	63: { dex: 63, name: 'ABRA' },
	64: { dex: 64, name: 'KADABRA' },
	65: { dex: 65, name: 'ALAKAZAM' },
	66: { dex: 66, name: 'MACHOP' },
	67: { dex: 67, name: 'MACHOKE' },
	68: { dex: 68, name: 'MACHAMP' },
	69: { dex: 69, name: 'BELLSPROUT' },
	70: { dex: 70, name: 'WEEPINBELL' },
	71: { dex: 71, name: 'VICTREEBEL' },
	72: { dex: 72, name: 'TENTACOOL' },
	73: { dex: 73, name: 'TENTACRUEL' },
	74: { dex: 74, name: 'GEODUDE' },
	75: { dex: 75, name: 'GRAVELER' },
	76: { dex: 76, name: 'GOLEM' },
	77: { dex: 77, name: 'PONYTA' },
	78: { dex: 78, name: 'RAPIDASH' },
	79: { dex: 79, name: 'SLOWPOKE' },
	80: { dex: 80, name: 'SLOWBRO' },
	81: { dex: 81, name: 'MAGNEMITE' },
	82: { dex: 82, name: 'MAGNETON' },
	83: { dex: 83, name: 'FARFETCH\'D' },
	84: { dex: 84, name: 'DODUO' },
	85: { dex: 85, name: 'DODRIO' },
	86: { dex: 86, name: 'SEEL' },
	87: { dex: 87, name: 'DEWGONG' },
	88: { dex: 88, name: 'GRIMER' },
	89: { dex: 89, name: 'MUK' },
	90: { dex: 90, name: 'SHELLDER' },
	91: { dex: 91, name: 'CLOYSTER' },
	92: { dex: 92, name: 'GASTLY' },
	93: { dex: 93, name: 'HAUNTER' },
	94: { dex: 94, name: 'GENGAR' },
	95: { dex: 95, name: 'ONIX' },
	96: { dex: 96, name: 'DROWZEE' },
	97: { dex: 97, name: 'HYPNO' },
	98: { dex: 98, name: 'KRABBY' },
	99: { dex: 99, name: 'KINGLER' },
	100: { dex: 100, name: 'VOLTORB' },
	101: { dex: 101, name: 'ELECTRODE' },
	102: { dex: 102, name: 'EXEGGCUTE' },
	103: { dex: 103, name: 'EXEGGUTOR' },
	104: { dex: 104, name: 'CUBONE' },
	105: { dex: 105, name: 'MAROWAK' },
	106: { dex: 106, name: 'HITMONLEE' },
	107: { dex: 107, name: 'HITMONCHAN' },
	108: { dex: 108, name: 'LICKITUNG' },
	109: { dex: 109, name: 'KOFFING' },
	110: { dex: 110, name: 'WEEZING' },
	111: { dex: 111, name: 'RHYHORN' },
	112: { dex: 112, name: 'RHYDON' },
	113: { dex: 113, name: 'CHANSEY' },
	114: { dex: 114, name: 'TANGELA' },
	115: { dex: 115, name: 'KANGASKHAN' },
	116: { dex: 116, name: 'HORSEA' },
	117: { dex: 117, name: 'SEADRA' },
	118: { dex: 118, name: 'GOLDEEN' },
	119: { dex: 119, name: 'SEAKING' },
	120: { dex: 120, name: 'STARYU' },
	121: { dex: 121, name: 'STARMIE' },
	122: { dex: 122, name: 'MR. MIME' },
	123: { dex: 123, name: 'SCYTHER' },
	124: { dex: 124, name: 'JYNX' },
	125: { dex: 125, name: 'ELECTABUZZ' },
	126: { dex: 126, name: 'MAGMAR' },
	127: { dex: 127, name: 'PINSIR' },
	128: { dex: 128, name: 'TAUROS' },
	129: { dex: 129, name: 'MAGIKARP' },
	130: { dex: 130, name: 'GYARADOS' },
	131: { dex: 131, name: 'LAPRAS' },
	132: { dex: 132, name: 'DITTO' },
	133: { dex: 133, name: 'EEVEE' },
	134: { dex: 134, name: 'VAPOREON' },
	135: { dex: 135, name: 'JOLTEON' },
	136: { dex: 136, name: 'FLAREON' },
	137: { dex: 137, name: 'PORYGON' },
	138: { dex: 138, name: 'OMANYTE' },
	139: { dex: 139, name: 'OMASTAR' },
	140: { dex: 140, name: 'KABUTO' },
	141: { dex: 141, name: 'KABUTOPS' },
	142: { dex: 142, name: 'AERODACTYL' },
	143: { dex: 143, name: 'SNORLAX' },
	144: { dex: 144, name: 'ARTICUNO' },
	145: { dex: 145, name: 'ZAPDOS' },
	146: { dex: 146, name: 'MOLTRES' },
	147: { dex: 147, name: 'DRATINI' },
	148: { dex: 148, name: 'DRAGONAIR' },
	149: { dex: 149, name: 'DRAGONITE' },
	150: { dex: 150, name: 'MEWTWO' },
	151: { dex: 151, name: 'MEW' },
	152: { dex: 152, name: 'CHIKORITA' },
	153: { dex: 153, name: 'BAYLEEF' },
	154: { dex: 154, name: 'MEGANIUM' },
	155: { dex: 155, name: 'CYNDAQUIL' },
	156: { dex: 156, name: 'QUILAVA' },
	157: { dex: 157, name: 'TYPHLOSION' },
	158: { dex: 158, name: 'TOTODILE' },
	159: { dex: 159, name: 'CROCONAW' },
	160: { dex: 160, name: 'FERALIGATR' },
	161: { dex: 161, name: 'SENTRET' },
	162: { dex: 162, name: 'FURRET' },
	163: { dex: 163, name: 'HOOTHOOT' },
	164: { dex: 164, name: 'NOCTOWL' },
	165: { dex: 165, name: 'LEDYBA' },
	166: { dex: 166, name: 'LEDIAN' },
	167: { dex: 167, name: 'SPINARAK' },
	168: { dex: 168, name: 'ARIADOS' },
	169: { dex: 169, name: 'CROBAT' },
	170: { dex: 170, name: 'CHINCHOU' },
	171: { dex: 171, name: 'LANTURN' },
	172: { dex: 172, name: 'PICHU' },
	173: { dex: 173, name: 'CLEFFA' },
	174: { dex: 174, name: 'IGGLYBUFF' },
	175: { dex: 175, name: 'TOGEPI' },
	176: { dex: 176, name: 'TOGETIC' },
	177: { dex: 177, name: 'NATU' },
	178: { dex: 178, name: 'XATU' },
	179: { dex: 179, name: 'MAREEP' },
	180: { dex: 180, name: 'FLAAFFY' },
	181: { dex: 181, name: 'AMPHAROS' },
	182: { dex: 182, name: 'BELLOSSOM' },
	183: { dex: 183, name: 'MARILL' },
	184: { dex: 184, name: 'AZUMARILL' },
	185: { dex: 185, name: 'SUDOWOODO' },
	186: { dex: 186, name: 'POLITOED' },
	187: { dex: 187, name: 'HOPPIP' },
	188: { dex: 188, name: 'SKIPLOOM' },
	189: { dex: 189, name: 'JUMPLUFF' },
	190: { dex: 190, name: 'AIPOM' },
	191: { dex: 191, name: 'SUNKERN' },
	192: { dex: 192, name: 'SUNFLORA' },
	193: { dex: 193, name: 'YANMA' },
	194: { dex: 194, name: 'WOOPER' },
	195: { dex: 195, name: 'QUAGSIRE' },
	196: { dex: 196, name: 'ESPEON' },
	197: { dex: 197, name: 'UMBREON' },
	198: { dex: 198, name: 'MURKROW' },
	199: { dex: 199, name: 'SLOWKING' },
	200: { dex: 200, name: 'MISDREAVUS' },
	201: { dex: 201, name: 'UNOWN' },
	202: { dex: 202, name: 'WOBBUFFET' },
	203: { dex: 203, name: 'GIRAFARIG' },
	204: { dex: 204, name: 'PINECO' },
	205: { dex: 205, name: 'FORRETRESS' },
	206: { dex: 206, name: 'DUNSPARCE' },
	207: { dex: 207, name: 'GLIGAR' },
	208: { dex: 208, name: 'STEELIX' },
	209: { dex: 209, name: 'SNUBBULL' },
	210: { dex: 210, name: 'GRANBULL' },
	211: { dex: 211, name: 'QWILFISH' },
	212: { dex: 212, name: 'SCIZOR' },
	213: { dex: 213, name: 'SHUCKLE' },
	214: { dex: 214, name: 'HERACROSS' },
	215: { dex: 215, name: 'SNEASEL' },
	216: { dex: 216, name: 'TEDDIURSA' },
	217: { dex: 217, name: 'URSARING' },
	218: { dex: 218, name: 'SLUGMA' },
	219: { dex: 219, name: 'MAGCARGO' },
	220: { dex: 220, name: 'SWINUB' },
	221: { dex: 221, name: 'PILOSWINE' },
	222: { dex: 222, name: 'CORSOLA' },
	223: { dex: 223, name: 'REMORAID' },
	224: { dex: 224, name: 'OCTILLERY' },
	225: { dex: 225, name: 'DELIBIRD' },
	226: { dex: 226, name: 'MANTINE' },
	227: { dex: 227, name: 'SKARMORY' },
	228: { dex: 228, name: 'HOUNDOUR' },
	229: { dex: 229, name: 'HOUNDOOM' },
	230: { dex: 230, name: 'KINGDRA' },
	231: { dex: 231, name: 'PHANPY' },
	232: { dex: 232, name: 'DONPHAN' },
	233: { dex: 233, name: 'PORYGON2' },
	234: { dex: 234, name: 'STANTLER' },
	235: { dex: 235, name: 'SMEARGLE' },
	236: { dex: 236, name: 'TYROGUE' },
	237: { dex: 237, name: 'HITMONTOP' },
	238: { dex: 238, name: 'SMOOCHUM' },
	239: { dex: 239, name: 'ELEKID' },
	240: { dex: 240, name: 'MAGBY' },
	241: { dex: 241, name: 'MILTANK' },
	242: { dex: 242, name: 'BLISSEY' },
	243: { dex: 243, name: 'RAIKOU' },
	244: { dex: 244, name: 'ENTEI' },
	245: { dex: 245, name: 'SUICUNE' },
	246: { dex: 246, name: 'LARVITAR' },
	247: { dex: 247, name: 'PUPITAR' },
	248: { dex: 248, name: 'TYRANITAR' },
	249: { dex: 249, name: 'LUGIA' },
	250: { dex: 250, name: 'HO-OH' },
	251: { dex: 251, name: 'CELEBI' }
};

function decodeText(buffer: Uint8Array): string {
	let result = '';

	for (let i = 0; i < buffer.length; i++) {
		const byte = buffer[i]!;
		if (byte === 0x50) {
			break;
		}

		const char = ENGLISH_CHARSET[byte];
		if (char !== undefined) {
			result += char;
		}
	}

	return result;
}

export function parseGeneration2SaveParty(saveFile: ArrayBuffer) {
	const saveStream = new StreamIn(saveFile);
	const isGoldSilver = validateGoldSilverSaveChecksum(saveFile);
	const isEnglishCrystal = validateCrystalSaveChecksumEnglish(saveFile);
	const isJapaneseCrystal = validateCrystalSaveChecksumJapanese(saveFile);
	const isJapanese = isJapaneseCrystal; // TODO - Detect Japanese Gold/Silver

	saveStream.seek(0x200B); // * Same offset of all regions and versions

	const playerName = decodeText(saveStream.readBytes(0xB));
	const partyListOffset = isGoldSilver ? 0x288A : isEnglishCrystal ? 0x2865 : isJapaneseCrystal ? 0x281A : 0;

	saveStream.seek(partyListOffset);

	const speciesIDs: number[] = [];
	const pokemonNames: string[] = [];
	const capacity = 6; // * Party always holds 6
	const pokemonDataSize = 48;
	const nameLength = isJapanese ? 6 : 11;
	const partyCount = saveStream.readUint8();

	for (let i = 0; i < partyCount; i++) {
		speciesIDs.push(saveStream.readUint8());
	}

	saveStream.skip(capacity + 1 - partyCount);
	saveStream.skip(capacity * pokemonDataSize);
	saveStream.skip(capacity * nameLength);

	for (let i = 0; i < partyCount; i++) {
		const nameBytes = saveStream.readBytes(nameLength);
		pokemonNames.push(decodeText(nameBytes));
	}

	const party: PartyPokemon[] = [];

	for (let i = 0; i < partyCount; i++) {
		const species = SPECIES_INDEX_MAP[speciesIDs[i]!];

		// TODO - Error here
		if (species) {
			party.push({
				index: speciesIDs[i]!,
				dex: species.dex,
				name: species.name,
				nickname: pokemonNames[i]!
			});
		}
	}

	return {
		player_name: playerName,
		party
	};
}

export function parseGeneration2SaveHallOfFame(saveFile: ArrayBuffer) {
	// TODO - Bulbapedia has no information as to where the Hall of Fame is stored
	return parseGeneration2SaveParty(saveFile);
}

export function validateGeneration2SaveChecksums(saveFile: ArrayBuffer) {
	return validateGoldSilverSaveChecksum(saveFile) || validateCrystalSaveChecksum(saveFile);
}

export function validateGoldSilverSaveChecksum(saveFile: ArrayBuffer) {
	const data = new Uint8Array(saveFile);
	const expectedPrimaryChecksum = data[0x2D69]! | (data[0x2D6A]! << 8);
	const expectedSecondaryChecksum = data[0x7E6D]! | (data[0x7E6E]! << 8);
	let calculatedPrimaryChecksum = 0;
	let calculatedSecondaryChecksum = 0;

	// * Primary checksum data is stored contiguous

	for (let i = 0x2009; i <= 0x2D68; i++) {
		calculatedPrimaryChecksum += data[i]!;
	}

	// * Secondary checksum data is stored in multiple regions

	for (let i = 0x15C7; i <= 0x17EC; i++) {
		calculatedSecondaryChecksum += data[i]!;
	}

	for (let i = 0x3D96; i <= 0x3F3F; i++) {
		calculatedSecondaryChecksum += data[i]!;
	}

	for (let i = 0x0C6B; i <= 0x10E7; i++) {
		calculatedSecondaryChecksum += data[i]!;
	}

	for (let i = 0x7E39; i <= 0x7E6C; i++) {
		calculatedSecondaryChecksum += data[i]!;
	}

	for (let i = 0x10E8; i <= 0x15C6; i++) {
		calculatedSecondaryChecksum += data[i]!;
	}

	calculatedPrimaryChecksum &= 0xFFFF;
	calculatedSecondaryChecksum &= 0xFFFF;

	return calculatedPrimaryChecksum === expectedPrimaryChecksum || calculatedSecondaryChecksum === expectedSecondaryChecksum;
}

export function validateCrystalSaveChecksum(saveFile: ArrayBuffer) {
	// * English and Japanese saves use different regions for checksum data
	return validateCrystalSaveChecksumEnglish(saveFile) || validateCrystalSaveChecksumJapanese(saveFile);
}

export function validateCrystalSaveChecksumEnglish(saveFile: ArrayBuffer) {
	const data = new Uint8Array(saveFile);
	const expectedPrimaryChecksum = data[0x2D0D]! | (data[0x2D0E]! << 8);
	const expectedSecondaryChecksum = data[0x1F0D]! | (data[0x1F0E]! << 8);
	let primaryChecksum = 0;
	let secondaryChecksum = 0;

	for (let i = 0x2009; i <= 0x2B82; i++) {
		primaryChecksum += data[i]!;
	}

	for (let i = 0x1209; i <= 0x1D82; i++) {
		secondaryChecksum += data[i]!;
	}

	primaryChecksum &= 0xFFFF;
	secondaryChecksum &= 0xFFFF;

	return primaryChecksum === expectedPrimaryChecksum || secondaryChecksum === expectedSecondaryChecksum;
}

export function validateCrystalSaveChecksumJapanese(saveFile: ArrayBuffer) {
	const data = new Uint8Array(saveFile);
	const expectedPrimaryChecksum = data[0x2D0D]! | (data[0x2D0E]! << 8);
	const expectedSecondaryChecksum = data[0x7F0D]! | (data[0x7F0E]! << 8);
	let primaryChecksum = 0;
	let secondaryChecksum = 0;

	for (let i = 0x2009; i <= 0x2AE2; i++) {
		primaryChecksum += data[i]!;
	}

	for (let i = 0x7209; i <= 0x7CE2; i++) {
		secondaryChecksum += data[i]!;
	}

	primaryChecksum &= 0xFFFF;
	secondaryChecksum &= 0xFFFF;

	return primaryChecksum === expectedPrimaryChecksum || secondaryChecksum === expectedSecondaryChecksum;
}
