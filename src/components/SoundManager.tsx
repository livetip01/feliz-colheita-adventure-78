
import React, { useEffect } from 'react';

interface SoundManagerProps {
  soundEnabled: boolean;
  soundVolume: number;
}

const SoundManager: React.FC<SoundManagerProps> = ({ soundEnabled, soundVolume }) => {
  // Handle playing sounds
  const playSound = (id: string) => {
    if (!soundEnabled) return;
    
    const audio = document.getElementById(id) as HTMLAudioElement;
    if (audio) {
      // Reset the audio to the beginning
      audio.currentTime = 0;
      
      // Set volume
      audio.volume = soundVolume / 100;
      
      // Try to play the sound
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    }
  };

  // Expose the playSound function to the window object
  useEffect(() => {
    (window as any).playSound = playSound;
    
    return () => {
      delete (window as any).playSound;
    };
  }, [soundEnabled, soundVolume]);

  useEffect(() => {
    // Create new audio elements with both MP3 and WAV sources
    const createAudioElement = (id: string, mp3Path: string, wavPath: string) => {
      // Remove existing audio element if it exists
      const existingAudio = document.getElementById(id);
      if (existingAudio) {
        existingAudio.remove();
      }
      
      // Create new audio element
      const audio = document.createElement('audio');
      audio.id = id;
      audio.preload = 'auto';
      
      // Add MP3 source
      const mp3Source = document.createElement('source');
      mp3Source.src = mp3Path;
      mp3Source.type = 'audio/mpeg';
      audio.appendChild(mp3Source);
      
      // Add WAV source as fallback
      const wavSource = document.createElement('source');
      wavSource.src = wavPath;
      wavSource.type = 'audio/wav';
      audio.appendChild(wavSource);
      
      // Set volume and muted state
      audio.volume = soundVolume / 100;
      audio.muted = !soundEnabled;
      
      // Add to document
      document.body.appendChild(audio);
      
      return audio;
    };
    
    // Create sound elements
    createAudioElement('plant-sound', '/sounds/plant.mp3', '/sounds/plant.wav');
    createAudioElement('harvest-sound', '/sounds/harvest.mp3', '/sounds/harvest.wav');
    
    console.log('Sound elements created with multiple formats');
    
    // Clean up
    return () => {
      const plantSound = document.getElementById('plant-sound');
      const harvestSound = document.getElementById('harvest-sound');
      
      if (plantSound) plantSound.remove();
      if (harvestSound) harvestSound.remove();
    };
  }, []);
  
  // Update sound settings when they change
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = soundVolume / 100;
      audio.muted = !soundEnabled;
    });
    
    console.log(`Sound settings updated: enabled=${soundEnabled}, volume=${soundVolume}`);
  }, [soundEnabled, soundVolume]);

  return null; // This component doesn't render anything
};

export default SoundManager;
