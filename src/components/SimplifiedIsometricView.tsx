
import React, { useMemo } from 'react';
import { PlotState } from '../types/game';
import { getGrowthPercentage } from '../lib/plots';

interface SimplifiedIsometricViewProps {
  plot: PlotState;
  currentTime: number;
}

const SimplifiedIsometricView: React.FC<SimplifiedIsometricViewProps> = ({ plot, currentTime }) => {
  const growthPercentage = plot.crop && plot.plantedAt
    ? getGrowthPercentage(plot.crop.growthTime, plot.plantedAt, currentTime)
    : 0;

  // Enhanced grass appearance with improved texturing
  const plotStyle = {
    width: '50px',
    height: '30px',
    backgroundColor: plot.crop ? '#8FBC8F' : '#90EE90', // Base green color
    margin: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #3A5F0B', // Darker green border
    transform: 'rotateX(60deg) rotateZ(-45deg)',
    position: 'relative' as 'relative',
    overflow: 'hidden' as 'hidden',
  };

  const cropStyle = {
    fontSize: '1.5em',
    position: 'relative' as 'relative',
    zIndex: 2,
  };

  // Generate fixed grass texture patterns - fully deterministic based on position
  const grassTextures = useMemo(() => {
    const textures = [];
    if (!plot.crop) {
      // Generate fixed pattern based on position to ensure consistency
      const posHash = (plot.position.x * 100 + plot.position.y) + 
                      (plot.id.split('-').reduce((acc, val) => acc + parseInt(val || '0', 10), 0));
      
      // Add different types of grass textures
      for (let i = 0; i < 8; i++) {
        const seed = (posHash + i * 137) % 100; // Use position for deterministic seeding
        const size = (seed % 4) + 3; // 3-7 size
        
        // Ensure grass tufts are spaced out nicely and don't form obvious patterns
        const angle = (i / 8) * Math.PI * 2 + (posHash % 30) * 0.01;
        const radius = (seed % 40) + 5; // 5-45% radius from center
        
        const left = 50 + Math.cos(angle) * radius;
        const top = 50 + Math.sin(angle) * radius;
        
        const rotation = seed * 3.6; // 0-360 degrees
        
        textures.push({
          width: `${size}px`,
          height: `${size / 2}px`,
          backgroundColor: i % 2 === 0 ? '#3A5F0B' : '#4C7A10', // Alternate dark green shades
          position: 'absolute' as 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.6 + (seed % 30) * 0.01, // Slight opacity variation
          borderRadius: '50%',
        });
      }
    }
    return textures;
  }, [plot.id, plot.position, plot.crop]); // Only regenerate when plot id, position or crop changes

  return (
    <div style={plotStyle}>
      {/* Grass texture elements */}
      {grassTextures.map((style, index) => (
        <div key={`grass-${plot.id}-${index}`} style={style} />
      ))}
      
      {/* Crop element */}
      {plot.crop ? (
        <div style={cropStyle}>
          {plot.crop.image}
          <div style={{ fontSize: '0.6em', color: '#333' }}>{growthPercentage}%</div>
        </div>
      ) : null}
    </div>
  );
};

export default SimplifiedIsometricView;
