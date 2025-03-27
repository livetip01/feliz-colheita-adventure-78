
import { Crop, Season } from '../types/game';

// Initial crops with balanced economy and season information
export const crops: Crop[] = [
  {
    id: 'potato',
    name: 'Batata',
    growthTime: 35,
    price: 7,
    yield: 16, // Retorno de 228% do investimento
    image: '🥔',
    season: 'all',
    description: 'Cresce em qualquer estação, mas produz menos.',
    unlocked: true // A batata começa desbloqueada
  },
  {
    id: 'tomato',
    name: 'Tomate',
    growthTime: 30, // 30 seconds for testing, would be longer in a real game
    price: 10,
    yield: 25, // Retorno de 250% do investimento
    image: '🍅',
    season: 'summer',
    description: 'Cresce bem no calor do verão.'
  },
  {
    id: 'carrot',
    name: 'Cenoura',
    growthTime: 20,
    price: 5,
    yield: 11, // Retorno de 220% do investimento
    image: '🥕',
    season: 'spring',
    description: 'Cresce rápido na primavera.'
  },
  {
    id: 'corn',
    name: 'Milho',
    growthTime: 40,
    price: 15,
    yield: 40, // Retorno de 267% do investimento
    image: '🌽',
    season: 'summer',
    description: 'Ideal para o sol forte do verão.'
  },
  {
    id: 'strawberry',
    name: 'Morango',
    growthTime: 25,
    price: 20,
    yield: 50, // Retorno de 250% do investimento
    image: '🍓',
    season: 'spring',
    description: 'Floresce na primavera com clima ameno.'
  },
  {
    id: 'pumpkin',
    name: 'Abóbora',
    growthTime: 50,
    price: 25,
    yield: 70, // Retorno de 280% do investimento
    image: '🎃',
    season: 'fall',
    description: 'Melhor cultivada no outono.'
  },
  {
    id: 'wheat',
    name: 'Trigo',
    growthTime: 30,
    price: 8,
    yield: 18, // Retorno de 225% do investimento
    image: '🌾',
    season: 'fall',
    description: 'Cresce bem com as chuvas de outono.'
  },
  {
    id: 'cabbage',
    name: 'Repolho',
    growthTime: 45,
    price: 12,
    yield: 30, // Retorno de 250% do investimento
    image: '🥬',
    season: 'winter',
    description: 'Resiste bem ao frio do inverno.'
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
