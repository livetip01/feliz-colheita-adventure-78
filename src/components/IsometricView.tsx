
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Sky, Clouds, Cloud } from '@react-three/drei';
import { PlotState } from '../types/game';
import * as THREE from 'three';

interface IsometricViewProps {
  plots: PlotState[];
  onSelectPlot: (id: string) => void;
  onPlantCrop: (id: string) => void;
  onHarvestCrop: (id: string) => void;
}

// Tree component
const Tree = ({ position, scale = 1, type = 0 }) => {
  const treeTypes = [
    { trunkColor: '#8B4513', leavesColor: '#228B22', shape: 'cone' },
    { trunkColor: '#A0522D', leavesColor: '#32CD32', shape: 'sphere' },
    { trunkColor: '#5D4037', leavesColor: '#2E7D32', shape: 'pyramid' }
  ];
  
  const tree = treeTypes[type % treeTypes.length];
  
  return (
    <group position={position} scale={scale}>
      {/* Tree trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
        <meshStandardMaterial color={tree.trunkColor} />
      </mesh>
      
      {/* Tree leaves */}
      {tree.shape === 'cone' && (
        <mesh position={[0, 1.5, 0]} castShadow>
          <coneGeometry args={[1, 2, 8]} />
          <meshStandardMaterial color={tree.leavesColor} />
        </mesh>
      )}
      
      {tree.shape === 'sphere' && (
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={tree.leavesColor} />
        </mesh>
      )}
      
      {tree.shape === 'pyramid' && (
        <>
          <mesh position={[0, 1.2, 0]} castShadow>
            <coneGeometry args={[1.2, 1, 4]} />
            <meshStandardMaterial color={tree.leavesColor} />
          </mesh>
          <mesh position={[0, 2, 0]} castShadow>
            <coneGeometry args={[0.8, 1, 4]} />
            <meshStandardMaterial color={tree.leavesColor} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Component for base terrain (enhanced grass)
const Ground = ({ size }: { size: [number, number] }) => {
  // Create richer and more detailed grass texture
  const [width, height] = size;
  const groundWidth = width + 20; // Much more expanded ground
  const groundHeight = height + 20; // Much more expanded ground
  
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
    </>
  );
};

// Mountains in the background
const Mountains = ({ position = [0, 0, 0] }) => {
  const mountains = useMemo(() => {
    const mountainsArray = [];
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 50 + Math.sin(i * 5) * 10;
      const height = 12 + Math.cos(i * 3) * 5;
      const width = 8 + Math.sin(i * 7) * 4;
      
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      
      mountainsArray.push(
        <mesh 
          key={`mountain-${i}`}
          position={[x, height/2 - 2, z]} 
          castShadow
        >
          <coneGeometry args={[width, height, 6]} />
          <meshStandardMaterial color="#6B8E23" />
        </mesh>
      );
    }
    
    return mountainsArray;
  }, []);
  
  return <group position={position}>{mountains}</group>;
};

// Distant houses
const DistantHouses = () => {
  const houses = useMemo(() => {
    const housesArray = [];
    
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const distance = 40 + Math.sin(i * 13) * 8;
      
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      
      // House type varies
      const houseType = i % 3;
      const houseScale = 1 + Math.sin(i * 7) * 0.3;
      
      housesArray.push(
        <House 
          key={`house-${i}`}
          position={[x, 0, z]} 
          scale={houseScale}
          type={houseType}
        />
      );
    }
    
    return housesArray;
  }, []);
  
  return <>{houses}</>;
};

// Individual house
const House = ({ position, scale = 1, type = 0 }) => {
  const houseColors = ['#8B4513', '#A52A2A', '#D2691E'];
  const roofColors = ['#800000', '#8B0000', '#B22222'];
  
  const color = houseColors[type % houseColors.length];
  const roofColor = roofColors[type % roofColors.length];
  
  return (
    <group position={position} scale={scale}>
      {/* House base */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <coneGeometry args={[1.5, 1, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
    </group>
  );
};

// Component for grass tufts scattered around but outside the farm
const GrassTufts = ({ farmSize, avoidCenter = true }: { farmSize: [number, number], avoidCenter?: boolean }) => {
  // Use useMemo to create a stable set of grass tufts
  const tufts = useMemo(() => {
    const [width, height] = farmSize;
    const items = [];
    
    // Generate a deterministic seed
    const seed = (width * 1000 + height);
    
    // Determine farm boundaries to avoid
    const farmBoundary = {
      minX: -(width/2 + 0.5),
      maxX: (width/2 + 0.5),
      minZ: -(height/2 + 0.5),
      maxZ: (height/2 + 0.5)
    };
    
    // Generate grass tufts across the field, but outside the farm boundaries
    for (let i = 0; i < 800; i++) {
      // Use deterministic pseudo-random values
      const pseudoRandom1 = Math.sin(seed * i * 0.57) * 0.5 + 0.5;
      const pseudoRandom2 = Math.cos(seed * i * 0.37) * 0.5 + 0.5;
      
      // Use a wider range for placement
      const range = 40; // much larger range
      const x = (pseudoRandom1 - 0.5) * range;
      const z = (pseudoRandom2 - 0.5) * range;
      
      // Skip if this grass tuft would be inside the farm
      if (avoidCenter &&
          x >= farmBoundary.minX && x <= farmBoundary.maxX &&
          z >= farmBoundary.minZ && z <= farmBoundary.maxZ) {
        continue;
      }
      
      // Vary the grass color slightly but deterministically
      const colorVariance = (pseudoRandom1 * pseudoRandom2) * 0.2;
      const color = new THREE.Color(0.2 + colorVariance, 0.5 + colorVariance, 0.1);
      
      // Make grass tufts taller
      const height = pseudoRandom1 * 0.3 + 0.1;
      
      items.push(
        <GrassTuft 
          key={`tuft-${i}`}
          position={[x, 0, z]} 
          color={color}
          scale={pseudoRandom1 * 0.4 + 0.2}
          height={height}
        />
      );
    }
    
    return items;
  }, [farmSize, avoidCenter]); 
  
  return <>{tufts}</>;
};

// Individual grass tuft - improved version
const GrassTuft = ({ position, color, scale, height = 0.05 }: { 
  position: [number, number, number], 
  color: THREE.Color, 
  scale: number,
  height: number
}) => {
  return (
    <mesh position={[position[0], height/2, position[2]]} scale={scale}>
      <boxGeometry args={[0.1, height, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// TreeDecorations component - adds trees around the field
const TreeDecorations = ({ size }: { size: [number, number] }) => {
  const [width, height] = size;
  
  // Use useMemo to create a stable set of trees
  const trees = useMemo(() => {
    const items = [];
    const seedValue = width * 137 + height * 547;
    
    // Add trees in strategic locations
    for (let i = 0; i < 40; i++) { // More trees
      // Deterministic positions based on a seed
      const seed = (seedValue + i * 123) % 1000 / 1000;
      const seed2 = (seedValue + i * 456) % 1000 / 1000;
      
      // Position trees in a wider area around the farm
      const angle = (i / 40) * Math.PI * 2;
      const distance = 15 + seed * 25; // Varied distance 15-40 units away
      
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      
      // Vary tree type, scale and exact position slightly
      const treeType = Math.floor(seed * 3);
      const treeScale = 0.7 + seed2 * 0.6;
      
      items.push(
        <Tree 
          key={`tree-${i}`}
          position={[x, 0, z]} 
          scale={treeScale}
          type={treeType}
        />
      );
    }
    
    return items;
  }, [width, height]);
  
  return <>{trees}</>;
};

// Environment component for day/night cycle
const Environment = ({ dayProgress }: { dayProgress: number }) => {
  // Map day progress (0-100) to time of day (0-24 hours)
  // Higher values = later in the day
  const timeOfDay = (dayProgress / 100) * 24;
  
  // Calculate sun position based on time of day
  // At noon (12h) sun is at zenith, at night (0h, 24h) sun is below horizon
  const sunPosition = useMemo(() => {
    const sunAngle = ((timeOfDay - 12) / 12) * Math.PI;
    const elevation = Math.cos(sunAngle) * 60;
    const sunX = Math.sin(sunAngle) * 100;
    const sunY = Math.max(1, elevation); // Keep sun slightly above horizon
    const sunZ = Math.cos(sunAngle) * 100;
    
    return [sunX, sunY, sunZ];
  }, [timeOfDay]);
  
  // Calculate ambient light intensity based on time of day
  // Brightest at noon, darkest at midnight
  const ambientIntensity = Math.max(0.2, Math.cos((timeOfDay - 12) / 12 * Math.PI) * 0.5 + 0.3);
  
  // Calculate directional light intensity
  // No direct light at night
  const directionalIntensity = Math.max(0, Math.cos((timeOfDay - 12) / 12 * Math.PI));
  
  // Calculate sky color
  const skyColor = useMemo(() => {
    // Blue during day, dark blue at night
    const dayFactor = Math.max(0, Math.cos((timeOfDay - 12) / 12 * Math.PI));
    
    const r = 0.53 * dayFactor + 0.05;
    const g = 0.8 * dayFactor + 0.05;
    const b = 0.92 * dayFactor + 0.1;
    
    return new THREE.Color(r, g, b);
  }, [timeOfDay]);
  
  // Calculate fog color and density
  const fogColor = useMemo(() => {
    const dayFactor = Math.max(0, Math.cos((timeOfDay - 12) / 12 * Math.PI));
    
    const r = 0.75 * dayFactor + 0.1;
    const g = 0.8 * dayFactor + 0.1;
    const b = 0.85 * dayFactor + 0.15;
    
    return new THREE.Color(r, g, b);
  }, [timeOfDay]);
  
  // Adjust fog density based on time of day - more fog at night
  const fogDensity = 0.01 + (1 - Math.max(0, Math.cos((timeOfDay - 12) / 12 * Math.PI))) * 0.03;
  
  return (
    <>
      {/* Dynamic sky */}
      <color attach="background" args={[skyColor]} />
      
      {/* Sun */}
      <directionalLight 
        position={sunPosition} 
        intensity={directionalIntensity} 
        castShadow 
        shadow-mapSize={1024} 
      />
      
      {/* Ambient light */}
      <ambientLight intensity={ambientIntensity} />
      
      {/* Fog */}
      <fog attach="fog" args={[fogColor, 5, 50]} />
    </>
  );
};

// Fence component
const Fence = ({ width, height, offset }: { width: number, height: number, offset: [number, number, number] }) => {
  const [offsetX, offsetY, offsetZ] = offset;
  
  // Generate fence posts deterministically with useMemo
  const posts = useMemo(() => {
    const fencePosts = [];
    
    // Postes horizontais (eixo X)
    for (let x = 0; x <= width; x++) {
      fencePosts.push(
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
      fencePosts.push(
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
    
    return fencePosts;
  }, [width, height, offsetX, offsetY, offsetZ]);
  
  return <>{posts}</>;
};

// Fence post component
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

// Enhanced PlotMesh with intermediate growth stage
const PlotMesh = ({ 
  plot, 
  onSelect,
  onPlant,
  onHarvest,
  position,
  currentTime 
}: { 
  plot: PlotState; 
  onSelect: () => void;
  onPlant: () => void;
  onHarvest: () => void;
  position: [number, number, number];
  currentTime: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate growth percentage if crop is growing
  const growthPercentage = plot.crop && plot.plantedAt
    ? Math.min(100, ((currentTime - plot.plantedAt) / 1000) / plot.crop.growthTime * 100)
    : 0;
  
  // Colors for different growth stages
  const colors = {
    empty: '#8B5E3C', // brown for soil
    growing: '#90EE90', // light green for growing plants
    ready: '#32CD32' // darker green for ready plants
  };
  
  // Height of the plant based on growth stage and percentage
  const getPlantHeight = () => {
    if (plot.growthStage === 'empty') return 0.1;
    if (plot.growthStage === 'ready') return 0.5;
    
    // For growing plants, return height based on growth percentage
    // 0-33%: small seedling (0.1-0.2)
    // 34-66%: medium plant (0.2-0.35)
    // 67-99%: almost mature plant (0.35-0.5)
    if (growthPercentage < 33) {
      return 0.1 + (growthPercentage / 33) * 0.1; // 0.1 to 0.2
    } else if (growthPercentage < 66) {
      return 0.2 + ((growthPercentage - 33) / 33) * 0.15; // 0.2 to 0.35
    } else {
      return 0.35 + ((growthPercentage - 66) / 33) * 0.15; // 0.35 to almost 0.5
    }
  };
  
  const height = getPlantHeight();
                
  // Animation for ready plants
  useFrame(({ clock }) => {
    if (meshRef.current && plot.growthStage === 'ready') {
      meshRef.current.position.y = height/2 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
    }
  });
  
  // Direct planting handler
  const handlePlotClick = () => {
    if (plot.growthStage === 'ready') {
      onHarvest();
    } else if (plot.growthStage === 'empty') {
      onPlant();
    } else {
      onSelect();
    }
  };
  
  return (
    <group position={position}>
      {/* Tilled soil */}
      <mesh 
        position={[0, -0.05, 0]} 
        onClick={handlePlotClick}
        receiveShadow
      >
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#A97C50" />
        {/* Lines in tilled soil */}
        <mesh position={[0, 0.06, 0]} rotation={[0, Math.PI/4, 0]}>
          <boxGeometry args={[0.85, 0.02, 0.85]} />
          <meshStandardMaterial color="#8B4513" wireframe />
        </mesh>
      </mesh>
      
      {/* Plant */}
      {plot.crop && plot.growthStage !== 'empty' && (
        <>
          {/* Plant stem */}
          <mesh
            ref={meshRef}
            position={[0, height/2, 0]}
            castShadow
          >
            <boxGeometry args={[0.15, height, 0.15]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          
          {/* Plant leaves - change based on growth percentage */}
          {plot.growthStage === 'growing' && (
            <>
              {growthPercentage < 33 && (
                // Small seedling: two tiny leaves
                <mesh position={[0, height, 0]} rotation={[0, 0, 0]}>
                  <boxGeometry args={[0.2, 0.02, 0.1]} />
                  <meshStandardMaterial color="#32CD32" />
                </mesh>
              )}
              
              {growthPercentage >= 33 && growthPercentage < 66 && (
                // Medium stage: more leaves, slightly larger
                <>
                  <mesh position={[0.1, height-0.1, 0]} rotation={[0, 0, Math.PI/6]}>
                    <boxGeometry args={[0.25, 0.02, 0.12]} />
                    <meshStandardMaterial color="#32CD32" />
                  </mesh>
                  <mesh position={[-0.1, height-0.15, 0]} rotation={[0, 0, -Math.PI/6]}>
                    <boxGeometry args={[0.25, 0.02, 0.12]} />
                    <meshStandardMaterial color="#32CD32" />
                  </mesh>
                </>
              )}
              
              {growthPercentage >= 66 && (
                // Almost mature: full set of leaves
                <>
                  <mesh position={[0.1, height-0.1, 0.1]} rotation={[0, 0, Math.PI/6]}>
                    <boxGeometry args={[0.3, 0.03, 0.15]} />
                    <meshStandardMaterial color="#32CD32" />
                  </mesh>
                  <mesh position={[-0.1, height-0.15, -0.05]} rotation={[0, 0, -Math.PI/6]}>
                    <boxGeometry args={[0.3, 0.03, 0.15]} />
                    <meshStandardMaterial color="#32CD32" />
                  </mesh>
                  <mesh position={[0, height-0.05, -0.1]} rotation={[Math.PI/6, 0, 0]}>
                    <boxGeometry args={[0.2, 0.03, 0.25]} />
                    <meshStandardMaterial color="#32CD32" />
                  </mesh>
                </>
              )}
            </>
          )}
          
          {/* Fruit/edible part of the plant */}
          {plot.growthStage === 'ready' && (
            <Html position={[0, height + 0.2, 0]} style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}>
              <div className="text-2xl" style={{transform: 'scale(1.2)'}}>{plot.crop.image}</div>
            </Html>
          )}
        </>
      )}
      
      {/* Glow around ready plants */}
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

const IsometricFarm = ({ 
  plots, 
  onSelectPlot, 
  onPlantCrop, 
  onHarvestCrop,
  dayProgress = 50 // Default to midday
}: IsometricViewProps & { dayProgress?: number }) => {
  // Find farm dimensions
  const maxRow = Math.max(...plots.map(p => p.position.y));
  const maxCol = Math.max(...plots.map(p => p.position.x));
  const farmSize: [number, number] = [maxCol + 1, maxRow + 1];
  const groundSize: [number, number] = [maxCol + 30, maxRow + 30]; // Much larger ground
  
  // Get current time for growth calculations
  const currentTime = Date.now();
  
  return (
    <>
      {/* Environment with day/night cycle */}
      <Environment dayProgress={dayProgress} />
      
      {/* Ground base */}
      <Ground size={groundSize} />
      
      {/* Grass tufts outside farm area */}
      <GrassTufts farmSize={farmSize} avoidCenter={true} />
      
      {/* Distant mountains */}
      <Mountains position={[0, 0, 0]} />
      
      {/* Distant houses */}
      <DistantHouses />
      
      {/* Trees */}
      <TreeDecorations size={groundSize} />
      
      {/* Plot grid */}
      {plots.map((plot) => (
        <PlotMesh 
          key={plot.id} 
          plot={plot}
          currentTime={currentTime}
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
      
      {/* Fence around farm */}
      <Fence 
        width={maxCol + 1} 
        height={maxRow + 1}
        offset={[-(maxCol+1)/2, 0, -(maxRow+1)/2]}
      />
    </>
  );
};

const IsometricView: React.FC<IsometricViewProps> = ({ plots, onSelectPlot, onPlantCrop, onHarvestCrop }) => {
  // Get current time for animations and day progress
  const [dayProgress, setDayProgress] = useState(50);
  
  // Update day progress based on game time
  useEffect(() => {
    const getDayProgress = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      // Map 24h to 0-100%
      return ((hour * 60 + minute) / (24 * 60)) * 100;
    };
    
    // Update every minute
    const timer = setInterval(() => {
      setDayProgress(getDayProgress());
    }, 60000);
    
    // Initial setting
    setDayProgress(getDayProgress());
    
    return () => clearInterval(timer);
  }, []);
  
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
          maxDistance={20}
        />
        <IsometricFarm 
          plots={plots} 
          onSelectPlot={onSelectPlot} 
          onPlantCrop={onPlantCrop} 
          onHarvestCrop={onHarvestCrop}
          dayProgress={dayProgress}
        />
      </Canvas>
    </div>
  );
};

export default IsometricView;
