import type { TrainerCardConstructor } from '@/trainer-card-templates/TrainerCard';
import RedBlueGB from '@/trainer-card-templates/red-blue/RedBlueGB';
import RedBlueGBC from '@/trainer-card-templates/red-blue/RedBlueGBC';
import GoldSilver from '@/trainer-card-templates/gold-silver/GoldSilver';
import RubySapphire from '@/trainer-card-templates/ruby-sapphire/RubySapphire';
import DiamondPearlRed from '@/trainer-card-templates/diamond-pearl-stars/DiamondPearlZeroStar';
import DiamondPearlOneStar from '@/trainer-card-templates/diamond-pearl-stars/DiamondPearlOneStar';
import DiamondPearlTwoStar from '@/trainer-card-templates/diamond-pearl-stars/DiamondPearlTwoStar';
import DiamondPearlThreeStar from '@/trainer-card-templates/diamond-pearl-stars/DiamondPearlThreeStar';
import DiamondPearlFourStar from '@/trainer-card-templates/diamond-pearl-stars/DiamondPearlFourStar';
import DiamondPearlFiveStar from '@/trainer-card-templates/diamond-pearl-stars/DiamondPearlFiveStar';
import ModernCity from '@/trainer-card-templates/modern/ModernCity';
import ModernGalarScenery from '@/trainer-card-templates/modern/ModernGalarScenery';
import ModernPokemonInTheWild from '@/trainer-card-templates/modern/ModernPokemonInTheWild';

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
