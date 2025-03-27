import React, { useReducer, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Plus } from 'lucide-react';
import Header from './Header';
import TimeDisplay from './TimeDisplay';
import Hotbar from './Hotbar';
import Shop from './Shop';
import IsometricView from './IsometricView';
import { gameReducer, initialGameState, crops, saveGame, loadGame, getPlotExpansionCost } from '../lib/game';
import { Button } from './ui/button';

// Increased from 120 to 240 seconds (4 minutes) for smoother transitions
const DAY_DURATION = 240; 

const GameBoard: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const gameTimeRef = useRef<NodeJS.Timeout | null>(null);

  // Load game on mount
  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', state: savedGame });
      // Removed toast notification
    }
  }, []);

  // Setup game time
  useEffect(() => {
    const advanceGameTime = () => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        if (newTime >= DAY_DURATION) {
          dispatch({ type: 'NEXT_DAY' });
          saveGame(gameState);
          // Removed toast notification
          return 0;
        }
        
        return newTime;
      });
    };
    
    gameTimeRef.current = setInterval(advanceGameTime, 1000);
    return () => {
      if (gameTimeRef.current) {
        clearInterval(gameTimeRef.current);
      }
    };
  }, [gameState.dayCount, gameState.currentSeason]);

  // Update growth
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_GROWTH', time: Date.now() });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCrop = (crop: ReturnType<typeof crops.find>) => {
    console.log("Selected crop:", crop.name);
    dispatch({ type: 'SELECT_CROP', crop });
    // Removed toast notification
  };

  const handlePlantCrop = (plotId: string) => {
    console.log("Attempting to plant on plot:", plotId);
    
    if (!gameState.selectedCrop) {
      // Removed toast notification, kept the console log
      console.log("No seed selected");
      return;
    }
    
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot) {
      console.error("Plot not found:", plotId);
      return;
    }
    
    if (plot.crop) {
      console.log("Plot already has a crop:", plot.crop.name);
      // Removed toast notification
      return;
    }
    
    const inventoryItem = gameState.inventory.find(
      item => item.crop.id === gameState.selectedCrop?.id
    );
    
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      // Removed toast notification
      console.log("Not enough seeds");
      return;
    }
    
    if (!gameState.unlockedCrops?.includes(gameState.selectedCrop.id)) {
      // Removed toast notification
      console.log("Crop is locked");
      return;
    }
    
    console.log("Planting crop:", gameState.selectedCrop.name, "on plot:", plotId);
    dispatch({ 
      type: 'PLANT_CROP', 
      plotId, 
      crop: gameState.selectedCrop, 
      time: Date.now() 
    });
    
    // Removed toast notification
    
    // Play plant sound
    const plantSound = document.getElementById('plant-sound') as HTMLAudioElement;
    if (plantSound) {
      plantSound.currentTime = 0;
      plantSound.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const handleHarvestCrop = (plotId: string) => {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot?.crop) {
      console.log("No crop to harvest on plot:", plotId);
      return;
    }
    
    if (plot.growthStage !== 'ready') {
      console.log("Crop not ready for harvest:", plot.growthStage);
      // Removed toast notification
      return;
    }
    
    console.log("Harvesting crop:", plot.crop.name, "from plot:", plotId);
    dispatch({ type: 'HARVEST_CROP', plotId, time: Date.now() });
    
    // Removed toast notification
    
    // Play harvest sound
    const harvestSound = document.getElementById('harvest-sound') as HTMLAudioElement;
    if (harvestSound) {
      harvestSound.currentTime = 0;
      harvestSound.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const handleBuyCrop = (crop: ReturnType<typeof crops.find>, quantity: number) => {
    if (!gameState.unlockedCrops?.includes(crop.id)) {
      // Removed toast notification
      console.log("Crop is locked");
      return;
    }
    
    if (gameState.coins < crop.price * quantity) {
      // Removed toast notification
      console.log("Not enough coins");
      return;
    }
    
    dispatch({ type: 'BUY_CROP', crop, quantity });
    
    // Removed toast notification
  };

  const handleUnlockCrop = (cropId: string) => {
    const cropToUnlock = crops.find(crop => crop.id === cropId);
    if (!cropToUnlock) return;
    
    const unlockPrice = cropToUnlock.price * 10;
    
    if (gameState.coins < unlockPrice) {
      // Removed toast notification
      console.log("Not enough coins");
      return;
    }
    
    dispatch({ type: 'UNLOCK_CROP', cropId });
    
    // Removed toast notification
  };

  const handleIncreasePlotSize = () => {
    const cost = getPlotExpansionCost(gameState.gridSize);
    
    if (gameState.coins < cost) {
      // Removed toast notification
      console.log("Not enough coins");
      return;
    }
    
    dispatch({ type: 'INCREASE_PLOT_SIZE' });
    
    // Removed toast notification
  };

  const dayProgress = Math.min(100, Math.round((timeElapsed / DAY_DURATION) * 100));

  const hotbarItems = gameState.inventory.filter(item => 
    item.quantity > 0 && 
    (gameState.unlockedCrops?.includes(item.crop.id) || false) && 
    (item.crop.season === 'all' || item.crop.season === gameState.currentSeason)
  );

  const expansionCost = getPlotExpansionCost(gameState.gridSize);

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header coins={gameState.coins} playerName={gameState.playerName} />
      
      <div className="mb-4">
        <TimeDisplay 
          currentSeason={gameState.currentSeason}
          dayCount={gameState.dayCount}
          dayProgress={dayProgress}
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Terreno ({gameState.gridSize.rows}x{gameState.gridSize.cols})
        </h2>
        <Button 
          onClick={handleIncreasePlotSize}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Grid3X3 className="w-4 h-4" />
          <Plus className="w-4 h-4" />
          <span>Expandir ({expansionCost} moedas)</span>
        </Button>
      </div>
      
      <div className="glass-panel mb-6 overflow-hidden">
        <IsometricView 
          plots={gameState.plots}
          onSelectPlot={(plotId) => {
            console.log("Plot clicked:", plotId);
            handlePlantCrop(plotId);
          }}
          onPlantCrop={handlePlantCrop}
          onHarvestCrop={handleHarvestCrop}
          dayProgress={dayProgress}
        />
      </div>
      
      <Hotbar 
        items={hotbarItems}
        selectedCropId={gameState.selectedCrop?.id || null}
        onSelectCrop={handleSelectCrop}
      />
      
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Shop 
          crops={crops.filter(crop => crop.season === gameState.currentSeason || crop.season === 'all')}
          currentSeason={gameState.currentSeason}
          coins={gameState.coins}
          onBuyCrop={handleBuyCrop}
          unlockedCrops={gameState.unlockedCrops || []}
          onUnlockCrop={handleUnlockCrop}
        />
      </motion.div>
    </motion.div>
  );
};

export default GameBoard;
