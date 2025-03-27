import { Crop, GameState, GameAction, PlotState, InventoryItem, Season } from '../types/game';
import { crops, isCropUnlocked, getUnlockPrice, canPlantInSeason, seasons, getSeasonName } from './crops';
import { createInitialPlots, calculateGrowthStage, getGrowthPercentage, expandPlots } from './plots';
import { saveGame, loadGame } from './storage';

// Export crops and utilities from this file so imports don't have to change in other parts of the app
export { 
  crops, 
  createInitialPlots, 
  getGrowthPercentage, 
  saveGame, 
  loadGame, 
  seasons,
  canPlantInSeason,
  getSeasonName,
  getUnlockPrice,
  isCropUnlocked
};

// Initial game state - Apenas batatas desbloqueadas inicialmente
export const initialGameState: GameState = {
  plots: createInitialPlots(4, 4),
  inventory: crops
    .filter(crop => crop.unlocked) // Apenas culturas desbloqueadas no inventário inicial
    .map(crop => ({ crop, quantity: 5 })), // Start with some potato seeds
  coins: 100,
  selectedCrop: null,
  selectedPlot: null,
  currentSeason: 'spring', // Começa na primavera
  dayCount: 1, // Começa no dia 1
  playerName: 'Fazendeiro',
  unlockedCrops: ['potato'], // Inicialmente apenas batatas desbloqueadas
  gridSize: { rows: 4, cols: 4 } // Tamanho inicial da grade
};

// Custo para aumentar o tamanho do lote (aumenta de acordo com o tamanho atual)
export const getPlotExpansionCost = (currentSize: { rows: number, cols: number }): number => {
  const area = currentSize.rows * currentSize.cols;
  return Math.floor(area * 25); // 25 moedas por terreno existente
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
      
      // Check if the crop is unlocked - ensure unlockedCrops exists
      if (!(state.unlockedCrops || []).includes(action.crop.id)) {
        return state;
      }
      
      // Find the plot
      const plot = state.plots.find(p => p.id === action.plotId);
      // If plot is already occupied, don't plant
      if (!plot || plot.crop) {
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
    
    case 'UNLOCK_CROP': {
      // Find the crop to unlock
      const cropToUnlock = crops.find(crop => crop.id === action.cropId);
      if (!cropToUnlock) {
        return state;
      }
      
      // Ensure unlockedCrops exists
      const unlockedCrops = state.unlockedCrops || ['potato'];
      
      // Check if already unlocked
      if (unlockedCrops.includes(action.cropId)) {
        return state;
      }
      
      // Calculate unlock price
      const unlockPrice = getUnlockPrice(cropToUnlock);
      
      // Check if player has enough coins
      if (state.coins < unlockPrice) {
        return state;
      }
      
      // Update inventory to include the new unlocked crop with initial quantity 0
      const alreadyInInventory = state.inventory.some(item => item.crop.id === action.cropId);
      const updatedInventory = alreadyInInventory 
        ? state.inventory 
        : [...state.inventory, { crop: cropToUnlock, quantity: 0 }];
      
      const newState = {
        ...state,
        coins: state.coins - unlockPrice,
        unlockedCrops: [...unlockedCrops, action.cropId],
        inventory: updatedInventory
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
          plot.crop.growthTime, 
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
      
      // Ensure unlockedCrops exists
      const unlockedCrops = state.unlockedCrops || ['potato'];
      
      // Check if the crop is unlocked
      if (!unlockedCrops.includes(action.crop.id)) {
        return state;
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
      // Ensure unlockedCrops exists in loaded state
      return {
        ...action.state,
        unlockedCrops: action.state.unlockedCrops || ['potato'],
        gridSize: action.state.gridSize || { rows: 4, cols: 4 }
      };
    }
    
    case 'SET_PLAYER_NAME': {
      const newState = {
        ...state,
        playerName: action.name
      };
      
      saveGame(newState);
      return newState;
    }
    
    case 'INCREASE_PLOT_SIZE': {
      // Calcular o custo com base no tamanho atual
      const cost = getPlotExpansionCost(state.gridSize);
      
      // Verificar se o jogador tem moedas suficientes
      if (state.coins < cost) {
        return state;
      }
      
      // Aumentar a grade em 1 linha e 1 coluna
      const newRows = state.gridSize.rows + 1;
      const newCols = state.gridSize.cols + 1;
      
      // Expandir os terrenos
      const expandedPlots = expandPlots(
        state.plots, 
        state.gridSize.rows, 
        state.gridSize.cols,
        newRows,
        newCols
      );
      
      const newState = {
        ...state,
        plots: expandedPlots,
        gridSize: { rows: newRows, cols: newCols },
        coins: state.coins - cost
      };
      
      saveGame(newState);
      return newState;
    }
    
    default:
      return state;
  }
};
