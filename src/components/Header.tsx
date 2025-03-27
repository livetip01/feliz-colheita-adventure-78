
import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  coins: number;
}

const Header: React.FC<HeaderProps> = ({ coins }) => {
  return (
    <motion.header 
      className="glass-panel p-4 mb-6 flex justify-between items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2">
        <motion.div 
          className="text-2xl"
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, repeatDelay: 10 }}
        >
          🌱
        </motion.div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-foliage-700 to-foliage-500 bg-clip-text text-transparent">
          Colheita Feliz
        </h1>
      </div>
      
      <motion.div 
        className="flex items-center bg-amber-100 px-4 py-2 rounded-full shadow-sm"
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-amber-500 mr-2">💰</span>
        <span className="font-bold">{coins}</span>
      </motion.div>
    </motion.header>
  );
};

export default Header;
