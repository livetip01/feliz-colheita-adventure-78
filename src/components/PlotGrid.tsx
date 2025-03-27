
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Plot from './Plot';
import IsometricView from './IsometricView';
import { PlotState } from '../types/game';
import { Button } from "@/components/ui/button";
import { Grid, Grid3x3, LayoutGrid } from 'lucide-react';
import Hotbar from './Hotbar';

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
  const [viewMode, setViewMode] = useState<'grid' | 'isometric'>('isometric');
  
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

  // Função para lidar com a seleção de terreno
  const handleSelectPlot = (plotId: string) => {
    // Obter o terreno selecionado
    const plot = plots.find(p => p.id === plotId);
    
    // Se o terreno estiver vazio e pronto para plantar
    if (plot && plot.growthStage === 'empty') {
      // Plantar automaticamente
      onPlantCrop(plotId);
    } 
    // Se o terreno tem uma colheita pronta
    else if (plot && plot.growthStage === 'ready') {
      // Colher automaticamente
      onHarvestCrop(plotId);
    }
    // Caso contrário, apenas seleciona o terreno
    else {
      onSelectPlot(plotId);
    }
  };

  return (
    <div className="py-4 px-4">
      <div className="flex justify-end mb-4">
        <div className="bg-white/60 rounded-lg p-1 flex">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-3"
          >
            <Grid className="h-4 w-4 mr-1" />
            Grade
          </Button>
          <Button
            variant={viewMode === 'isometric' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('isometric')}
            className="px-3"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Isométrico
          </Button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <motion.div 
          className="py-2"
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
                  onSelect={handleSelectPlot}
                  onPlant={onPlantCrop}
                  onHarvest={onHarvestCrop}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <IsometricView
          plots={plots}
          onSelectPlot={handleSelectPlot}
        />
      )}
    </div>
  );
};

export default PlotGrid;
