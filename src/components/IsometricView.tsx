
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { PlotState } from '../types/game';
import * as THREE from 'three';

interface IsometricViewProps {
  plots: PlotState[];
  onSelectPlot: (id: string) => void;
  onPlantCrop: (id: string) => void;
  onHarvestCrop: (id: string) => void;
}

// Componente para o terreno base (grama melhorada)
const Ground = ({ size }: { size: [number, number] }) => {
  // Criar textura de grama mais rica e detalhada
  const [width, height] = size;
  const groundWidth = width + 6; // Expanded ground
  const groundHeight = height + 6; // Expanded ground
  
  return (
    <>
      {/* Base layer - light green */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[groundWidth, groundHeight]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>
      
      {/* Second layer - texture pattern with darker green */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.09, 0]} 
        receiveShadow
      >
        <planeGeometry args={[groundWidth, groundHeight]} />
        <meshStandardMaterial 
          color="#3A5F0B" 
          opacity={0.3} 
          transparent 
          depthWrite={false}
        />
      </mesh>
      
      {/* Random grass tufts for texture */}
      <GrassTufts size={[groundWidth, groundHeight]} />
    </>
  );
};

// Component for generating random grass tufts
const GrassTufts = ({ size }: { size: [number, number] }) => {
  const [tufts, setTufts] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    const [width, height] = size;
    const items: JSX.Element[] = [];
    
    // Generate a bunch of small grass tufts across the field
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * width;
      const z = (Math.random() - 0.5) * height;
      
      // Vary the grass color slightly
      const colorVariance = Math.random() * 0.2;
      const color = new THREE.Color(0.2 + colorVariance, 0.5 + colorVariance, 0.1);
      
      items.push(
        <GrassTuft 
          key={`tuft-${i}`}
          position={[x, 0, z]} 
          color={color}
          scale={Math.random() * 0.4 + 0.2}
        />
      );
    }
    
    setTufts(items);
  }, [size]);
  
  return <>{tufts}</>;
};

// Individual grass tuft
const GrassTuft = ({ position, color, scale }: { position: [number, number, number], color: THREE.Color, scale: number }) => {
  return (
    <mesh position={[position[0], position[1], position[2]]} scale={scale}>
      <boxGeometry args={[0.1, 0.05, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Componente para decorações (flores, pedras, etc)
const Decorations = ({ size }: { size: [number, number] }) => {
  const [width, height] = size;
  const [decorations, setDecorations] = useState<JSX.Element[]>([]);
  
  // Gerar decorações uma única vez na montagem
  useEffect(() => {
    const items: JSX.Element[] = [];
    
    // Posicionar algumas flores aleatórias em volta do terreno
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * (width + 2);
      const z = (Math.random() - 0.5) * (height + 2);
      
      // Apenas colocar decorações fora da área de plantio
      if (Math.abs(x) > width/2 - 1 || Math.abs(z) > height/2 - 1) {
        items.push(
          <FlowerDecoration 
            key={`flower-${i}`}
            position={[x, 0, z]} 
            type={Math.floor(Math.random() * 3)}
          />
        );
      }
    }
    
    setDecorations(items);
  }, [width, height]);
  
  return <>{decorations}</>;
};

// Decoração de flor simples
const FlowerDecoration = ({ position, type }: { position: [number, number, number], type: number }) => {
  const colors = ['#FF69B4', '#FFFF00', '#FFFFFF'];
  const emoji = ['🌸', '🌼', '🌺'];
  
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <Html position={[0, 0.3, 0]} style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}>
        <div className="text-xl">{emoji[type]}</div>
      </Html>
    </group>
  );
};

const PlotMesh = ({ 
  plot, 
  onSelect,
  onPlant,
  onHarvest,
  position 
}: { 
  plot: PlotState; 
  onSelect: () => void;
  onPlant: () => void;
  onHarvest: () => void;
  position: [number, number, number];
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Cores para diferentes estágios de crescimento
  const colors = {
    empty: '#8B5E3C', // marrom para terra
    growing: '#90EE90', // verde claro para plantas crescendo
    ready: '#32CD32' // verde mais escuro para plantas prontas
  };
  
  // Altura da planta baseada no estágio de crescimento
  const height = plot.growthStage === 'empty' ? 0.1 : 
                plot.growthStage === 'growing' ? 0.3 : 0.5;
                
  // Animação simples para plantas prontas para colheita
  useFrame(({ clock }) => {
    if (meshRef.current && plot.growthStage === 'ready') {
      meshRef.current.position.y = height/2 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
    }
  });
  
  return (
    <group position={position}>
      {/* Terra lavrada */}
      <mesh 
        position={[0, -0.05, 0]} 
        onClick={() => {
          if (plot.growthStage === 'ready') {
            onHarvest();
          } else if (plot.growthStage === 'empty') {
            onSelect(); // Select first, then user can choose to plant
          } else {
            onSelect(); // Just select growing plots
          }
        }}
        receiveShadow
      >
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#A97C50" />
        {/* Linhas da terra lavrada */}
        <mesh position={[0, 0.06, 0]} rotation={[0, Math.PI/4, 0]}>
          <boxGeometry args={[0.85, 0.02, 0.85]} />
          <meshStandardMaterial color="#8B4513" wireframe />
        </mesh>
      </mesh>
      
      {/* Planta */}
      {plot.crop && plot.growthStage !== 'empty' && (
        <>
          {/* Caule da planta */}
          <mesh
            ref={meshRef}
            position={[0, height/2, 0]}
            castShadow
          >
            <boxGeometry args={[0.15, height, 0.15]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          
          {/* Folhas da planta */}
          {plot.growthStage === 'growing' && (
            <>
              <mesh position={[0.1, height/2, 0.1]} rotation={[0, 0, Math.PI/4]}>
                <boxGeometry args={[0.2, 0.02, 0.1]} />
                <meshStandardMaterial color="#32CD32" />
              </mesh>
              <mesh position={[-0.1, height/2 - 0.1, -0.05]} rotation={[0, 0, -Math.PI/4]}>
                <boxGeometry args={[0.2, 0.02, 0.1]} />
                <meshStandardMaterial color="#32CD32" />
              </mesh>
            </>
          )}
          
          {/* Fruto/parte comestível da planta */}
          {plot.growthStage === 'ready' && (
            <Html position={[0, height + 0.2, 0]} style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}>
              <div className="text-2xl" style={{transform: 'scale(1.2)'}}>{plot.crop.image}</div>
            </Html>
          )}
        </>
      )}
      
      {/* Brilho em volta das plantas prontas */}
      {plot.crop && plot.growthStage === 'ready' && (
        <pointLight
          position={[0, height + 0.5, 0]}
          intensity={0.5}
          distance={1.5}
          color="#FFFF99"
        />
      )}
    </group>
  );
};

const IsometricFarm = ({ plots, onSelectPlot, onPlantCrop, onHarvestCrop }: IsometricViewProps) => {
  // Encontrar as dimensões da fazenda
  const maxRow = Math.max(...plots.map(p => p.position.y));
  const maxCol = Math.max(...plots.map(p => p.position.x));
  const groundSize: [number, number] = [maxCol + 10, maxRow + 10]; // Increased ground size
  
  return (
    <>
      {/* Iluminação ambiente e direcional */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={1024} 
      />
      
      {/* Céu */}
      <mesh position={[0, 15, 0]}>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>
      
      {/* Terreno base melhorado */}
      <Ground size={groundSize} />
      
      {/* Decorações */}
      <Decorations size={groundSize} />
      
      {/* Grid de terrenos */}
      {plots.map((plot) => (
        <PlotMesh 
          key={plot.id} 
          plot={plot} 
          onSelect={() => onSelectPlot(plot.id)}
          onPlant={() => onPlantCrop(plot.id)}
          onHarvest={() => onHarvestCrop(plot.id)}
          position={[
            plot.position.x - maxCol/2, 
            0, 
            plot.position.y - maxRow/2
          ]}
        />
      ))}
      
      {/* Cerca em volta da fazenda */}
      <Fence 
        width={maxCol + 1} 
        height={maxRow + 1}
        offset={[-(maxCol+1)/2, 0, -(maxRow+1)/2]}
      />
    </>
  );
};

// Componente para a cerca em volta da fazenda
const Fence = ({ width, height, offset }: { width: number, height: number, offset: [number, number, number] }) => {
  const [offsetX, offsetY, offsetZ] = offset;
  const posts = [];
  
  // Postes horizontais (eixo X)
  for (let x = 0; x <= width; x++) {
    posts.push(
      <FencePost 
        key={`fence-x-top-${x}`} 
        position={[offsetX + x, 0, offsetZ - 0.5]} 
      />,
      <FencePost 
        key={`fence-x-bottom-${x}`} 
        position={[offsetX + x, 0, offsetZ + height + 0.5]} 
      />
    );
  }
  
  // Postes verticais (eixo Z)
  for (let z = 0; z <= height; z++) {
    posts.push(
      <FencePost 
        key={`fence-z-left-${z}`} 
        position={[offsetX - 0.5, 0, offsetZ + z]} 
        rotation={[0, Math.PI/2, 0]}
      />,
      <FencePost 
        key={`fence-z-right-${z}`} 
        position={[offsetX + width + 0.5, 0, offsetZ + z]} 
        rotation={[0, Math.PI/2, 0]}
      />
    );
  }
  
  return <>{posts}</>;
};

// Componente para um poste da cerca
const FencePost = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Poste vertical */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Travessas horizontais */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
    </group>
  );
};

const IsometricView: React.FC<IsometricViewProps> = ({ plots, onSelectPlot, onPlantCrop, onHarvestCrop }) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden">
      <Canvas 
        shadows 
        camera={{ position: [6, 7, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          minPolarAngle={Math.PI/6} 
          maxPolarAngle={Math.PI/2.5}
          minDistance={5}
          maxDistance={15}
        />
        <IsometricFarm 
          plots={plots} 
          onSelectPlot={onSelectPlot} 
          onPlantCrop={onPlantCrop} 
          onHarvestCrop={onHarvestCrop}
        />
      </Canvas>
    </div>
  );
};

export default IsometricView;
