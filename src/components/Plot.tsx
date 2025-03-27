
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlotState, Crop } from '../types/game';
import { getGrowthPercentage } from '../lib/game';

interface PlotProps {
  plot: PlotState;
  selected: boolean;
  onSelect: (id: string) => void;
  onPlant: (id: string) => void;
  onHarvest: (id: string) => void;
}

const Plot: React.FC<PlotProps> = ({ 
  plot, 
  selected, 
  onSelect, 
  onPlant, 
  onHarvest 
}) => {
  const [showHarvestEffect, setShowHarvestEffect] = useState(false);
  const [growthPercent, setGrowthPercent] = useState(0);
  
  // Update growth percentage every second
  useEffect(() => {
    if (!plot.crop || !plot.plantedAt) {
      setGrowthPercent(0);
      return;
    }

    const updateGrowth = () => {
      const percent = getGrowthPercentage(plot.crop!, plot.plantedAt!, Date.now());
      setGrowthPercent(percent);
    };

    updateGrowth();
    const interval = setInterval(updateGrowth, 1000);
    return () => clearInterval(interval);
  }, [plot.crop, plot.plantedAt]);

  const handleClick = () => {
    if (plot.growthStage === 'ready') {
      setShowHarvestEffect(true);
      onHarvest(plot.id);
      setTimeout(() => setShowHarvestEffect(false), 1000);
    } else if (plot.growthStage === 'empty') {
      if (selected) {
        onPlant(plot.id);
      } else {
        onSelect(plot.id);
      }
    }
  };

  const renderCrop = () => {
    if (!plot.crop) return null;

    let scale = 0.5;
    if (plot.growthStage === 'growing') {
      // Scale based on growth percentage (0.3 - 0.9)
      scale = 0.3 + (growthPercent / 100) * 0.6;
    } else if (plot.growthStage === 'ready') {
      scale = 1;
    }

    return (
      <motion.div 
        className={`absolute inset-0 flex items-center justify-center ${
          plot.growthStage === 'ready' ? 'crop-ready' : 'crop-growing'
        }`}
        initial={{ scale: 0.3, opacity: 0.7 }}
        animate={{ scale, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-4xl">{plot.crop.image}</span>
        
        {plot.growthStage === 'growing' && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3/4">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${growthPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      className={`plot plot-soil w-20 h-20 md:w-24 md:h-24 ${
        plot.growthStage === 'ready' ? 'plot-ready' : 
        plot.growthStage === 'growing' ? 'plot-growing' : ''
      }`}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {selected && (
        <motion.div 
          className="selection-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      {renderCrop()}
      
      {showHarvestEffect && (
        <>
          <motion.div 
            className="harvest-shine"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div 
            className="harvest-coins"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            +{plot.crop?.yield}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Plot;
