
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html as DreiHtml } from '@react-three/drei';
import { PlotState } from '../types/game';
import * as THREE from 'three';

interface IsometricViewProps {
  plots: PlotState[];
  onSelectPlot: (id: string) => void;
}

// Componente para o terreno base (grama)
const Ground = ({ size }: { size: [number, number] }) => {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.1, 0]} 
      receiveShadow
    >
      <planeGeometry args={size} />
      <meshStandardMaterial color="#7CFC00" />
      {/* Textura de grama */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={size} />
        <meshBasicMaterial
          color="#8FBC8F"
          opacity={0.2}
          transparent
          depthWrite={false}
        />
      </mesh>
    </mesh>
  );
};

// Componente para decorações (flores, pedras, etc)
const Decorations = ({ size }: { size: [number, number] }) => {
  const [width, height] = size;
  const items = [];
  
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
  
  return <>{items}</>;
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
      <Html position={[0, 0.3, 0]} center>
        <div className="text-xl">{emoji[type]}</div>
      </Html>
    </group>
  );
};

const PlotMesh = ({ plot, onSelect, position }: { 
  plot: PlotState; 
  onSelect: () => void;
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
        onClick={onSelect}
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
            <Html position={[0, height + 0.2, 0]} center>
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

// Componente para renderizar HTML dentro do canvas 3D
const Html = ({ children, position, center }: { 
  children: React.ReactNode; 
  position: [number, number, number]; 
  center?: boolean;
}) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ camera }) => {
    if (ref.current) {
      // Faz o elemento HTML sempre olhar para a câmera
      ref.current.quaternion.copy(camera.quaternion);
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <DreiHtml
        position={[0, 0, 0]} 
        style={{ 
          pointerEvents: 'none',
          transform: center ? 'translate(-50%, -50%)' : 'none'
        }}
        distanceFactor={10}
      >
        {children}
      </DreiHtml>
    </group>
  );
};

const IsometricFarm = ({ plots, onSelectPlot }: IsometricViewProps) => {
  // Encontrar as dimensões da fazenda
  const maxRow = Math.max(...plots.map(p => p.position.y));
  const maxCol = Math.max(...plots.map(p => p.position.x));
  const groundSize: [number, number] = [maxCol + 6, maxRow + 6];
  
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
      
      {/* Terreno base */}
      <Ground size={groundSize} />
      
      {/* Decorações */}
      <Decorations size={groundSize} />
      
      {/* Grid de terrenos */}
      {plots.map((plot) => (
        <PlotMesh 
          key={plot.id} 
          plot={plot} 
          onSelect={() => onSelectPlot(plot.id)} 
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
const FencePost = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
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

const IsometricView: React.FC<IsometricViewProps> = ({ plots, onSelectPlot }) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden">
      <Canvas shadows camera={{ position: [6, 7, 6], fov: 45 }}>
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          minPolarAngle={Math.PI/6} 
          maxPolarAngle={Math.PI/2.5}
          minDistance={5}
          maxDistance={15}
        />
        <IsometricFarm plots={plots} onSelectPlot={onSelectPlot} />
      </Canvas>
    </div>
  );
};

export default IsometricView;
