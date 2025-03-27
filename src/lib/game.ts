import { Crop, GameState, GameAction, PlotState, InventoryItem, Season } from '../types/game';

// Initial crops with balanced economy and season information
export const crops: Crop[] = [
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
    id: 'potato',
    name: 'Batata',
    growthTime: 35,
    price: 7,
    yield: 16, // Retorno de 228% do investimento
    image: '🥔',
    season: 'all',
    description: 'Cresce em qualquer estação, mas produz menos.'
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

// Create initial plots in a grid pattern
export const createInitialPlots = (rows: number, cols: number): PlotState[] => {
  const plots: PlotState[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      plots.push({
        id: `plot-${x}-${y}`,
        crop: null,
        plantedAt: null,
        growthStage: 'empty',
        position: { x, y }
      });
    }
  }
  return plots;
};

// Initial game state
export const initialGameState: GameState = {
  plots: createInitialPlots(4, 4),
  inventory: crops.map(crop => ({ crop, quantity: 3 })), // Start with some seeds
  coins: 100,
  selectedCrop: null,
  selectedPlot: null,
  currentSeason: 'spring', // Começa na primavera
  dayCount: 1, // Começa no dia 1
  playerName: 'Fazendeiro',
};

// Calculate growth stage based on time elapsed
const calculateGrowthStage = (crop: Crop, plantedAt: number, currentTime: number): 'empty' | 'growing' | 'ready' => {
  if (!plantedAt) return 'empty';
  
  const elapsedTime = (currentTime - plantedAt) / 1000; // to seconds
  if (elapsedTime >= crop.growthTime) {
    return 'ready';
  }
  return 'growing';
};

// Calculate growth percentage (0-100)
export const getGrowthPercentage = (crop: Crop, plantedAt: number, currentTime: number) => {
  if (!plantedAt) return 0;
  
  const elapsedTime = (currentTime - plantedAt) / 1000; // to seconds
  const percentage = Math.min(100, Math.floor((elapsedTime / crop.growthTime) * 100));
  return percentage;
};

// Save game to localStorage
export const saveGame = (state: GameState) => {
  const gameState = {
    ...state,
    saveDate: new Date().toISOString()
  };
  localStorage.setItem('colheita-feliz-save', JSON.stringify(gameState));
};

// Load game from localStorage
export const loadGame = (): GameState | null => {
  const savedGame = localStorage.getItem('colheita-feliz-save');
  if (savedGame) {
    return JSON.parse(savedGame);
  }
  return null;
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

// Game reducer function
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_CROP':
      return {
        ...state,
        selectedCrop: action.crop
      };
      
    case 'SELECT_PLOT':
      return {
        ...state,
        selectedPlot: action.plotId
      };
      
    case 'PLANT_CROP': {
      // Check if we have the crop in inventory
      const inventoryItem = state.inventory.find(item => item.crop.id === action.crop.id);
      if (!inventoryItem || inventoryItem.quantity <= 0) {
        return state;
      }
      
      // Check if the crop can be planted in the current season
      if (!canPlantInSeason(action.crop, state.currentSeason)) {
        return state;
      }
      
      // Find the plot
      const plot = state.plots.find(p => p.id === action.plotId);
      // If plot is already occupied, don't plant
      if (plot && plot.crop) {
        return state;
      }
      
      // Update inventory - only decrement by 1
      const updatedInventory = state.inventory.map(item => 
        item.crop.id === action.crop.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      
      // Update plots
      const updatedPlots = state.plots.map(plot => 
        plot.id === action.plotId
          ? { 
              ...plot, 
              crop: action.crop, 
              plantedAt: action.time, 
              growthStage: 'growing' as const
            }
          : plot
      );
      
      const newState = {
        ...state,
        plots: updatedPlots,
        inventory: updatedInventory,
        selectedPlot: null // Deselect plot after planting
      };
      
      saveGame(newState);
      return newState;
    }
    
    case 'HARVEST_CROP': {
      // Find the plot
      const plot = state.plots.find(p => p.id === action.plotId);
      if (!plot || !plot.crop || plot.growthStage !== 'ready') {
        return state;
      }
      
      // Calculate earnings
      const earnings = plot.crop.yield;
      
      // Update plots
      const updatedPlots = state.plots.map(p => 
        p.id === action.plotId
          ? { ...p, crop: null, plantedAt: null, growthStage: 'empty' as const }
          : p
      );
      
      const newState = {
        ...state,
        plots: updatedPlots,
        coins: state.coins + earnings
      };
      
      saveGame(newState);
      return newState;
    }
    
    case 'UPDATE_GROWTH': {
      // Update all plots growth stages
      const updatedPlots = state.plots.map(plot => {
        if (!plot.crop || !plot.plantedAt) return plot;
        
        const newGrowthStage = calculateGrowthStage(
          plot.crop, 
          plot.plantedAt, 
          action.time
        );
        
        return {
          ...plot,
          growthStage: newGrowthStage
        };
      });
      
      return {
        ...state,
        plots: updatedPlots
      };
    }
    
    case 'BUY_CROP': {
      const totalCost = action.crop.price * action.quantity;
      if (state.coins < totalCost) {
        return state; // Not enough coins
      }
      
      // Update inventory
      let inventoryUpdated = false;
      const updatedInventory = state.inventory.map(item => {
        if (item.crop.id === action.crop.id) {
          inventoryUpdated = true;
          return { ...item, quantity: item.quantity + action.quantity };
        }
        return item;
      });
      
      // If the crop wasn't in inventory, add it
      const finalInventory = inventoryUpdated 
        ? updatedInventory 
        : [...updatedInventory, { crop: action.crop, quantity: action.quantity }];
      
      const newState = {
        ...state,
        inventory: finalInventory,
        coins: state.coins - totalCost
      };
      
      saveGame(newState);
      return newState;
    }
    
    case 'SELL_CROP': {
      // Find the item in inventory
      const inventoryItem = state.inventory.find(item => item.crop.id === action.crop.id);
      if (!inventoryItem || inventoryItem.quantity < action.quantity) {
        return state; // Not enough crops to sell
      }
      
      // Calculate earnings
      const earnings = action.crop.price * 0.8 * action.quantity; // 80% of buying price
      
      // Update inventory
      const updatedInventory = state.inventory.map(item => 
        item.crop.id === action.crop.id
          ? { ...item, quantity: item.quantity - action.quantity }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity
      
      const newState = {
        ...state,
        inventory: updatedInventory,
        coins: state.coins + Math.floor(earnings)
      };
      
      saveGame(newState);
      return newState;
    }
    
    case 'CHANGE_SEASON': {
      const newState = {
        ...state,
        currentSeason: action.season
      };
      
      saveGame(newState);
      return newState;
    }
    
    case 'NEXT_DAY': {
      // Calculate the new season if needed
      let newSeason = state.currentSeason;
      if (state.dayCount % 28 === 0) {
        const currentSeasonIndex = seasons.indexOf(state.currentSeason);
        const nextSeasonIndex = (currentSeasonIndex + 1) % 4;
        newSeason = seasons[nextSeasonIndex];
      }
      
      const newState = {
        ...state,
        dayCount: state.dayCount + 1,
        currentSeason: newSeason
      };
      
      saveGame(newState);
      return newState;
    }
    
    case 'LOAD_GAME': {
      return action.state;
    }
    
    case 'SET_PLAYER_NAME': {
      const newState = {
        ...state,
        playerName: action.name
      };
      
      saveGame(newState);
      return newState;
    }
    
    default:
      return state;
  }
};

// Lista de estações em ordem
export const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
