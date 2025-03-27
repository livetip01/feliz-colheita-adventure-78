
import React from 'react';
import { motion } from 'framer-motion';
import GameBoard from '../components/GameBoard';
import { useToast } from '../components/ui/use-toast';

const Index = () => {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-earth-100 to-earth-200 dark:from-earth-800 dark:to-earth-900"
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
