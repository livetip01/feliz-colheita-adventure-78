
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crop, Season } from '../types/game';
import { canPlantInSeason, getSeasonName, getUnlockPrice } from '../lib/game';
import { Clock, Coins, Filter, HelpCircle, Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShopProps {
  crops: Crop[];
  currentSeason: Season;
  coins: number;
  onBuyCrop: (crop: Crop, quantity: number) => void;
  unlockedCrops: string[];
  onUnlockCrop: (cropId: string) => void;
}

const Shop: React.FC<ShopProps> = ({ 
  crops, 
  currentSeason, 
  coins, 
  onBuyCrop,
  unlockedCrops,
  onUnlockCrop
}) => {
  const [filter, setFilter] = useState<'all' | Season>(currentSeason);
  
  const filteredCrops = filter === 'all' 
    ? crops 
    : crops.filter(crop => crop.season === filter || crop.season === 'all');
  
  // Animações
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const isCropUnlocked = (cropId: string) => unlockedCrops.includes(cropId);

  return (
    <motion.div 
      className="glass-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Loja de Sementes</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
            <Coins className="h-4 w-4 text-amber-500 mr-1" />
            <span className="font-medium">{coins}</span>
          </div>
          
          <div className="relative inline-block">
            <select
              className="bg-white border border-gray-300 rounded px-3 py-1 appearance-none pr-8"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | Season)}
            >
              <option value="all">Todas estações</option>
              <option value="spring">Primavera</option>
              <option value="summer">Verão</option>
              <option value="fall">Outono</option>
              <option value="winter">Inverno</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="text-sm mb-3 text-muted-foreground">
        Estação atual: <span className="font-medium">{getSeasonName(currentSeason)}</span>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredCrops.map((crop) => {
          const canPlant = canPlantInSeason(crop, currentSeason);
          const isUnlocked = isCropUnlocked(crop.id);
          const unlockPrice = getUnlockPrice(crop);
          const canUnlock = coins >= unlockPrice;
          const affordable = coins >= crop.price;
          
          return (
            <motion.div 
              key={crop.id}
              className={`border rounded-lg p-4 ${
                isUnlocked && canPlant ? 'bg-white/80' : 'bg-gray-100/80'
              } ${!isUnlocked ? 'border-dashed border-gray-400' : ''}`}
              variants={item}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{isUnlocked ? crop.image : '🔒'}</span>
                  <div>
                    <h3 className="font-medium">{crop.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(crop.growthTime)}</span>
                    </div>
                  </div>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p>{crop.description}</p>
                        <p className="mt-1">
                          Estação: {crop.season === 'all' ? 'Todas' : getSeasonName(crop.season as Season)}
                        </p>
                        <p className="mt-1">
                          Lucro estimado: {crop.yield - crop.price} moedas
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {isUnlocked ? (
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 text-amber-500 mr-1" />
                    <span>{crop.price}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        affordable && canPlant
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => affordable && canPlant && onBuyCrop(crop, 1)}
                      disabled={!affordable || !canPlant}
                    >
                      Comprar 1
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        affordable && coins >= crop.price * 5 && canPlant
                          ? 'bg-primary-dark text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => affordable && coins >= crop.price * 5 && canPlant && onBuyCrop(crop, 5)}
                      disabled={!affordable || coins < crop.price * 5 || !canPlant}
                    >
                      Comprar 5
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">Bloqueado</span>
                    </div>
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-amber-500 mr-1" />
                      <span>{unlockPrice}</span>
                    </div>
                  </div>
                  <button
                    className={`w-full px-3 py-2 rounded text-sm font-medium ${
                      canUnlock
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => canUnlock && onUnlockCrop(crop.id)}
                    disabled={!canUnlock}
                  >
                    Desbloquear por {unlockPrice} moedas
                  </button>
                </div>
              )}
              
              {isUnlocked && !canPlant && (
                <div className="mt-2 text-sm text-red-500">
                  ❌ Não pode ser plantado nesta estação
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Shop;
