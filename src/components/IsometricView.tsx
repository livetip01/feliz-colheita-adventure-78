
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html as DreiHtml } from '@react-three/drei';
import { PlotState } from '../types/game';
import * as THREE from 'three';

interface IsometricViewProps {
  plots: PlotState[];
  onSelectPlot: (id: string) => void;
}

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
  
  return (
    <group position={position}>
      {/* Base do terreno */}
      <mesh 
        position={[0, -0.05, 0]} 
        onClick={onSelect}
        receiveShadow
      >
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#A97C50" />
      </mesh>
      
      {/* Planta */}
      {plot.crop && (
        <mesh
          ref={meshRef}
          position={[0, height/2, 0]}
          castShadow
        >
          <boxGeometry args={[0.6, height, 0.6]} />
          <meshStandardMaterial color={colors[plot.growthStage]} />
          
          {/* Emoji da planta */}
          {plot.growthStage === 'ready' && (
            <Html position={[0, 0.5, 0]} center>
              <div className="text-2xl">{plot.crop.image}</div>
            </Html>
          )}
        </mesh>
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
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={1024} 
      />
      
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
      
      {/* Adicionar um plano de fundo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[maxCol + 4, maxRow + 4]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>
    </>
  );
};

const IsometricView: React.FC<IsometricViewProps> = ({ plots, onSelectPlot }) => {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          minPolarAngle={Math.PI/6} 
          maxPolarAngle={Math.PI/2.5}
        />
        <IsometricFarm plots={plots} onSelectPlot={onSelectPlot} />
      </Canvas>
    </div>
  );
};

export default IsometricView;
