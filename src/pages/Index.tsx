
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameBoard from '../components/GameBoard';
import { useToast } from '../components/ui/use-toast';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night' | 'dawn'>('day');
  
  // Update background based on time of day
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 6 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('sunset');
      } else if (hour >= 20 || hour < 5) {
        setTimeOfDay('night');
      } else {
        setTimeOfDay('dawn');
      }
    };
    
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Get background gradient based on time of day
  const getBackgroundGradient = () => {
    switch (timeOfDay) {
      case 'day':
        return 'from-blue-300 to-green-100 dark:from-blue-900 dark:to-earth-800';
      case 'sunset':
        return 'from-orange-300 to-rose-200 dark:from-orange-900 dark:to-rose-900';
      case 'night':
        return 'from-gray-900 to-blue-950 dark:from-gray-950 dark:to-blue-950';
      case 'dawn':
        return 'from-pink-200 to-blue-300 dark:from-pink-900 dark:to-blue-900';
      default:
        return 'from-earth-100 to-earth-200 dark:from-earth-800 dark:to-earth-900';
    }
  };

  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-b ${getBackgroundGradient()} transition-colors duration-1000`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <GameBoard />
      
      <footer className="text-center py-4 text-xs text-muted-foreground">
        <p>Colheita Feliz - Inspirado no jogo original da Mentez</p>
      </footer>
    </motion.div>
  );
};

export default Index;
