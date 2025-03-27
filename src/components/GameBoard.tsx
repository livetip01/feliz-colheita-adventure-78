
import React, { useReducer, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import PlotGrid from './PlotGrid';
import CropSelection from './CropSelection';
import Inventory from './Inventory';
import { gameReducer, initialGameState, crops } from '../lib/game';
import { toast } from '../components/ui/use-toast';

const GameBoard: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
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
    dispatch({ type: 'HARVEST_CROP', plotId, time: Date.now() });
    
    const plot = gameState.plots.find(p => p.id === plotId);
    if (plot?.crop) {
      toast({
        title: "Colheita realizada",
        description: `Você ganhou ${plot.crop.yield} moedas!`,
      });
    }
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

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header coins={gameState.coins} />
      
      <div className="mb-6">
        <CropSelection 
          inventory={gameState.inventory}
          selectedCropId={gameState.selectedCrop?.id || null}
          onSelectCrop={handleSelectCrop}
          onBuyCrop={handleBuyCrop}
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
      
      <Inventory 
        items={gameState.inventory}
        coins={gameState.coins}
        onBuyCrop={handleBuyCrop}
        onSellCrop={handleSellCrop}
      />
    </motion.div>
  );
};

export default GameBoard;
