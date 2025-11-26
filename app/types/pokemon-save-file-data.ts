export type PokemonSpecies = {
	dex: number;
	name: string;
};

export type PartyPokemon = {
	index: number;
	dex: number;
	name: string;
	nickname: string;
};

export type PokemonSaveFileData = {
	platform: string; // TODO - Strongly type this
	data: {
		player_name: string;
		party: PartyPokemon[];
	};
};
