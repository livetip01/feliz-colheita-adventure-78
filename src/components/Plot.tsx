import React, { useRef, useEffect } from 'react';
import { PlotState } from '../types/game';
import { getGrowthPercentage } from '../lib/plots';
import { motion } from 'framer-motion';

interface PlotProps {
  plot: PlotState;
  isSelected: boolean;
  onClick: () => void;
  currentTime: number;
}

const Plot: React.FC<PlotProps> = ({ plot, isSelected, onClick, currentTime }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && plotRef.current) {
      plotRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isSelected]);

  const getPlotStyle = () => {
    if (!plot.crop) {
      return 'bg-amber-100 hover:bg-amber-200';
    }
    
    if (plot.growthStage === 'ready') {
      return 'bg-green-300 hover:bg-green-400';
    }
    
    return 'bg-green-100 hover:bg-green-200';
  };

  const getPlotContent = () => {
    if (!plot.crop) {
      return <span className="text-2xl">🟫</span>;
    }
    
    if (plot.growthStage === 'ready') {
      return <span className="text-3xl">{plot.crop.image}</span>;
    }
    
    // Show growth progress
    const growthPercentage = plot.plantedAt 
      ? getGrowthPercentage(plot.crop.growthTime, plot.plantedAt, currentTime)
      : 0;
    
    return (
      <div className="flex flex-col items-center">
        <span className="text-xl opacity-50">{plot.crop.image}</span>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div 
            className="bg-green-500 h-1.5 rounded-full" 
            style={{ width: `${growthPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      ref={plotRef}
      className={`
        w-20 h-20 rounded-lg flex items-center justify-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${getPlotStyle()}
        ${isSelected ? 'ring-4 ring-primary ring-offset-2' : ''}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {getPlotContent()}
    </motion.div>
  );
};

export default Plot;
