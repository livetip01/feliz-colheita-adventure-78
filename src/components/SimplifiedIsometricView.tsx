import React from 'react';
import { PlotState } from '../types/game';
import { getGrowthPercentage } from '../lib/plots'; // Make sure this is imported correctly

interface SimplifiedIsometricViewProps {
  plot: PlotState;
  currentTime: number;
}

const SimplifiedIsometricView: React.FC<SimplifiedIsometricViewProps> = ({ plot, currentTime }) => {
  const growthPercentage = plot.crop && plot.plantedAt
    ? getGrowthPercentage(plot.crop.growthTime, plot.plantedAt, currentTime)
    : 0;

  const plotStyle = {
    width: '50px',
    height: '30px',
    backgroundColor: plot.crop ? 'lightgreen' : 'lightgray',
    margin: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid black',
    transform: 'rotateX(60deg) rotateZ(-45deg)',
  };

  const cropStyle = {
    fontSize: '1.5em',
  };

  return (
    <div style={plotStyle}>
      {plot.crop ? (
        <div style={cropStyle}>
          {plot.crop.image}
          <div>{growthPercentage}%</div>
        </div>
      ) : null}
    </div>
  );
};

export default SimplifiedIsometricView;
