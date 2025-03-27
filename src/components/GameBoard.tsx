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
  const [isRainyDay, setIsRainyDay] = useState(false);

  // Load game on mount
  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', state: savedGame });
    }
    
    // Initialize rainy day based on season
    determineRainyDay(gameState.currentSeason);
  }, []);

  // Determine if it's a rainy day based on the season
  const determineRainyDay = (season: string) => {
    const rainChance = {
      spring: 20,
      summer: 10,
      winter: 40,
      fall: 30
    }[season];
    
    const isRainy = Math.random() * 100 < rainChance;
    setIsRainyDay(isRainy);
  };

  // Setup game time with smoother increments
  useEffect(() => {
    // Clear previous interval if exists
    if (gameTimeRef.current) {
      clearInterval(gameTimeRef.current);
    }
    
    // Use much faster updates for smoother time progression
    // Update every 100ms (10 times per second) instead of every second
    const ticksPerSecond = 10;
    const incrementPerTick = 1 / ticksPerSecond;
    
    const advanceGameTime = () => {
      setTimeElapsed(prev => {
        const newTime = prev + incrementPerTick;
        
        if (newTime >= DAY_DURATION) {
          dispatch({ type: 'NEXT_DAY' });
          saveGame(gameState);
          determineRainyDay(gameState.currentSeason);
          return 0;
        }
        
        return newTime;
      });
    };
    
    gameTimeRef.current = setInterval(advanceGameTime, 1000 / ticksPerSecond);
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
  };

  const handlePlantCrop = (plotId: string) => {
    console.log("Attempting to plant on plot:", plotId);
    
    if (!gameState.selectedCrop) {
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
      return;
    }
    
    const inventoryItem = gameState.inventory.find(
      item => item.crop.id === gameState.selectedCrop?.id
    );
    
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      console.log("Not enough seeds");
      return;
    }
    
    if (!gameState.unlockedCrops?.includes(gameState.selectedCrop.id)) {
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
      return;
    }
    
    console.log("Harvesting crop:", plot.crop.name, "from plot:", plotId);
    dispatch({ type: 'HARVEST_CROP', plotId, time: Date.now() });
    
    // Play harvest sound
    const harvestSound = document.getElementById('harvest-sound') as HTMLAudioElement;
    if (harvestSound) {
      harvestSound.currentTime = 0;
      harvestSound.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const handleBuyCrop = (crop: ReturnType<typeof crops.find>, quantity: number) => {
    if (!gameState.unlockedCrops?.includes(crop.id)) {
      console.log("Crop is locked");
      return;
    }
    
    if (gameState.coins < crop.price * quantity) {
      console.log("Not enough coins");
      return;
    }
    
    dispatch({ type: 'BUY_CROP', crop, quantity });
  };

  const handleUnlockCrop = (cropId: string) => {
    const cropToUnlock = crops.find(crop => crop.id === cropId);
    if (!cropToUnlock) return;
    
    const unlockPrice = cropToUnlock.price * 10;
    
    if (gameState.coins < unlockPrice) {
      console.log("Not enough coins");
      return;
    }
    
    dispatch({ type: 'UNLOCK_CROP', cropId });
  };

  const handleIncreasePlotSize = () => {
    const cost = getPlotExpansionCost(gameState.gridSize);
    
    if (gameState.coins < cost) {
      console.log("Not enough coins");
      return;
    }
    
    dispatch({ type: 'INCREASE_PLOT_SIZE' });
  };

  const handleChangeSeason = (season: string) => {
    dispatch({ type: 'CHANGE_SEASON', season: season as any });
    determineRainyDay(season);
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
          isRainyDay={isRainyDay}
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
      
      <div className="glass-panel mb-6 overflow-hidden h-96">
        <IsometricView 
          plots={gameState.plots}
          onSelectPlot={(plotId) => {
            console.log("Plot clicked:", plotId);
            handlePlantCrop(plotId);
          }}
          onPlantCrop={handlePlantCrop}
          onHarvestCrop={handleHarvestCrop}
          dayProgress={dayProgress}
          isRainyDay={isRainyDay}
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
