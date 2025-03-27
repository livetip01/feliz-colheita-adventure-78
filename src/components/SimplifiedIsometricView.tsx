
import React from 'react';
import { motion } from 'framer-motion';
import { PlotState } from '../types/game';

interface IsometricViewProps {
  plots: PlotState[];
  onSelectPlot: (id: string) => void;
}

const SimplifiedIsometricView: React.FC<IsometricViewProps> = ({ plots, onSelectPlot }) => {
  // Encontrar as dimensões da fazenda
  const maxRow = Math.max(...plots.map(p => p.position.y));
  const maxCol = Math.max(...plots.map(p => p.position.x));
  
  // Tamanho dos blocos e ângulo para a visualização isométrica
  const blockSize = 80;
  
  // Cores para diferentes estágios de crescimento
  const stageColors = {
    empty: '#a97c50',
    growing: '#90ee90',
    ready: '#32cd32'
  };
  
  return (
    <div className="overflow-auto p-8">
      <div 
        className="relative mx-auto"
        style={{ 
          width: (maxCol + 1) * blockSize * 1.5, 
          height: (maxRow + 1) * blockSize * 0.75 + blockSize,
          perspective: '1000px'
        }}
      >
        {plots.map((plot) => {
          const x = plot.position.x * blockSize * 1.5;
          const y = plot.position.y * blockSize * 0.75;
          const isSelected = false; // Implementar lógica de seleção
          
          return (
            <motion.div
              key={plot.id}
              className="absolute cursor-pointer"
              style={{
                width: blockSize,
                height: blockSize,
                transformStyle: 'preserve-3d',
                transform: 'rotateX(60deg) rotateZ(45deg)',
                top: y,
                left: x,
              }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onSelectPlot(plot.id)}
            >
              {/* Base do terreno (lado superior) */}
              <div 
                className={`absolute inset-0 border ${isSelected ? 'border-primary' : 'border-black/20'}`}
                style={{ 
                  backgroundColor: plot.crop ? stageColors[plot.growthStage] : '#8B5E3C',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Planta (apenas para estágios growing e ready) */}
                {plot.crop && plot.growthStage !== 'empty' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="text-3xl transform -rotate-45"
                      style={{ 
                        filter: plot.growthStage === 'growing' ? 'grayscale(70%)' : 'none',
                        opacity: plot.growthStage === 'growing' ? 0.7 : 1,
                        transform: 'rotateZ(-45deg) rotateX(-60deg)' // Corrigir rotação para o emoji ficar reto
                      }}
                    >
                      {plot.crop.image}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SimplifiedIsometricView;
