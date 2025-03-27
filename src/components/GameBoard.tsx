
import React, { useReducer, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import PlotGrid from './PlotGrid';
import CropSelection from './CropSelection';
import Inventory from './Inventory';
import Shop from './Shop';
import TimeDisplay from './TimeDisplay';
import { gameReducer, initialGameState, crops, saveGame, loadGame } from '../lib/game';
import { toast } from '../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Season } from '../types/game';

const DAY_DURATION = 120; // Duração de um dia em segundos (2 minutos)

const GameBoard: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const gameTimeRef = useRef<NodeJS.Timeout | null>(null);
  
  // Carregar o jogo salvo automaticamente
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
  
  // Iniciar o temporizador de jogo
  useEffect(() => {
    // Função para avançar o tempo do jogo
    const advanceGameTime = () => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // Se completou um dia inteiro
        if (newTime >= DAY_DURATION) {
          // Avançar para o próximo dia
          dispatch({ type: 'NEXT_DAY' });
          
          // Salvar o jogo automaticamente ao final do dia
          saveGame(gameState);
          
          // Notificar o jogador
          toast({
            title: "Novo dia",
            description: `Dia ${gameState.dayCount + 1}. Seu jogo foi salvo automaticamente.`,
          });
          
          // Resetar o contador de tempo
          return 0;
        }
        
        return newTime;
      });
    };
    
    // Configurar o intervalo para atualizar a cada segundo
    gameTimeRef.current = setInterval(advanceGameTime, 1000);
    
    // Limpar o intervalo ao desmontar o componente
    return () => {
      if (gameTimeRef.current) {
        clearInterval(gameTimeRef.current);
      }
    };
  }, [gameState.dayCount, gameState.currentSeason]);
  
  // Atualizar o crescimento das plantas a cada segundo
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

  // Calcular progresso do dia atual (0-100%)
  const dayProgress = Math.min(100, Math.round((timeElapsed / DAY_DURATION) * 100));

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-6"
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
    </motion.div>
  );
};

export default GameBoard;
