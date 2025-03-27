
import React from 'react';
import { motion } from 'framer-motion';
import { Crop, InventoryItem, Season } from '../types/game';
import { canPlantInSeason, getSeasonName } from '../lib/game';
import { Clock } from 'lucide-react';

interface CropSelectionProps {
  inventory: InventoryItem[];
  selectedCropId: string | null;
  onSelectCrop: (crop: Crop | null) => void;
  onBuyCrop: (crop: Crop, quantity: number) => void;
  currentSeason: Season;
}

const CropSelection: React.FC<CropSelectionProps> = ({ 
  inventory, 
  selectedCropId, 
  onSelectCrop,
  onBuyCrop,
  currentSeason
}) => {
  const handleSelectCrop = (crop: Crop) => {
    onSelectCrop(selectedCropId === crop.id ? null : crop);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <motion.div 
      className="glass-panel p-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Sementes</h3>
        <div className="text-sm text-muted-foreground">
          Estação: <span className="font-medium">{getSeasonName(currentSeason)}</span>
        </div>
      </div>
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {inventory.map((inventoryItem) => {
          const canPlant = canPlantInSeason(inventoryItem.crop, currentSeason);
          
          return (
            <motion.div
              key={inventoryItem.crop.id}
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all
                         ${selectedCropId === inventoryItem.crop.id 
                             ? 'border-primary bg-primary/10' 
                             : 'border-border bg-white/50 hover:bg-white/80'}
                         ${!canPlant ? 'opacity-60' : ''}`}
              onClick={() => canPlant && handleSelectCrop(inventoryItem.crop)}
              variants={item}
              whileHover={canPlant ? { scale: 1.05 } : {}}
              whileTap={canPlant ? { scale: 0.95 } : {}}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-1">{inventoryItem.crop.image}</span>
                <span className="font-medium text-sm">{inventoryItem.crop.name}</span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTime(inventoryItem.crop.growthTime)}</span>
                </div>
                <span className="text-xs mt-1">
                  {inventoryItem.quantity} disponível
                </span>
                
                <div className="flex items-center mt-2 text-xs">
                  <span className="text-amber-500 mr-1">💰</span>
                  <span>{inventoryItem.crop.price}</span>
                </div>
              </div>
              
              {inventoryItem.quantity < 5 && canPlant && (
                <button 
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuyCrop(inventoryItem.crop, 5);
                  }}
                >
                  +
                </button>
              )}
              
              {!canPlant && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <span className="text-white text-xs font-medium px-2 py-1 bg-red-500 rounded">
                    Não disponível nesta estação
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default CropSelection;
