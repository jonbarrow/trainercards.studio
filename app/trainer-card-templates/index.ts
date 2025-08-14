import type { TrainerCardConstructor } from '@/trainer-card-templates/TrainerCard';
import RedBlueGB from '@/trainer-card-templates/RedBlueGB';
import RedBlueGBC from '@/trainer-card-templates/RedBlueGBC';
import GoldSilver from '@/trainer-card-templates/GoldSilver';
import RubySapphire from '@/trainer-card-templates/RubySapphire';
import DiamondPearlRed from '@/trainer-card-templates/DiamondPearlZeroStar';
import DiamondPearlOneStar from '@/trainer-card-templates/DiamondPearlOneStar';
import DiamondPearlTwoStar from '@/trainer-card-templates/DiamondPearlTwoStar';
import DiamondPearlThreeStar from '@/trainer-card-templates/DiamondPearlThreeStar';
import DiamondPearlFourStar from '@/trainer-card-templates/DiamondPearlFourStar';
import DiamondPearlFiveStar from '@/trainer-card-templates/DiamondPearlFiveStar';
import ModernCity from '@/trainer-card-templates/ModernCity';
import ModernGalarScenery from '@/trainer-card-templates/ModernGalarScenery';
import ModernPokemonInTheWild from '@/trainer-card-templates/ModernPokemonInTheWild';

const templates: TrainerCardConstructor[] = [
	RedBlueGB,
	RedBlueGBC,
	GoldSilver,
	RubySapphire,
	DiamondPearlRed,
	DiamondPearlOneStar,
	DiamondPearlTwoStar,
	DiamondPearlThreeStar,
	DiamondPearlFourStar,
	DiamondPearlFiveStar,
	ModernCity,
	ModernGalarScenery,
	ModernPokemonInTheWild
];

export default templates;
