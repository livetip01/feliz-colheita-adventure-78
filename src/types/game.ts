
export interface Crop {
  id: string;
  name: string;
  growthTime: number; // in seconds
  price: number;
  yield: number;
  image: string;
  season: Season | 'all'; // Em qual estação pode ser plantada
  description?: string;
  unlocked?: boolean; // Indica se o cultivo está desbloqueado
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface PlotState {
  id: string;
  crop: Crop | null;
  plantedAt: number | null;
  growthStage: 'empty' | 'growing' | 'ready';
  position: { x: number; y: number };
}

export interface InventoryItem {
  crop: Crop;
  quantity: number;
}

export interface GameState {
  plots: PlotState[];
  inventory: InventoryItem[];
  coins: number;
  selectedCrop: Crop | null;
  selectedPlot: string | null;
  currentSeason: Season;
  dayCount: number; // Para controlar a passagem do tempo
  playerName: string;
  saveDate?: string; // Data do último save
  unlockedCrops: string[]; // IDs das culturas desbloqueadas
}

export type GameAction = 
  | { type: 'SELECT_CROP'; crop: Crop | null }
  | { type: 'SELECT_PLOT'; plotId: string | null }
  | { type: 'PLANT_CROP'; plotId: string; crop: Crop; time: number }
  | { type: 'HARVEST_CROP'; plotId: string; time: number }
  | { type: 'UPDATE_GROWTH'; time: number }
  | { type: 'BUY_CROP'; crop: Crop; quantity: number }
  | { type: 'SELL_CROP'; crop: Crop; quantity: number }
  | { type: 'CHANGE_SEASON'; season: Season }
  | { type: 'NEXT_DAY' }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'SET_PLAYER_NAME'; name: string }
  | { type: 'UNLOCK_CROP'; cropId: string };
