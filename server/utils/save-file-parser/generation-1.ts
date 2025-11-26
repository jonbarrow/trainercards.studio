import type { PokemonSpecies, PartyPokemon } from '@/types/pokemon-save-file-data';

// * https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_I)

// * Currently only supports the English text encoding. Will probably work
// * in other languages, besides Japanese. Only includes characters the user
// * can input
// * https://bulbapedia.bulbagarden.net/wiki/Character_encoding_(Generation_I)#English
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

// * Pokemon are not referenced by the game by their dex number
// * https://tcrf.net/Pok%C3%A9mon_Red_and_Blue/Internal_Index_Number
const SPECIES_INDEX_MAP: { [key: number]: PokemonSpecies } = {
	1: {
		dex: 112,
		name: 'RHYDON'
	},
	2: {
		dex: 115,
		name: 'KANGASKHAN'
	},
	3: {
		dex: 32,
		name: 'NIDORAN♂'
	},
	4: {
		dex: 35,
		name: 'CLEFAIRY'
	},
	5: {
		dex: 21,
		name: 'SPEAROW'
	},
	6: {
		dex: 100,
		name: 'VOLTORB'
	},
	7: {
		dex: 34,
		name: 'NIDOKING'
	},
	8: {
		dex: 80,
		name: 'SLOWBRO'
	},
	9: {
		dex: 2,
		name: 'IVYSAUR'
	},
	10: {
		dex: 103,
		name: 'EXEGGUTOR'
	},
	11: {
		dex: 108,
		name: 'LICKITUNG'
	},
	12: {
		dex: 102,
		name: 'EXEGGCUTE'
	},
	13: {
		dex: 88,
		name: 'GRIMER'
	},
	14: {
		dex: 94,
		name: 'GENGAR'
	},
	15: {
		dex: 29,
		name: 'NIDORAN♀'
	},
	16: {
		dex: 31,
		name: 'NIDOQUEEN'
	},
	17: {
		dex: 104,
		name: 'CUBONE'
	},
	18: {
		dex: 111,
		name: 'RHYHORN'
	},
	19: {
		dex: 131,
		name: 'LAPRAS'
	},
	20: {
		dex: 59,
		name: 'ARCANINE'
	},
	21: {
		dex: 151,
		name: 'MEW'
	},
	22: {
		dex: 130,
		name: 'GYARADOS'
	},
	23: {
		dex: 90,
		name: 'SHELLDER'
	},
	24: {
		dex: 72,
		name: 'TENTACOOL'
	},
	25: {
		dex: 92,
		name: 'GASTLY'
	},
	26: {
		dex: 123,
		name: 'SCYTHER'
	},
	27: {
		dex: 120,
		name: 'STARYU'
	},
	28: {
		dex: 9,
		name: 'BLASTOISE'
	},
	29: {
		dex: 127,
		name: 'PINSIR'
	},
	30: {
		dex: 114,
		name: 'TANGELA'
	},
	33: {
		dex: 58,
		name: 'GROWLITHE'
	},
	34: {
		dex: 95,
		name: 'ONIX'
	},
	35: {
		dex: 22,
		name: 'FEAROW'
	},
	36: {
		dex: 16,
		name: 'PIDGEY'
	},
	37: {
		dex: 79,
		name: 'SLOWPOKE'
	},
	38: {
		dex: 64,
		name: 'KADABRA'
	},
	39: {
		dex: 75,
		name: 'GRAVELER'
	},
	40: {
		dex: 113,
		name: 'CHANSEY'
	},
	41: {
		dex: 67,
		name: 'MACHOKE'
	},
	42: {
		dex: 122,
		name: 'MR. MIME'
	},
	43: {
		dex: 106,
		name: 'HITMONLEE'
	},
	44: {
		dex: 107,
		name: 'HITMONCHAN'
	},
	45: {
		dex: 24,
		name: 'ARBOK'
	},
	46: {
		dex: 47,
		name: 'PARASECT'
	},
	47: {
		dex: 54,
		name: 'PSYDUCK'
	},
	48: {
		dex: 96,
		name: 'DROWZEE'
	},
	49: {
		dex: 76,
		name: 'GOLEM'
	},
	51: {
		dex: 126,
		name: 'MAGMAR'
	},
	53: {
		dex: 125,
		name: 'ELECTABUZZ'
	},
	54: {
		dex: 82,
		name: 'MAGNETON'
	},
	55: {
		dex: 109,
		name: 'KOFFING'
	},
	57: {
		dex: 56,
		name: 'MANKEY'
	},
	58: {
		dex: 86,
		name: 'SEEL'
	},
	59: {
		dex: 50,
		name: 'DIGLETT'
	},
	60: {
		dex: 128,
		name: 'TAUROS'
	},
	64: {
		dex: 83,
		name: 'FARFETCH\'D'
	},
	65: {
		dex: 48,
		name: 'VENONAT'
	},
	66: {
		dex: 149,
		name: 'DRAGONITE'
	},
	70: {
		dex: 84,
		name: 'DODUO'
	},
	71: {
		dex: 60,
		name: 'POLIWAG'
	},
	72: {
		dex: 124,
		name: 'JYNX'
	},
	73: {
		dex: 146,
		name: 'MOLTRES'
	},
	74: {
		dex: 144,
		name: 'ARTICUNO'
	},
	75: {
		dex: 145,
		name: 'ZAPDOS'
	},
	76: {
		dex: 132,
		name: 'DITTO'
	},
	77: {
		dex: 52,
		name: 'MEOWTH'
	},
	78: {
		dex: 98,
		name: 'KRABBY'
	},
	82: {
		dex: 37,
		name: 'VULPIX'
	},
	83: {
		dex: 38,
		name: 'NINETALES'
	},
	84: {
		dex: 25,
		name: 'PIKACHU'
	},
	85: {
		dex: 26,
		name: 'RAICHU'
	},
	88: {
		dex: 147,
		name: 'DRATINI'
	},
	89: {
		dex: 148,
		name: 'DRAGONAIR'
	},
	90: {
		dex: 140,
		name: 'KABUTO'
	},
	91: {
		dex: 141,
		name: 'KABUTOPS'
	},
	92: {
		dex: 116,
		name: 'HORSEA'
	},
	93: {
		dex: 117,
		name: 'SEADRA'
	},
	96: {
		dex: 27,
		name: 'SANDSHREW'
	},
	97: {
		dex: 28,
		name: 'SANDSLASH'
	},
	98: {
		dex: 138,
		name: 'OMANYTE'
	},
	99: {
		dex: 139,
		name: 'OMASTAR'
	},
	100: {
		dex: 39,
		name: 'JIGGLYPUFF'
	},
	101: {
		dex: 40,
		name: 'WIGGLYTUFF'
	},
	102: {
		dex: 133,
		name: 'EEVEE'
	},
	103: {
		dex: 136,
		name: 'FLAREON'
	},
	104: {
		dex: 135,
		name: 'JOLTEON'
	},
	105: {
		dex: 134,
		name: 'VAPOREON'
	},
	106: {
		dex: 66,
		name: 'MACHOP'
	},
	107: {
		dex: 41,
		name: 'ZUBAT'
	},
	108: {
		dex: 23,
		name: 'EKANS'
	},
	109: {
		dex: 46,
		name: 'PARAS'
	},
	110: {
		dex: 61,
		name: 'POLIWHIRL'
	},
	111: {
		dex: 62,
		name: 'POLIWRATH'
	},
	112: {
		dex: 13,
		name: 'WEEDLE'
	},
	113: {
		dex: 14,
		name: 'KAKUNA'
	},
	114: {
		dex: 15,
		name: 'BEEDRILL'
	},
	116: {
		dex: 85,
		name: 'DODRIO'
	},
	117: {
		dex: 57,
		name: 'PRIMEAPE'
	},
	118: {
		dex: 51,
		name: 'DUGTRIO'
	},
	119: {
		dex: 49,
		name: 'VENOMOTH'
	},
	120: {
		dex: 87,
		name: 'DEWGONG'
	},
	123: {
		dex: 10,
		name: 'CATERPIE'
	},
	124: {
		dex: 11,
		name: 'METAPOD'
	},
	125: {
		dex: 12,
		name: 'BUTTERFREE'
	},
	126: {
		dex: 68,
		name: 'MACHAMP'
	},
	128: {
		dex: 55,
		name: 'GOLDUCK'
	},
	129: {
		dex: 97,
		name: 'HYPNO'
	},
	130: {
		dex: 42,
		name: 'GOLBAT'
	},
	131: {
		dex: 150,
		name: 'MEWTWO'
	},
	132: {
		dex: 143,
		name: 'SNORLAX'
	},
	133: {
		dex: 129,
		name: 'MAGIKARP'
	},
	136: {
		dex: 89,
		name: 'MUK'
	},
	138: {
		dex: 99,
		name: 'KINGLER'
	},
	139: {
		dex: 91,
		name: 'CLOYSTER'
	},
	141: {
		dex: 101,
		name: 'ELECTRODE'
	},
	142: {
		dex: 36,
		name: 'CLEFABLE'
	},
	143: {
		dex: 110,
		name: 'WEEZING'
	},
	144: {
		dex: 53,
		name: 'PERSIAN'
	},
	145: {
		dex: 105,
		name: 'MAROWAK'
	},
	147: {
		dex: 93,
		name: 'HAUNTER'
	},
	148: {
		dex: 63,
		name: 'ABRA'
	},
	149: {
		dex: 65,
		name: 'ALAKAZAM'
	},
	150: {
		dex: 17,
		name: 'PIDGEOTTO'
	},
	151: {
		dex: 18,
		name: 'PIDGEOT'
	},
	152: {
		dex: 121,
		name: 'STARMIE'
	},
	153: {
		dex: 1,
		name: 'BULBASAUR'
	},
	154: {
		dex: 3,
		name: 'VENUSAUR'
	},
	155: {
		dex: 73,
		name: 'TENTACRUEL'
	},
	157: {
		dex: 118,
		name: 'GOLDEEN'
	},
	158: {
		dex: 119,
		name: 'SEAKING'
	},
	163: {
		dex: 77,
		name: 'PONYTA'
	},
	164: {
		dex: 78,
		name: 'RAPIDASH'
	},
	165: {
		dex: 19,
		name: 'RATTATA'
	},
	166: {
		dex: 20,
		name: 'RATICATE'
	},
	167: {
		dex: 33,
		name: 'NIDORINO'
	},
	168: {
		dex: 30,
		name: 'NIDORINA'
	},
	169: {
		dex: 74,
		name: 'GEODUDE'
	},
	170: {
		dex: 137,
		name: 'PORYGON'
	},
	171: {
		dex: 142,
		name: 'AERODACTYL'
	},
	173: {
		dex: 81,
		name: 'MAGNEMITE'
	},
	176: {
		dex: 4,
		name: 'CHARMANDER'
	},
	177: {
		dex: 7,
		name: 'SQUIRTLE'
	},
	178: {
		dex: 5,
		name: 'CHARMELEON'
	},
	179: {
		dex: 8,
		name: 'WARTORTLE'
	},
	180: {
		dex: 6,
		name: 'CHARIZARD'
	},
	185: {
		dex: 43,
		name: 'ODDISH'
	},
	186: {
		dex: 44,
		name: 'GLOOM'
	},
	187: {
		dex: 45,
		name: 'VILEPLUME'
	},
	188: {
		dex: 69,
		name: 'BELLSPROUT'
	},
	189: {
		dex: 70,
		name: 'WEEPINBELL'
	},
	190: {
		dex: 71,
		name: 'VICTREEBEL'
	}
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

export function parseGeneration1SaveParty(saveFile: ArrayBuffer | Buffer) {
	const saveStream = new StreamIn(saveFile);

	saveStream.seek(0x2598); // * Bank1 "Player Name"

	const playerName = decodeText(saveStream.readBytes(0xB));

	saveStream.seek(0x2F2C); // * Bank1 "Party Data"

	const speciesIDs: number[] = [];
	const pokemonNames: string[] = [];
	const partyCount = saveStream.readUint8();

	for (let i = 0; i < partyCount; i++) {
		speciesIDs.push(saveStream.readUint8());
	}

	saveStream.seek(0x2F2C + 0x152); // * Bank1 "Party Data" "Pokémon Names"

	for (let i = 0; i < partyCount; i++) {
		pokemonNames.push(decodeText(saveStream.readBytes(0xB)));
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

export function parseGeneration1SaveHallOfFame(saveFile: ArrayBuffer | Buffer) {
	const saveStream = new StreamIn(saveFile);

	saveStream.seek(0x2598); // * Bank1 "Player Name"

	const playerName = decodeText(saveStream.readBytes(0xB));

	saveStream.seek(0x284E); // * Bank1 "Main Data" "Hall of Fame Record Count"

	const hallOfFameRecordCount = saveStream.readUint8();

	saveStream.seek(0x0598); // * Bank0 "Hall of Fame"

	const hallOfFame: PartyPokemon[][] = [];

	for (let i = 0; i < hallOfFameRecordCount; i++) {
		const party: PartyPokemon[] = [];

		// TODO - How to know if a Pokemon is not set? Like for records with 5 or less Pokemon?
		for (let j = 0; j < 6; j++) {
			const speciesID = saveStream.readUint8();

			saveStream.skip(0x1);

			const pokemonName = decodeText(saveStream.readBytes(0xB));

			saveStream.skip(0x3);

			const species = SPECIES_INDEX_MAP[speciesID!];

			// TODO - Error here
			if (species) {
				party.push({
					index: speciesID!,
					dex: species.dex,
					name: species.name,
					nickname: pokemonName!
				});
			}
		}

		hallOfFame.push(party);
	}

	return {
		player_name: playerName,
		party: hallOfFame.pop() || [] // * Only return the most recent Hall of Fame entry
	};
}

export function validateGeneration1SaveChecksum(saveFile: ArrayBuffer | Buffer) {
	const data = new Uint8Array(saveFile);
	const expectedChecksum = data[0x3523];
	let calculatedChecksum = 0;

	for (let offset = 0x2598; offset <= 0x3522; offset++) {
		calculatedChecksum += data[offset]!;
	}

	calculatedChecksum = (~calculatedChecksum) & 0xFF;

	return calculatedChecksum === expectedChecksum;
}
