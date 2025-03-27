
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameBoard from '../components/GameBoard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const Index = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(70);
  
  // Apply sound settings to all audio elements
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = soundVolume / 100;
      audio.muted = !soundEnabled;
    });
  }, [soundEnabled, soundVolume]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-blue-100 to-green-50"
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
