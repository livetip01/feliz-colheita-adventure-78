
import React from 'react';
import { motion } from 'framer-motion';
import { Crop, InventoryItem } from '../types/game';

interface InventoryProps {
  items: InventoryItem[];
  coins: number;
  onBuyCrop: (crop: Crop, quantity: number) => void;
  onSellCrop: (crop: Crop, quantity: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  items, 
  coins,
  onBuyCrop,
  onSellCrop
}) => {
  return (
    <motion.div
      className="glass-panel p-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Inventário</h3>
        <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
          <span className="text-amber-500 mr-1">💰</span>
          <span className="font-medium">{coins}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <motion.div
            key={item.crop.id}
            className="relative p-3 rounded-lg border border-border bg-white/60 hover:bg-white/90"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{item.crop.image}</span>
              <span className="font-medium text-sm">{item.crop.name}</span>
              <span className="text-xs text-muted-foreground mb-1">
                {item.quantity} disponível
              </span>
              
              <div className="flex space-x-2 mt-1">
                <button 
                  className="text-xs px-2 py-1 bg-secondary/80 rounded-md"
                  onClick={() => onBuyCrop(item.crop, 1)}
                >
                  Comprar
                </button>
                
                <button 
                  className="text-xs px-2 py-1 bg-secondary/80 rounded-md"
                  onClick={() => onSellCrop(item.crop, 1)}
                  disabled={item.quantity <= 0}
                >
                  Vender
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Inventory;
