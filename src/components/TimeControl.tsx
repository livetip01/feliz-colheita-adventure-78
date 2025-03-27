
import React from 'react';
import { motion } from 'framer-motion';
import { Season } from '../types/game';
import { getSeasonName } from '../lib/game';
import { Calendar, Clock, Save } from 'lucide-react';

interface TimeControlProps {
  currentSeason: Season;
  dayCount: number;
  onNextDay: () => void;
  onChangeSeason: (season: Season) => void;
  onSaveGame: () => void;
}

const TimeControl: React.FC<TimeControlProps> = ({ 
  currentSeason, 
  dayCount, 
  onNextDay, 
  onChangeSeason,
  onSaveGame
}) => {
  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
  
  const seasonColors: Record<Season, string> = {
    spring: 'from-green-100 to-green-200',
    summer: 'from-yellow-100 to-yellow-200',
    fall: 'from-orange-100 to-orange-200',
    winter: 'from-blue-100 to-blue-200'
  };
  
  const seasonIcons: Record<Season, string> = {
    spring: '🌱',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️'
  };

  return (
    <motion.div 
      className={`glass-panel p-4 bg-gradient-to-r ${seasonColors[currentSeason]}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl mr-2">{seasonIcons[currentSeason]}</span>
          <div>
            <h3 className="font-medium">{getSeasonName(currentSeason)}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Dia {dayCount}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <select
            className="bg-white/80 border border-gray-300 rounded px-2 py-1 text-sm"
            value={currentSeason}
            onChange={(e) => onChangeSeason(e.target.value as Season)}
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {getSeasonName(season)}
              </option>
            ))}
          </select>
          
          <button
            className="bg-primary text-white px-3 py-1 rounded text-sm flex items-center"
            onClick={onNextDay}
          >
            <Clock className="h-3 w-3 mr-1" />
            Próximo dia
          </button>
          
          <button
            className="bg-secondary text-white px-3 py-1 rounded text-sm flex items-center"
            onClick={onSaveGame}
          >
            <Save className="h-3 w-3 mr-1" />
            Salvar jogo
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeControl;
