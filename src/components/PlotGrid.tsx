
import React from 'react';
import { motion } from 'framer-motion';
import Plot from './Plot';
import { PlotState } from '../types/game';

interface PlotGridProps {
  plots: PlotState[];
  selectedPlotId: string | null;
  onSelectPlot: (id: string) => void;
  onPlantCrop: (id: string) => void;
  onHarvestCrop: (id: string) => void;
}

const PlotGrid: React.FC<PlotGridProps> = ({ 
  plots, 
  selectedPlotId,
  onSelectPlot,
  onPlantCrop,
  onHarvestCrop
}) => {
  // Find max rows and columns in plots
  const maxRow = Math.max(...plots.map(p => p.position.y));
  const maxCol = Math.max(...plots.map(p => p.position.x));
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="py-6 px-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div 
        className="grid gap-3 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))`,
          maxWidth: `${(maxCol + 1) * 120}px`
        }}
      >
        {plots.map((plot) => (
          <motion.div key={plot.id} variants={item}>
            <Plot
              plot={plot}
              selected={selectedPlotId === plot.id}
              onSelect={onSelectPlot}
              onPlant={onPlantCrop}
              onHarvest={onHarvestCrop}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlotGrid;
