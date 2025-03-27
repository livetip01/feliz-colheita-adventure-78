import React, { useReducer, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Plus } from 'lucide-react';
import Header from './Header';
import TimeDisplay from './TimeDisplay';
import Hotbar from './Hotbar';
import Shop from './Shop';
import IsometricView from './IsometricView';
import { gameReducer, initialGameState, crops, saveGame, loadGame, getPlotExpansionCost } from '../lib/game';
import { toast } from '../components/ui/use-toast';
import { Button } from './ui/button';

const DAY_DURATION = 120; // Duração de um dia em segundos (2 minutos)

const GameBoard: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const gameTimeRef = useRef<NodeJS.Timeout | null>(null);

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
    
    // Verificar se a cultura está desbloqueada
    if (!gameState.unlockedCrops?.includes(gameState.selectedCrop.id)) {
      toast({
        title: "Cultura bloqueada",
        description: "Você precisa desbloquear esta cultura na loja antes de plantá-la.",
        variant: "destructive",
      });
      return;
    }
    
    // Pegar o plot atual para verificação
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot) {
      toast({
        title: "Terreno não encontrado",
        description: "Ocorreu um erro ao encontrar o terreno.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se o terreno já tem cultura
    if (plot.crop) {
      toast({
        title: "Terreno ocupado",
        description: "Este terreno já possui uma cultura plantada.",
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
    // Verificar se a cultura está desbloqueada
    if (!gameState.unlockedCrops?.includes(crop.id)) {
      toast({
        title: "Cultura bloqueada",
        description: "Você precisa desbloquear esta cultura antes de comprá-la.",
        variant: "destructive",
      });
      return;
    }
    
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

  const handleUnlockCrop = (cropId: string) => {
    // Encontrar a cultura a ser desbloqueada
    const cropToUnlock = crops.find(crop => crop.id === cropId);
    if (!cropToUnlock) return;
    
    // Calcular o preço de desbloqueio (10x o preço unitário)
    const unlockPrice = cropToUnlock.price * 10;
    
    // Verificar se o jogador tem moedas suficientes
    if (gameState.coins < unlockPrice) {
      toast({
        title: "Moedas insuficientes",
        description: "Você não tem moedas suficientes para desbloquear esta cultura.",
        variant: "destructive",
      });
      return;
    }
    
    // Desbloquear a cultura
    dispatch({ type: 'UNLOCK_CROP', cropId });
    
    toast({
      title: "Cultura desbloqueada",
      description: `Você desbloqueou ${cropToUnlock.name}. Agora você pode comprar e plantar esta cultura.`,
    });
  };
  
  const handleIncreasePlotSize = () => {
    // Calcular o custo com base no tamanho atual da grade
    const cost = getPlotExpansionCost(gameState.gridSize);
    
    // Verificar se o jogador tem moedas suficientes
    if (gameState.coins < cost) {
      toast({
        title: "Moedas insuficientes",
        description: `Você precisa de ${cost} moedas para aumentar seu terreno.`,
        variant: "destructive",
      });
      return;
    }
    
    // Aumentar o tamanho do terreno
    dispatch({ type: 'INCREASE_PLOT_SIZE' });
    
    toast({
      title: "Terreno expandido",
      description: `Seu terreno agora é ${gameState.gridSize.rows + 1}x${gameState.gridSize.cols + 1}.`,
    });
  };

  const dayProgress = Math.min(100, Math.round((timeElapsed / DAY_DURATION) * 100));

  // Garanta que gameState.unlockedCrops existe antes de usar filter
  const hotbarItems = gameState.inventory.filter(item => 
    item.quantity > 0 && 
    (gameState.unlockedCrops?.includes(item.crop.id) || false) && 
    (item.crop.season === 'all' || item.crop.season === gameState.currentSeason)
  );
  
  // Calcular o custo para expandir o terreno
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
          onSelectPlot={handleSelectPlot}
          onPlantCrop={handlePlantCrop}
          onHarvestCrop={handleHarvestCrop}
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
