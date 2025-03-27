
import { PlotState } from '../types/game';

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

// Calculate growth stage based on time elapsed
export const calculateGrowthStage = (growthTime: number, plantedAt: number, currentTime: number): 'empty' | 'growing' | 'ready' => {
  if (!plantedAt) return 'empty';
  
  const elapsedTime = (currentTime - plantedAt) / 1000; // to seconds
  if (elapsedTime >= growthTime) {
    return 'ready';
  }
  return 'growing';
};

// Calculate growth percentage (0-100)
export const getGrowthPercentage = (growthTime: number, plantedAt: number, currentTime: number) => {
  if (!plantedAt) return 0;
  
  const elapsedTime = (currentTime - plantedAt) / 1000; // to seconds
  const percentage = Math.min(100, Math.floor((elapsedTime / growthTime) * 100));
  return percentage;
};

// Expand existing plots by adding new rows and columns
export const expandPlots = (currentPlots: PlotState[], currentRows: number, currentCols: number, newRows: number, newCols: number): PlotState[] => {
  const expandedPlots = [...currentPlots];
  
  // Add new columns to existing rows
  for (let y = 0; y < currentRows; y++) {
    for (let x = currentCols; x < newCols; x++) {
      expandedPlots.push({
        id: `plot-${x}-${y}`,
        crop: null,
        plantedAt: null,
        growthStage: 'empty',
        position: { x, y }
      });
    }
  }
  
  // Add new rows
  for (let y = currentRows; y < newRows; y++) {
    for (let x = 0; x < newCols; x++) {
      expandedPlots.push({
        id: `plot-${x}-${y}`,
        crop: null,
        plantedAt: null,
        growthStage: 'empty',
        position: { x, y }
      });
    }
  }
  
  return expandedPlots;
};
