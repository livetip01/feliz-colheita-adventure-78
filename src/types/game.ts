
export interface Crop {
  id: string;
  name: string;
  growthTime: number; // in seconds
  price: number;
  yield: number;
  image: string;
}

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
}

export type GameAction = 
  | { type: 'SELECT_CROP'; crop: Crop | null }
  | { type: 'SELECT_PLOT'; plotId: string | null }
  | { type: 'PLANT_CROP'; plotId: string; crop: Crop; time: number }
  | { type: 'HARVEST_CROP'; plotId: string; time: number }
  | { type: 'UPDATE_GROWTH'; time: number }
  | { type: 'BUY_CROP'; crop: Crop; quantity: number }
  | { type: 'SELL_CROP'; crop: Crop; quantity: number };
