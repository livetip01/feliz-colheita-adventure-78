
import React, { useReducer, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import PlotGrid from './PlotGrid';
import CropSelection from './CropSelection';
import Inventory from './Inventory';
import Shop from './Shop';
import TimeControl from './TimeControl';
import { gameReducer, initialGameState, crops, saveGame, loadGame } from '../lib/game';
import { toast } from '../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Season } from '../types/game';

const GameBoard: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [showLoadModal, setShowLoadModal] = useState(false);
  
  // Check for saved game on first load
  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      setShowLoadModal(true);
    }
  }, []);
  
  // Update growth stages every second
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

  const handleSellCrop = (crop: ReturnType<typeof crops.find>, quantity: number) => {
    const inventoryItem = gameState.inventory.find(item => item.crop.id === crop.id);
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      toast({
        title: "Quantidade insuficiente",
        description: "Você não tem sementes suficientes para vender.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'SELL_CROP', crop, quantity });
    
    toast({
      title: "Venda realizada",
      description: `Você vendeu ${quantity} ${crop.name}.`,
    });
  };
  
  const handleNextDay = () => {
    dispatch({ type: 'NEXT_DAY' });
    
    toast({
      title: "Novo dia",
      description: `Dia ${gameState.dayCount + 1} começou.`,
    });
  };
  
  const handleChangeSeason = (season: Season) => {
    dispatch({ type: 'CHANGE_SEASON', season });
    
    toast({
      title: "Estação alterada",
      description: `A estação agora é ${season}.`,
    });
  };
  
  const handleSaveGame = () => {
    saveGame(gameState);
    
    toast({
      title: "Jogo salvo",
      description: "Seu progresso foi salvo com sucesso.",
    });
  };
  
  const handleLoadGame = () => {
    const savedGame = loadGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', state: savedGame });
      
      toast({
        title: "Jogo carregado",
        description: "Seu jogo foi carregado com sucesso.",
      });
    }
    setShowLoadModal(false);
  };
  
  const handleNewGame = () => {
    setShowLoadModal(false);
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header coins={gameState.coins} playerName={gameState.playerName} />
      
      <div className="mb-4">
        <TimeControl 
          currentSeason={gameState.currentSeason}
          dayCount={gameState.dayCount}
          onNextDay={handleNextDay}
          onChangeSeason={handleChangeSeason}
          onSaveGame={handleSaveGame}
        />
      </div>
      
      <div className="mb-6">
        <CropSelection 
          inventory={gameState.inventory}
          selectedCropId={gameState.selectedCrop?.id || null}
          onSelectCrop={handleSelectCrop}
          onBuyCrop={handleBuyCrop}
          currentSeason={gameState.currentSeason}
        />
      </div>
      
      <div className="glass-panel mb-6 overflow-hidden">
        <PlotGrid 
          plots={gameState.plots}
          selectedPlotId={gameState.selectedPlot}
          onSelectPlot={handleSelectPlot}
          onPlantCrop={handlePlantCrop}
          onHarvestCrop={handleHarvestCrop}
        />
      </div>
      
      <Tabs defaultValue="inventory" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="shop">Loja</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <Inventory 
            items={gameState.inventory}
            coins={gameState.coins}
            onBuyCrop={handleBuyCrop}
            onSellCrop={handleSellCrop}
          />
        </TabsContent>
        <TabsContent value="shop">
          <Shop 
            crops={crops}
            currentSeason={gameState.currentSeason}
            coins={gameState.coins}
            onBuyCrop={handleBuyCrop}
          />
        </TabsContent>
      </Tabs>
      
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">Jogo salvo encontrado</h2>
            <p className="mb-6">Existe um jogo salvo. Você gostaria de carregar ou começar um novo jogo?</p>
            
            <div className="flex space-x-4">
              <button 
                className="bg-primary text-white px-4 py-2 rounded flex-1"
                onClick={handleLoadGame}
              >
                Carregar jogo
              </button>
              <button 
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded flex-1"
                onClick={handleNewGame}
              >
                Novo jogo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default GameBoard;
