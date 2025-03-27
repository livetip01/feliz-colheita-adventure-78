
import React from 'react';
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

  // Generate random grass texture patterns
  const grassTextures = [];
  if (!plot.crop) {
    // Add some random darker grass textures
    for (let i = 0; i < 6; i++) {
      const size = Math.random() * 8 + 4;
      const left = Math.random() * 80 + 5;
      const top = Math.random() * 80 + 5;
      grassTextures.push({
        width: `${size}px`,
        height: `${size / 2}px`,
        backgroundColor: '#3A5F0B', // Darker green
        position: 'absolute' as 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        transform: 'rotate(' + (Math.random() * 360) + 'deg)',
        opacity: 0.6,
        borderRadius: '50%',
      });
    }
  }

  return (
    <div style={plotStyle}>
      {/* Grass texture elements */}
      {grassTextures.map((style, index) => (
        <div key={`grass-${index}`} style={style} />
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
