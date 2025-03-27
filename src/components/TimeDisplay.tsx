
import React from 'react';
import { motion } from 'framer-motion';
import { Season } from '../types/game';
import { getSeasonName } from '../lib/game';
import { Calendar, Clock, Sun } from 'lucide-react';
import { Progress } from './ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeDisplayProps {
  currentSeason: Season;
  dayCount: number;
  dayProgress: number;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  currentSeason, 
  dayCount, 
  dayProgress
}) => {
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
  
  // Determinar período do dia com base no progresso
  const getDayPeriod = () => {
    if (dayProgress < 25) return '🌅 Manhã';
    if (dayProgress < 50) return '☀️ Meio-dia';
    if (dayProgress < 75) return '🌇 Tarde';
    return '🌙 Noite';
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
        
        <div className="flex flex-col items-end">
          <div className="text-sm mb-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{getDayPeriod()}</span>
          </div>
          <div className="w-32">
            <Progress value={dayProgress} className="h-2" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeDisplay;
