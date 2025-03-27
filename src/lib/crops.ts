
import { Crop, Season } from '../types/game';

// Initial crops with balanced economy, season information, and DOUBLED growth times
export const crops: Crop[] = [
  {
    id: 'potato',
    name: 'Batata',
    growthTime: 70, // Doubled from 35
    price: 7,
    yield: 16,
    image: '🥔',
    season: 'all',
    description: 'Cresce em qualquer estação, mas produz menos.',
    unlocked: true // A batata começa desbloqueada
  },
  {
    id: 'tomato',
    name: 'Tomate',
    growthTime: 60, // Doubled from 30
    price: 10,
    yield: 25,
    image: '🍅',
    season: 'summer',
    description: 'Cresce bem no calor do verão.'
  },
  {
    id: 'carrot',
    name: 'Cenoura',
    growthTime: 40, // Doubled from 20
    price: 5,
    yield: 11,
    image: '🥕',
    season: 'spring',
    description: 'Cresce rápido na primavera.'
  },
  {
    id: 'corn',
    name: 'Milho',
    growthTime: 80, // Doubled from 40
    price: 15,
    yield: 40,
    image: '🌽',
    season: 'summer',
    description: 'Ideal para o sol forte do verão.'
  },
  {
    id: 'strawberry',
    name: 'Morango',
    growthTime: 50, // Doubled from 25
    price: 20,
    yield: 50,
    image: '🍓',
    season: 'spring',
    description: 'Floresce na primavera com clima ameno.'
  },
  {
    id: 'pumpkin',
    name: 'Abóbora',
    growthTime: 100, // Doubled from 50
    price: 25,
    yield: 70,
    image: '🎃',
    season: 'fall',
    description: 'Melhor cultivada no outono.'
  },
  {
    id: 'wheat',
    name: 'Trigo',
    growthTime: 60, // Doubled from 30
    price: 8,
    yield: 18,
    image: '🌾',
    season: 'fall',
    description: 'Cresce bem com as chuvas de outono.'
  },
  {
    id: 'cabbage',
    name: 'Repolho',
    growthTime: 90, // Doubled from 45
    price: 12,
    yield: 30,
    image: '🥬',
    season: 'winter',
    description: 'Resiste bem ao frio do inverno.'
  },
  // Novas plantas adicionadas
  {
    id: 'watermelon',
    name: 'Melancia',
    growthTime: 100,
    price: 30,
    yield: 85,
    image: '🍉',
    season: 'summer',
    description: 'Uma fruta refrescante que adora calor.'
  },
  {
    id: 'eggplant',
    name: 'Berinjela',
    growthTime: 70,
    price: 16,
    yield: 42,
    image: '🍆',
    season: 'summer',
    description: 'Precisa de muito sol para crescer adequadamente.'
  },
  {
    id: 'grapes',
    name: 'Uvas',
    growthTime: 120,
    price: 35,
    yield: 100,
    image: '🍇',
    season: 'fall',
    description: 'Crescem melhor em climas temperados do outono.'
  },
  {
    id: 'broccoli',
    name: 'Brócolis',
    growthTime: 65,
    price: 14,
    yield: 38,
    image: '🥦',
    season: 'winter',
    description: 'Prefere o clima mais frio do inverno.'
  },
  {
    id: 'pepper',
    name: 'Pimentão',
    growthTime: 75,
    price: 18,
    yield: 48,
    image: '🫑',
    season: 'summer',
    description: 'Cresce rapidamente em climas quentes.'
  },
  {
    id: 'avocado',
    name: 'Abacate',
    growthTime: 140,
    price: 45,
    yield: 130,
    image: '🥑',
    season: 'spring',
    description: 'Cultura de alto valor que requer paciência.'
  },
  {
    id: 'onion',
    name: 'Cebola',
    growthTime: 55,
    price: 12,
    yield: 32,
    image: '🧅',
    season: 'spring',
    description: 'Cresce bem abaixo do solo na primavera.'
  },
  {
    id: 'garlic',
    name: 'Alho',
    growthTime: 60,
    price: 15,
    yield: 40,
    image: '🧄',
    season: 'fall',
    description: 'Um tempero essencial que amadurece no outono.'
  }
];

// Check if a crop is unlocked
export const isCropUnlocked = (cropId: string, unlockedCrops: string[]): boolean => {
  return unlockedCrops?.includes(cropId) || false;
};

// Get the unlock price for a crop (10x the unit price)
export const getUnlockPrice = (crop: Crop): number => {
  return crop.price * 10;
};

// Check if a crop can be planted in the current season
export const canPlantInSeason = (crop: Crop, season: Season): boolean => {
  return crop.season === 'all' || crop.season === season;
};

// Get season name in Portuguese
export const getSeasonName = (season: Season): string => {
  const seasons: Record<Season, string> = {
    spring: 'Primavera',
    summer: 'Verão',
    fall: 'Outono',
    winter: 'Inverno'
  };
  return seasons[season];
};

// Lista de estações em ordem
export const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
