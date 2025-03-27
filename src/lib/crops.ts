import { Crop, Season } from '../types/game';

// Balanced crop list with progressive growth times and economy
export const crops: Crop[] = [
  {
    id: 'potato',
    name: 'Batata',
    growthTime: 70, // Base growth time
    price: 7,
    yield: 16,
    image: '🥔',
    season: 'all',
    description: 'Cresce em qualquer estação, mas produz menos.',
    unlocked: true // Potato starts unlocked
  },
  {
    id: 'carrot',
    name: 'Cenoura',
    growthTime: 60, // Faster than potato
    price: 5,
    yield: 11,
    image: '🥕',
    season: 'spring',
    description: 'Cresce rápido na primavera.'
  },
  {
    id: 'tomato',
    name: 'Tomate',
    growthTime: 80, // Slower than potato
    price: 10,
    yield: 22,
    image: '🍅',
    season: 'summer',
    description: 'Cresce bem no calor do verão.'
  },
  {
    id: 'corn',
    name: 'Milho',
    growthTime: 100, // Even slower
    price: 15,
    yield: 35,
    image: '🌽',
    season: 'summer',
    description: 'Ideal para o sol forte do verão.'
  },
  {
    id: 'strawberry',
    name: 'Morango',
    growthTime: 90, // Medium growth time
    price: 20,
    yield: 42,
    image: '🍓',
    season: 'spring',
    description: 'Floresce na primavera com clima ameno.'
  },
  {
    id: 'pumpkin',
    name: 'Abóbora',
    growthTime: 120, // Slow growth
    price: 25,
    yield: 60,
    image: '🎃',
    season: 'fall',
    description: 'Melhor cultivada no outono.'
  },
  {
    id: 'wheat',
    name: 'Trigo',
    growthTime: 85, // Medium growth
    price: 8,
    yield: 18,
    image: '🌾',
    season: 'fall',
    description: 'Cresce bem com as chuvas de outono.'
  },
  {
    id: 'cabbage',
    name: 'Repolho',
    growthTime: 110, // Slower
    price: 12,
    yield: 28,
    image: '🥬',
    season: 'winter',
    description: 'Resiste bem ao frio do inverno.'
  },
  {
    id: 'peas',
    name: 'Ervilhas',
    growthTime: 65,
    price: 10,
    yield: 22,
    image: '🌱',
    season: 'spring',
    description: 'Pequenas vagens que crescem bem na primavera.'
  },
  {
    id: 'lettuce',
    name: 'Alface',
    growthTime: 45,
    price: 7,
    yield: 14,
    image: '🥬',
    season: 'spring',
    description: 'Folhas verdes que crescem rapidamente no clima ameno da primavera.'
  },
  {
    id: 'cucumber',
    name: 'Pepino',
    growthTime: 70,
    price: 12,
    yield: 26,
    image: '🥒',
    season: 'summer',
    description: 'Vegetal refrescante que cresce bem no verão.'
  },
  {
    id: 'blueberry',
    name: 'Mirtilo',
    growthTime: 110,
    price: 25,
    yield: 60,
    image: '🫐',
    season: 'summer',
    description: 'Pequenas frutas azuis que adoram o sol do verão.'
  },
  {
    id: 'mushroom',
    name: 'Cogumelo',
    growthTime: 50,
    price: 15,
    yield: 32,
    image: '🍄',
    season: 'fall',
    description: 'Cresce bem no ambiente úmido do outono.'
  },
  {
    id: 'turnip',
    name: 'Nabo',
    growthTime: 60,
    price: 9,
    yield: 20,
    image: '🥕',
    season: 'fall',
    description: 'Raiz nutritiva que prefere o clima do outono.'
  },
  {
    id: 'kale',
    name: 'Couve',
    growthTime: 70,
    price: 11,
    yield: 25,
    image: '🥬',
    season: 'winter',
    description: 'Folha resistente que aguenta bem o frio do inverno.'
  },
  {
    id: 'leek',
    name: 'Alho-poró',
    growthTime: 90,
    price: 13,
    yield: 30,
    image: '🧅',
    season: 'winter',
    description: 'Vegetal de inverno com sabor suave de cebola.'
  },
  {
    id: 'herb',
    name: 'Ervas',
    growthTime: 40,
    price: 8,
    yield: 15,
    image: '🌿',
    season: 'all',
    description: 'Plantas aromáticas que crescem em qualquer estação.'
  },
  {
    id: 'watermelon',
    name: 'Melancia',
    growthTime: 140, // Very slow
    price: 30,
    yield: 75, // Reduced yield
    image: '🍉',
    season: 'summer',
    description: 'Uma fruta refrescante que adora calor.'
  },
  {
    id: 'eggplant',
    name: 'Berinjela',
    growthTime: 95, // Medium-slow
    price: 16,
    yield: 36, // Reduced yield
    image: '🍆',
    season: 'summer',
    description: 'Precisa de muito sol para crescer adequadamente.'
  },
  {
    id: 'grapes',
    name: 'Uvas',
    growthTime: 160, // Very slow
    price: 35,
    yield: 85, // Reduced yield
    image: '🍇',
    season: 'fall',
    description: 'Crescem melhor em climas temperados do outono.'
  },
  {
    id: 'broccoli',
    name: 'Brócolis',
    growthTime: 80, // Medium
    price: 14,
    yield: 32, // Reduced yield
    image: '🥦',
    season: 'winter',
    description: 'Prefere o clima mais frio do inverno.'
  },
  {
    id: 'pepper',
    name: 'Pimentão',
    growthTime: 105, // Medium-slow
    price: 18,
    yield: 42, // Reduced yield
    image: '🫑',
    season: 'summer',
    description: 'Cresce rapidamente em climas quentes.'
  },
  {
    id: 'avocado',
    name: 'Abacate',
    growthTime: 180, // Extremely slow
    price: 45,
    yield: 110, // Reduced yield
    image: '🥑',
    season: 'spring',
    description: 'Cultura de alto valor que requer paciência.'
  },
  {
    id: 'onion',
    name: 'Cebola',
    growthTime: 75, // Medium
    price: 12,
    yield: 26, // Reduced yield
    image: '🧅',
    season: 'spring',
    description: 'Cresce bem abaixo do solo na primavera.'
  },
  {
    id: 'garlic',
    name: 'Alho',
    growthTime: 85, // Medium
    price: 15,
    yield: 34, // Reduced yield
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
