
import React from 'react';
import { motion } from 'framer-motion';
import { Crop, InventoryItem } from '../types/game';

interface CropSelectionProps {
  inventory: InventoryItem[];
  selectedCropId: string | null;
  onSelectCrop: (crop: Crop | null) => void;
  onBuyCrop: (crop: Crop, quantity: number) => void;
}

const CropSelection: React.FC<CropSelectionProps> = ({ 
  inventory, 
  selectedCropId, 
  onSelectCrop,
  onBuyCrop
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

  return (
    <motion.div 
      className="glass-panel p-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <h3 className="text-lg font-medium mb-3">Sementes</h3>
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {inventory.map((item) => (
          <motion.div
            key={item.crop.id}
            className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all
                       ${selectedCropId === item.crop.id 
                           ? 'border-primary bg-primary/10' 
                           : 'border-border bg-white/50 hover:bg-white/80'}`}
            onClick={() => handleSelectCrop(item.crop)}
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">{item.crop.image}</span>
              <span className="font-medium text-sm">{item.crop.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.quantity} disponível
              </span>
              
              <div className="flex items-center mt-2 text-xs">
                <span className="text-amber-500 mr-1">💰</span>
                <span>{item.crop.price}</span>
              </div>
            </div>
            
            {item.quantity < 5 && (
              <button 
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyCrop(item.crop, 5);
                }}
              >
                +
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default CropSelection;
