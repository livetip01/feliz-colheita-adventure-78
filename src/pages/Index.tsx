
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameBoard from '../components/GameBoard';
import { useToast } from '../components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'sunset' | 'night' | 'earlyMorning'>('day');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(70);
  
  // Update background based on time of day from game progress
  useEffect(() => {
    // This is a placeholder, the real source will be from GameBoard's dayProgress
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 7) {
        setTimeOfDay('dawn');
      } else if (hour >= 7 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('sunset');
      } else if (hour >= 20 || hour < 2) {
        setTimeOfDay('night');
      } else if (hour >= 2 && hour < 5) {
        setTimeOfDay('earlyMorning');
      }
    };
    
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Apply sound settings to all audio elements
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = soundVolume / 100;
      audio.muted = !soundEnabled;
    });
  }, [soundEnabled, soundVolume]);
  
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
      case 'earlyMorning':
        return 'from-indigo-900 to-purple-900 dark:from-indigo-950 dark:to-purple-950';
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
      
      <div className="fixed bottom-4 right-4 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white/80 dark:bg-gray-800/80">
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px]">
            <SheetHeader>
              <SheetTitle>Configurações de Som</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Som habilitado</span>
                <Switch 
                  checked={soundEnabled} 
                  onCheckedChange={setSoundEnabled} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Volume</span>
                  <span className="text-sm">{soundVolume}%</span>
                </div>
                <Slider
                  value={[soundVolume]}
                  onValueChange={(value) => setSoundVolume(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!soundEnabled}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <footer className="text-center py-4 text-xs text-muted-foreground">
        <p>Colheita Feliz - Inspirado no jogo original da Mentez</p>
      </footer>
      
      {/* Audio elements */}
      <audio id="plant-sound" src="/sounds/plant.mp3" preload="auto"></audio>
      <audio id="harvest-sound" src="/sounds/harvest.mp3" preload="auto"></audio>
    </motion.div>
  );
};

export default Index;
