
import { GameState } from '../types/game';

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
    try {
      const parsed = JSON.parse(savedGame);
      // Ensure unlockedCrops exists
      if (!parsed.unlockedCrops) {
        parsed.unlockedCrops = ['potato'];
      }
      // Ensure gridSize exists
      if (!parsed.gridSize) {
        parsed.gridSize = { rows: 4, cols: 4 };
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing saved game:', e);
      return null;
    }
  }
  return null;
};
