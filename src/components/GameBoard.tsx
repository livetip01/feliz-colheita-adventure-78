import React, { useReducer, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import PlotGrid from './PlotGrid';
import TimeDisplay from './TimeDisplay';
import Hotbar from './Hotbar';
import Shop from './Shop';
import IsometricView from './IsometricView';
import { gameReducer, initialGameState, crops, saveGame, loadGame } from '../lib/game';
import { toast } from '../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAY_DURATION = 120; // Duração de um dia em segundos (2 minutos)

const GameBoard: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const gameTimeRef = useRef<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', state: savedGame });
      toast({
        title: "Jogo carregado",
        description: "Seu jogo foi carregado automaticamente.",
      });
    }
  }, []);

  useEffect(() => {
    const advanceGameTime = () => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        if (newTime >= DAY_DURATION) {
          dispatch({ type: 'NEXT_DAY' });
          saveGame(gameState);
          toast({
            title: "Novo dia",
            description: `Dia ${gameState.dayCount + 1}. Seu jogo foi salvo automaticamente.`,
          });
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

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_GROWTH', time: Date.now() });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCrop = (crop: ReturnType<typeof crops.find>) => {
    dispatch({ type: 'SELECT_CROP', crop });
  };

  const handleSelectPlot = (plotId: string) => {
    dispatch({ type: 'SELECT_PLOT', plotId });
  };

  const handlePlantCrop = (plotId: string) => {
    if (!gameState.selectedCrop) {
      toast({
        title: "Selecione uma semente",
        description: "Você precisa selecionar uma semente para plantar.",
        variant: "destructive",
      });
      return;
    }
    
    const inventoryItem = gameState.inventory.find(
      item => item.crop.id === gameState.selectedCrop?.id
    );
    
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      toast({
        title: "Sementes insuficientes",
        description: "Você não tem sementes suficientes para plantar.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ 
      type: 'PLANT_CROP', 
      plotId, 
      crop: gameState.selectedCrop, 
      time: Date.now() 
    });
    
    toast({
      title: "Plantado com sucesso",
      description: `Você plantou ${gameState.selectedCrop.name}.`,
    });
  };

  const handleHarvestCrop = (plotId: string) => {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot?.crop) return;
    
    dispatch({ type: 'HARVEST_CROP', plotId, time: Date.now() });
    
    toast({
      title: "Colheita realizada",
      description: `Você ganhou ${plot.crop.yield} moedas!`,
    });
  };

  const handleBuyCrop = (crop: ReturnType<typeof crops.find>, quantity: number) => {
    if (gameState.coins < crop.price * quantity) {
      toast({
        title: "Moedas insuficientes",
        description: "Você não tem moedas suficientes para comprar estas sementes.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'BUY_CROP', crop, quantity });
    
    toast({
      title: "Compra realizada",
      description: `Você comprou ${quantity} ${crop.name}.`,
    });
  };

  const dayProgress = Math.min(100, Math.round((timeElapsed / DAY_DURATION) * 100));

  const hotbarItems = gameState.inventory.filter(item => 
    item.quantity > 0 && 
    (item.crop.season === 'all' || item.crop.season === gameState.currentSeason)
  );

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
      
      <div className="glass-panel mb-6 overflow-hidden">
        <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as '2d' | '3d')} className="mb-2">
          <TabsList className="grid w-32 grid-cols-2">
            <TabsTrigger value="2d">2D</TabsTrigger>
            <TabsTrigger value="3d">3D</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {viewMode === '3d' ? (
          <IsometricView 
            plots={gameState.plots}
            onSelectPlot={handleSelectPlot}
          />
        ) : (
          <PlotGrid 
            plots={gameState.plots}
            selectedPlotId={gameState.selectedPlot}
            onSelectPlot={handleSelectPlot}
            onPlantCrop={handlePlantCrop}
            onHarvestCrop={handleHarvestCrop}
          />
        )}
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
        />
      </motion.div>
    </motion.div>
  );
};

export default GameBoard;
