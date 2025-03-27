
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

  // Enhanced grass appearance with texturing
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

  // Generate fixed grass texture patterns using useMemo to prevent regeneration
  const grassTextures = useMemo(() => {
    const textures = [];
    if (!plot.crop) {
      // Generate fixed pattern based on plot id to ensure consistency
      const plotIdHash = plot.id.split('-').reduce((acc, val) => acc + parseInt(val || '0', 10), 0);
      
      // Add some fixed grass textures
      for (let i = 0; i < 6; i++) {
        const seed = (plotIdHash + i * 137) % 100; // Use plot id for deterministic seeding
        const size = (seed % 6) + 4; // 4-10 size
        const left = (seed % 80) + 5; // 5-85% left position
        const top = ((seed * 7) % 80) + 5; // 5-85% top position
        const rotation = seed * 3.6; // 0-360 degrees
        
        textures.push({
          width: `${size}px`,
          height: `${size / 2}px`,
          backgroundColor: '#3A5F0B', // Darker green
          position: 'absolute' as 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.6,
          borderRadius: '50%',
        });
      }
    }
    return textures;
  }, [plot.id, plot.crop]); // Only regenerate when plot id or crop changes

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
