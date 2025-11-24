import type { TrainerCardConstructor } from '@/trainer-card-templates/TrainerCard';
import RedBlue from '@/trainer-card-templates/RedBlue';
import GoldSilver from '@/trainer-card-templates/GoldSilver';
import RubySapphire from '@/trainer-card-templates/RubySapphire';
import DiamondPearl from '@/trainer-card-templates/DiamondPearl';
import Modern from '@/trainer-card-templates/Modern';
import CustomBlakersBonkersRedditRed from '@/trainer-card-templates/custom/blakers_bonkers-reddit/red';

const templates: TrainerCardConstructor[] = [
	RedBlue,
	GoldSilver,
	RubySapphire,
	DiamondPearl,
	Modern,
	CustomBlakersBonkersRedditRed
];

export default templates;
