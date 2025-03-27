
import React from 'react';
import Plot from './Plot';
import { PlotState } from '../types/game';
import SimplifiedIsometricView from './SimplifiedIsometricView';

interface PlotGridProps {
  plots: PlotState[];
  selectedPlotId: string | null;
  onSelectPlot: (plotId: string) => void;
  onPlantCrop: (plotId: string) => void;
  onHarvestCrop: (plotId: string) => void;
}

const PlotGrid: React.FC<PlotGridProps> = ({
  plots,
  selectedPlotId,
  onSelectPlot,
  onPlantCrop,
  onHarvestCrop
}) => {
  // Obter as dimensões da grade a partir dos plots existentes
  const gridWidth = Math.max(...plots.map(p => p.position.x)) + 1;
  const gridHeight = Math.max(...plots.map(p => p.position.y)) + 1;
  
  // Get the current time for growth calculations
  const currentTime = Date.now();
  
  // Criar uma grade expandida para incluir elementos decorativos ao redor
  const createExpandedGrid = () => {
    const grid = [];
    const expansion = 3; // Adicionar 3 células extras em cada direção
    
    for (let y = -expansion; y < gridHeight + expansion; y++) {
      for (let x = -expansion; x < gridWidth + expansion; x++) {
        // Verificar se esta é uma célula de plot real
        const isPlot = x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
        
        if (isPlot) {
          // Esta é uma célula de plot real
          const plot = plots.find(p => p.position.x === x && p.position.y === y);
          if (plot) {
            grid.push(
              <div 
                key={`plot-${x}-${y}`}
                className="relative"
                style={{ 
                  gridColumn: x + expansion + 1, 
                  gridRow: y + expansion + 1,
                  zIndex: y + 1
                }}
              >
                <Plot
                  plot={plot}
                  isSelected={plot.id === selectedPlotId}
                  onClick={() => onSelectPlot(plot.id)}
                  currentTime={currentTime}
                />
              </div>
            );
          }
        } else {
          // Esta é uma célula decorativa ao redor
          grid.push(
            <div 
              key={`deco-${x}-${y}`}
              className="relative"
              style={{ 
                gridColumn: x + expansion + 1, 
                gridRow: y + expansion + 1,
                zIndex: y + 1
              }}
            >
              <SimplifiedIsometricView
                plot={{ 
                  id: `deco-${x}-${y}`, 
                  crop: null, 
                  plantedAt: null, 
                  growthStage: 'empty', 
                  position: { x, y } 
                }}
                currentTime={currentTime}
              />
            </div>
          );
        }
      }
    }
    
    return grid;
  };

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ 
        minHeight: '400px',
        paddingBottom: '50px',
        paddingTop: '50px'
      }}
    >
      <div 
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 50px)',
          gridTemplateRows: 'repeat(10, 50px)',
          transform: 'rotateX(60deg) rotateZ(45deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {createExpandedGrid()}
      </div>
    </div>
  );
};

export default PlotGrid;
