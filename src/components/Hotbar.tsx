
import React from 'react';
import { motion } from 'framer-motion';
import { Crop, InventoryItem } from '../types/game';

interface HotbarProps {
  items: InventoryItem[];
  selectedCropId: string | null;
  onSelectCrop: (crop: Crop) => void;
}

const Hotbar: React.FC<HotbarProps> = ({ items, selectedCropId, onSelectCrop }) => {
  return (
    <motion.div 
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <div className="bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/20">
        <div className="flex space-x-1">
          {items.map((item) => (
            <motion.div
              key={item.crop.id}
              className={`relative w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer 
                ${selectedCropId === item.crop.id 
                  ? 'bg-primary/30 border-2 border-primary' 
                  : 'bg-black/30 border border-white/30'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCrop(item.crop)}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl">{item.crop.image}</span>
                <span className="absolute bottom-0.5 right-1 text-xs font-bold text-white bg-black/50 px-1 rounded-full">
                  {item.quantity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Hotbar;
