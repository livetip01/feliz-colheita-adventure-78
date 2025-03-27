
import React from 'react';
import { motion } from 'framer-motion';
import { Crop } from '../types/game';
import { getGrowthPercentage } from '../lib/game';

interface SimplifiedIsometricViewProps {
  crop: Crop | null;
  plantedAt: number | null;
  growthStage: 'empty' | 'growing' | 'ready';
  onClick?: () => void;
  position?: { x: number; y: number };
}

const SimplifiedIsometricView: React.FC<SimplifiedIsometricViewProps> = ({
  crop,
  plantedAt,
  growthStage,
  onClick,
  position
}) => {
  // Calcular a posição isométrica com base nas coordenadas x e y da grade
  const x = position ? position.x * 50 - position.y * 50 : 0;
  const y = position ? (position.x * 25 + position.y * 25) : 0;

  // Calcular o progresso de crescimento para plantas em crescimento
  const growthPercentage = crop && plantedAt ? 
    getGrowthPercentage(crop, plantedAt, Date.now()) : 0;

  // Definir a escala com base no estágio de crescimento
  let scale = 1;
  if (growthStage === 'growing') {
    scale = 0.3 + (growthPercentage / 100) * 0.7; // Escala de 0.3 a 1.0 durante o crescimento
  } else if (growthStage === 'empty') {
    scale = 0;
  }

  // Adicionar elementos decorativos (árvores, flores, etc) com base na posição
  // Isso vai criar um padrão único para cada posição baseado em um hash simples
  const addDecorations = () => {
    if (!position) return null;
    
    // Hash simples da posição
    const hash = (position.x * 7 + position.y * 13) % 100;
    
    // Apenas adicionar decorações em posições específicas fora da área de plantio
    if (position.x < 0 || position.x > 3 || position.y < 0 || position.y > 3) {
      if (hash < 15) {
        // Árvore grande
        return (
          <div className="absolute" style={{ 
            bottom: '10px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: position.y
          }}>
            <div className="text-5xl">🌳</div>
          </div>
        );
      } else if (hash < 30) {
        // Árvore pequena
        return (
          <div className="absolute" style={{ 
            bottom: '10px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: position.y
          }}>
            <div className="text-4xl">🌲</div>
          </div>
        );
      } else if (hash < 45) {
        // Arbusto
        return (
          <div className="absolute" style={{ 
            bottom: '5px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: position.y
          }}>
            <div className="text-3xl">🌿</div>
          </div>
        );
      } else if (hash < 60) {
        // Flores
        return (
          <div className="absolute" style={{ 
            bottom: '2px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: position.y
          }}>
            <div className="text-2xl">🌷</div>
          </div>
        );
      } else if (hash < 70) {
        // Pedras
        return (
          <div className="absolute" style={{ 
            bottom: '5px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: position.y
          }}>
            <div className="text-2xl">🪨</div>
          </div>
        );
      } else if (hash < 85) {
        // Cogumelos
        return (
          <div className="absolute" style={{ 
            bottom: '2px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: position.y
          }}>
            <div className="text-xl">🍄</div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div 
      className="relative" 
      style={{ 
        transform: `translate(${x}px, ${y}px)`,
        width: '100px', 
        height: '100px',
        cursor: onClick ? 'pointer' : 'default',
        zIndex: position ? position.y : 0
      }}
      onClick={onClick}
    >
      {/* Base do terreno (bloco isométrico) */}
      <div 
        className="absolute w-full h-1/2 bg-earth-300 bottom-0 transform-gpu"
        style={{ 
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          background: growthStage === 'ready' 
            ? 'linear-gradient(to bottom, #90b36d, #6a8c4f)' 
            : 'linear-gradient(to bottom, #a88b6d, #8c7050)'
        }}
      />

      {/* Sombra suave */}
      <div 
        className="absolute w-full h-1/2 bottom-0 transform-gpu"
        style={{ 
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          background: 'rgba(0,0,0,0.1)',
          zIndex: 1
        }}
      />

      {/* Linhas de grade */}
      <div 
        className="absolute w-full h-1/2 bottom-0 transform-gpu"
        style={{ 
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 2
        }}
      />

      {/* Planta */}
      {crop && (
        <motion.div 
          className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/3 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale }}
          transition={{ 
            type: 'spring', 
            stiffness: 70,
            duration: 0.5
          }}
          style={{
            zIndex: 3
          }}
        >
          <div className="text-4xl">{crop.image}</div>
        </motion.div>
      )}

      {/* Indicador de pronto para colheita */}
      {growthStage === 'ready' && (
        <motion.div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: -15, opacity: 1 }}
          transition={{ 
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 1
          }}
          style={{ zIndex: 10 }}
        >
          <div className="text-xl">✨</div>
        </motion.div>
      )}

      {/* Decorações (árvores, flores, etc) */}
      {addDecorations()}
    </div>
  );
};

export default SimplifiedIsometricView;
