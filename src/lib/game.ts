
import { Crop, GameState, GameAction, PlotState, InventoryItem } from '../types/game';

// Initial crops
export const crops: Crop[] = [
  {
    id: 'tomato',
    name: 'Tomate',
    growthTime: 30, // 30 seconds for testing, would be longer in a real game
    price: 10,
    yield: 25,
    image: '🍅'
  },
  {
    id: 'carrot',
    name: 'Cenoura',
    growthTime: 20,
    price: 5,
    yield: 15,
    image: '🥕'
  },
  {
    id: 'corn',
    name: 'Milho',
    growthTime: 40,
    price: 15,
    yield: 40,
    image: '🌽'
  },
  {
    id: 'strawberry',
    name: 'Morango',
    growthTime: 25,
    price: 20,
    yield: 50,
    image: '🍓'
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
  inventory: crops.map(crop => ({ crop, quantity: 5 })), // Start with some seeds
  coins: 100,
  selectedCrop: null,
  selectedPlot: null
};

// Calculate growth stage based on time elapsed
const calculateGrowthStage = (crop: Crop, plantedAt: number, currentTime: number) => {
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
      
      // Update inventory
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
              growthStage: 'growing'
            }
          : plot
      );
      
      return {
        ...state,
        plots: updatedPlots,
        inventory: updatedInventory,
        selectedPlot: null // Deselect plot after planting
      };
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
          ? { ...p, crop: null, plantedAt: null, growthStage: 'empty' }
          : p
      );
      
      return {
        ...state,
        plots: updatedPlots,
        coins: state.coins + earnings
      };
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
      
      return {
        ...state,
        inventory: finalInventory,
        coins: state.coins - totalCost
      };
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
      
      return {
        ...state,
        inventory: updatedInventory,
        coins: state.coins + Math.floor(earnings)
      };
    }
    
    default:
      return state;
  }
};
