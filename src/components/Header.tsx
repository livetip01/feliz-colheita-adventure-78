
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, User } from 'lucide-react';

interface HeaderProps {
  coins: number;
  playerName: string;
}

const Header: React.FC<HeaderProps> = ({ coins, playerName }) => {
  return (
    <motion.header 
      className="flex justify-between items-center mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <motion.div
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl mr-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🌱
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold">Colheita Feliz</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            <span>{playerName}</span>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="flex items-center bg-amber-100 px-4 py-2 rounded-full"
        whileHover={{ scale: 1.05 }}
      >
        <Coins className="text-amber-500 mr-2 h-5 w-5" />
        <span className="font-bold">{coins}</span>
      </motion.div>
    </motion.header>
  );
};

export default Header;
