import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Sky, Clouds, Cloud } from '@react-three/drei';
import { PlotState } from '../types/game';
import * as THREE from 'three';
import { Fence as FenceIcon } from 'lucide-react';

interface IsometricViewProps {
  plots: PlotState[];
  onSelectPlot: (id: string) => void;
  onPlantCrop: (id: string) => void;
  onHarvestCrop: (id: string) => void;
  dayProgress?: number;
  isRainyDay?: boolean;
}

// Rain component
const Rain = ({ intensity = 1.0 }) => {
  const count = 1000 * intensity;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const raindrops = useMemo(() => {
    const temp = [];
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Distribute rain in a wider area
      const x = (Math.random() - 0.5) * 100;
      const y = Math.random() * 50 + 10; // Start from above camera
      const z = (Math.random() - 0.5) * 100;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Vary raindrop sizes slightly
      scales[i] = 0.03 + Math.random() * 0.03;
    }
    
    return { positions, scales };
  }, [count]);
  
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    
    const time = clock.getElapsedTime();
    
    // Update each raindrop
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Get current position
      const x = raindrops.positions[i3];
      let y = raindrops.positions[i3 + 1];
      const z = raindrops.positions[i3 + 2];
      
      // Move raindrops down
      y -= 0.2 * (1 + Math.sin(i * 0.5) * 0.2); // Vary speed slightly
      
      // Reset if below ground
      if (y < 0) {
        y = 50 + Math.random() * 10;
      }
      
      // Update position
      raindrops.positions[i3 + 1] = y;
      
      // Set matrix for instanced mesh
      const matrix = new THREE.Matrix4();
      matrix.setPosition(x, y, z);
      matrix.scale(new THREE.Vector3(0.05, 0.3, 0.05));
      mesh.current.setMatrixAt(i, matrix);
    }
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#88CCFF" opacity={0.6} transparent />
    </instancedMesh>
  );
};

// Tree component
const Tree = ({ position, scale = 1, type = 0 }) => {
  const treeTypes = [
    { trunkColor: '#8B4513', leavesColor: '#228B22', shape: 'cone' },
    { trunkColor: '#A0522D', leavesColor: '#32CD32', shape: 'sphere' },
    { trunkColor: '#5D4037', leavesColor: '#2E7D32', shape: 'pyramid' }
  ];
  
  const tree = treeTypes[type % treeTypes.length];
  
  // Ensure tree is exactly on the ground (y=0)
  const [x, _, z] = position;
  const treePosition: [number, number, number] = [x, 0, z];
  
  return (
    <group position={treePosition} scale={scale}>
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
  const groundWidth = width + 120; // Much larger ground to cover mountains
  const groundHeight = height + 120; // Much larger ground to cover mountains
  
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

// More realistic mountains in the background
const Mountains = ({ position = [0, 0, 0] as [number, number, number] }) => {
  const mountains = useMemo(() => {
    const mountainsArray = [];
    
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const distance = 50 + Math.sin(i * 5) * 10;
      const height = 12 + Math.cos(i * 3) * 5;
      
      // Calculate position
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      
      // Create more natural mountain shape using multiple meshes for a single mountain
      const mountainGroup = (
        <group key={`mountain-${i}`} position={[x, 0, z]}>
          {/* Main mountain body - Use a smoother shape */}
          <mesh castShadow position={[0, height/2, 0]}>
            <cylinderGeometry args={[0, 8 + Math.sin(i * 7) * 2, height, 16]} />
            <meshStandardMaterial color="#6B8E23" />
          </mesh>
          
          {/* Add random bumps for more natural look */}
          {Array.from({ length: 5 }).map((_, j) => {
            const bumpHeight = height * (0.3 + Math.sin(i * j * 0.5) * 0.2);
            const bumpRadius = 2 + Math.sin(i * j * 3) * 1;
            const bumpAngle = j * Math.PI * 2 / 5;
            const bumpDistance = 3 + Math.sin(i * j) * 2;
            const bumpX = Math.sin(bumpAngle) * bumpDistance;
            const bumpZ = Math.cos(bumpAngle) * bumpDistance;
            
            return (
              <mesh 
                key={`mountain-${i}-bump-${j}`} 
                position={[bumpX, bumpHeight/2, bumpZ]} 
                castShadow
              >
                <cylinderGeometry args={[0, bumpRadius, bumpHeight, 8]} />
                <meshStandardMaterial color="#556B2F" />
              </mesh>
            );
          })}
          
          {/* Snow caps on higher mountains */}
          {height > 14 && (
            <mesh position={[0, height * 0.9, 0]}>
              <cylinderGeometry args={[0, 3, height * 0.2, 16]} />
              <meshStandardMaterial color="#F0F0F0" />
            </mesh>
          )}
        </group>
      );
      
      mountainsArray.push(mountainGroup);
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
          position={[x, 0, z] as [number, number, number]} 
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
  const tufts = useMemo(() => {
    const [width, height] = farmSize;
    const items = [];
    
    // Generate a deterministic seed
    const seed = (width * 1000 + height);
    
    // Determine farm boundaries to avoid - increased for better distribution
    const farmBoundary = {
      minX: -(width/2 + 5),
      maxX: (width/2 + 5),
      minZ: -(height/2 + 5),
      maxZ: (height/2 + 5)
    };
    
    // Generate grass tufts across the field, but outside the farm boundaries
    for (let i = 0; i < 1000; i++) {
      // Use deterministic pseudo-random values
      const pseudoRandom1 = Math.sin(seed * i * 0.57) * 0.5 + 0.5;
      const pseudoRandom2 = Math.cos(seed * i * 0.37) * 0.5 + 0.5;
      
      // Use a wider range for placement with better distribution
      const range = 100; // larger range for more spread
      let x = (pseudoRandom1 - 0.5) * range;
      let z = (pseudoRandom2 - 0.5) * range;
      
      // Skip if this grass tuft would be inside the farm or too close to it
      if (avoidCenter &&
          x >= farmBoundary.minX && x <= farmBoundary.maxX &&
          z >= farmBoundary.minZ && z <= farmBoundary.maxZ) {
        continue;
      }
      
      // Calculate distance from center
      const distanceFromCenter = Math.sqrt(x*x + z*z);
      
      // Distribute grass more evenly - more grass farther from center
      if (distanceFromCenter < 10 && pseudoRandom1 > 0.3) {
        continue;
      }
      
      // Vary the grass color slightly but deterministically
      const colorVariance = (pseudoRandom1 * pseudoRandom2) * 0.2;
      const color = new THREE.Color(0.2 + colorVariance, 0.5 + colorVariance, 0.1);
      
      // Make grass tufts taller
      const height = pseudoRandom1 * 0.3 + 0.1;
      
      // Make sure grass is exactly on the ground
      const position: [number, number, number] = [x, 0, z];
      
      items.push(
        <GrassTuft 
          key={`tuft-${i}`}
          position={position} 
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
    <mesh position={position} scale={scale}>
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
          position={[x, 0, z] as [number, number, number]} 
          scale={treeScale}
          type={treeType}
        />
      );
    }
    
    return items;
  }, [width, height]);
  
  return <>{trees}</>;
};

// Smoother sun movement with continuous animation
const SunTracker = ({ dayProgress }: { dayProgress: number }) => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const lastDayProgress = useRef(dayProgress);
  
  // Interpolation function for smooth transitions
  const interpolate = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };
  
  useFrame(() => {
    if (!sunRef.current) return;
    
    // Calculate target position (same logic as before)
    const distance = 100;
    let targetAngle, targetHeight;
    
    // Early morning (0-15%)
    if (dayProgress < 15) {
      const progress = dayProgress / 15;
      targetAngle = Math.PI + (progress * (Math.PI * 0.2));
      targetHeight = interpolate(-5, 1, progress);
    }
    // Dawn (15-25%)
    else if (dayProgress < 25) {
      const progress = (dayProgress - 15) / 10;
      targetAngle = Math.PI * 1.2 - progress * (Math.PI * 0.2);
      targetHeight = interpolate(1, 30, progress);
    }
    // Day (25-60%)
    else if (dayProgress < 60) {
      const progress = (dayProgress - 25) / 35;
      targetAngle = Math.PI - progress * Math.PI;
      targetHeight = 30 + Math.sin(progress * Math.PI) * 30;
    }
    // Sunset (60-75%)
    else if (dayProgress < 75) {
      const progress = (dayProgress - 60) / 15;
      targetAngle = progress * (Math.PI * 0.2);
      targetHeight = interpolate(30, -5, progress);
    }
    // Night (75-100%)
    else {
      const progress = (dayProgress - 75) / 25;
      targetAngle = Math.PI * 0.2 + progress * (Math.PI * 0.8);
      targetHeight = -5; // Below horizon
    }
    
    // Calculate target position
    const targetX = Math.sin(targetAngle) * distance;
    const targetZ = Math.cos(targetAngle) * distance;
    
    // Get current position
    const currentX = sunRef.current.position.x;
    const currentY = sunRef.current.position.y;
    const currentZ = sunRef.current.position.z;
    
    // Smooth interpolation (lerp) for continuous movement
    // Using a very small step for ultra-smooth movement
    const step = 0.01;
    
    sunRef.current.position.x = currentX + (targetX - currentX) * step;
    sunRef.current.position.y = currentY + (targetHeight - currentY) * step;
    sunRef.current.position.z = currentZ + (targetZ - currentZ) * step;
    
    lastDayProgress.current = dayProgress;
  });
  
  // Calculate directional light intensity
  const directionalIntensity = useMemo(() => {
    if (dayProgress < 15) {
      // Early morning: gradually increasing from 0
      return (dayProgress / 15) * 0.2;
    } else if (dayProgress < 25) {
      // Dawn: continuing to increase
      return 0.2 + ((dayProgress - 15) / 10) * 0.6;
    } else if (dayProgress < 60) {
      // Day: full intensity with subtle variations
      const progress = (dayProgress - 25) / 35;
      return 0.8 + Math.sin(progress * Math.PI) * 0.2;
    } else if (dayProgress < 75) {
      // Sunset: decreasing
      return 0.8 - ((dayProgress - 60) / 15) * 0.8;
    } else {
      // Night: no directional light
      return 0;
    }
  }, [dayProgress]);
  
  return (
    <directionalLight 
      ref={sunRef}
      // Initial position will be updated in useFrame
      position={[0, 20, 0]} 
      intensity={directionalIntensity} 
      castShadow 
      shadow-mapSize={1024} 
    />
  );
};

// Enhanced clouds for rainy days
const WeatherClouds = ({ isRainyDay = false }) => {
  const cloudRef = useRef<THREE.Group>();
  
  useFrame(({ clock }) => {
    if (cloudRef.current) {
      // Slowly move clouds
      cloudRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.05) * 20;
    }
  });
  
  return (
    <group ref={cloudRef}>
      {/* More and darker clouds for rainy days */}
      {isRainyDay ? (
        Array.from({ length: 15 }).map((_, i) => (
          <Cloud 
            key={`cloud-${i}`}
            position={[
              (Math.random() - 0.5) * 50, 
              15 + Math.random() * 10, 
              (Math.random() - 0.5) * 50
            ]} 
            scale={3 + Math.random() * 2}
            color="#555"
            opacity={0.8}
          />
        ))
      ) : (
        // Fewer, lighter clouds for normal days
        Array.from({ length: 5 }).map((_, i) => (
          <Cloud 
            key={`cloud-${i}`}
            position={[
              (Math.random() - 0.5) * 80, 
              20 + Math.random() * 10, 
              (Math.random() - 0.5) * 80
            ]}
            scale={2 + Math.random() * 2}
            color="#fff"
            opacity={0.7}
          />
        ))
      )}
    </group>
  );
};

// Enhanced Environment component for day/night cycle that syncs with game time
const Environment = ({ dayProgress, isRainyDay = false }: { dayProgress: number, isRainyDay?: boolean }) => {
  // Calculate ambient light intensity based on time of day with smoother transitions
  const ambientIntensity = useMemo(() => {
    // Reduce ambient light in rainy conditions
    const rainyDayFactor = isRainyDay ? 0.7 : 1.0;
    
    if (dayProgress < 15) {
      // Early morning: very dim to dim light
      return (0.05 + (dayProgress / 15) * 0.15) * rainyDayFactor;
    } else if (dayProgress < 25) {
      // Dawn: increasing light
      return (0.2 + ((dayProgress - 15) / 10) * 0.3) * rainyDayFactor;
    } else if (dayProgress < 60) {
      // Day: full daylight with subtle variations
      const progress = (dayProgress - 25) / 35;
      return (0.5 + Math.sin(progress * Math.PI) * 0.3) * rainyDayFactor;
    } else if (dayProgress < 75) {
      // Sunset: decreasing light
      return (0.5 - ((dayProgress - 60) / 15) * 0.3) * rainyDayFactor;
    } else {
      // Night: dim to very dim light
      return (0.2 - ((dayProgress - 75) / 25) * 0.15) * rainyDayFactor;
    }
  }, [dayProgress, isRainyDay]);
  
  // Calculate sky color with smoother transitions
  const skyColor = useMemo(() => {
    // Adjust sky color for rainy day
    const rainyDayAdjustment = isRainyDay ? 0.5 : 0.0;
    
    if (dayProgress < 15) {
      // Deep blue/purple for early morning
      const progress = dayProgress / 15;
      return new THREE.Color(
        0.05 + 0.05 * progress - rainyDayAdjustment * 0.03, 
        0.05 + 0.05 * progress - rainyDayAdjustment * 0.03, 
        0.15 + 0.05 * progress - rainyDayAdjustment * 0.05
      );
    } else if (dayProgress < 25) {
      // Pink/orange sunrise with smooth transition
      const progress = (dayProgress - 15) / 10;
      return new THREE.Color(
        0.1 + 0.6 * progress - rainyDayAdjustment * 0.3, 
        0.1 + 0.3 * progress - rainyDayAdjustment * 0.15, 
        0.2 + 0.3 * progress - rainyDayAdjustment * 0.05
      );
    } else if (dayProgress < 60) {
      // Blue sky during day
      const progress = (dayProgress - 25) / 35;
      // Rainy sky is darker and grayer
      const blueVariation = 0.92 - Math.sin(progress * Math.PI) * 0.06 - rainyDayAdjustment * 0.4;
      const redGreenValue = 0.53 - rainyDayAdjustment * 0.2;
      return new THREE.Color(redGreenValue, redGreenValue + 0.27 - rainyDayAdjustment * 0.15, blueVariation);
    } else if (dayProgress < 75) {
      // Orange/red sunset with smooth transition
      const progress = (dayProgress - 60) / 15;
      return new THREE.Color(
        0.7 - 0.6 * progress - rainyDayAdjustment * 0.3, 
        0.6 - 0.5 * progress - rainyDayAdjustment * 0.25, 
        0.7 - 0.55 * progress - rainyDayAdjustment * 0.15
      );
    } else {
      // Dark blue night with subtle transition
      const progress = (dayProgress - 75) / 25;
      return new THREE.Color(
        0.1 - 0.05 * progress - rainyDayAdjustment * 0.03, 
        0.1 - 0.05 * progress - rainyDayAdjustment * 0.03, 
        0.2 - 0.05 * progress - rainyDayAdjustment * 0.05
      );
    }
  }, [dayProgress, isRainyDay]);
  
  // Calculate fog color and density with smoother transitions
  const fogColor = useMemo(() => {
    // Adjust fog for rainy day
    const rainyDayAdjustment = isRainyDay ? 0.3 : 0.0;
    
    if (dayProgress < 15) {
      // Early morning fog
      const progress = dayProgress / 15;
      return new THREE.Color(
        0.1 + 0.05 * progress - rainyDayAdjustment * 0.05, 
        0.1 + 0.05 * progress - rainyDayAdjustment * 0.05, 
        0.2 + 0.05 * progress - rainyDayAdjustment * 0.05
      );
    } else if (dayProgress < 25) {
      // Dawn fog with smooth transition
      const progress = (dayProgress - 15) / 10;
      return new THREE.Color(
        0.15 + 0.45 * progress - rainyDayAdjustment * 0.2, 
        0.15 + 0.25 * progress - rainyDayAdjustment * 0.1, 
        0.25 + 0.25 * progress - rainyDayAdjustment * 0.05
      );
    } else if (dayProgress < 60) {
      // Day fog with subtle variations
      const progress = (dayProgress - 25) / 35;
      const blueVariation = 0.85 - Math.sin(progress * Math.PI) * 0.05 - rainyDayAdjustment * 0.3;
      return new THREE.Color(
        0.75 - rainyDayAdjustment * 0.3, 
        0.8 - rainyDayAdjustment * 0.3, 
        blueVariation
      );
    } else if (dayProgress < 75) {
      // Sunset fog with smooth transition
      const progress = (dayProgress - 60) / 15;
      return new THREE.Color(
        0.6 - 0.45 * progress - rainyDayAdjustment * 0.2, 
        0.5 - 0.35 * progress - rainyDayAdjustment * 0.15, 
        0.5 - 0.3 * progress - rainyDayAdjustment * 0.1
      );
    } else {
      // Night fog with subtle transition
      const progress = (dayProgress - 75) / 25;
      return new THREE.Color(
        0.15 - 0.05 * progress - rainyDayAdjustment * 0.05, 
        0.15 - 0.05 * progress - rainyDayAdjustment * 0.05, 
        0.2 - 0.05 * progress - rainyDayAdjustment * 0.05
      );
    }
  }, [dayProgress, isRainyDay]);
  
  // Adjust fog density based on time of day and weather
  const fogDensity = useMemo(() => {
    // Increase fog density for rainy days
    const rainyDayIncrease = isRainyDay ? 0.03 : 0.0;
    
    if (dayProgress < 15) {
      // Early morning: dense fog
      const progress = dayProgress / 15;
      return 0.04 - 0.01 * progress + rainyDayIncrease;
    } else if (dayProgress < 25) {
      // Dawn: fog clearing
      const progress = (dayProgress - 15) / 10;
      return 0.03 - 0.01 * progress + rainyDayIncrease;
    } else if (dayProgress < 60) {
      // Day: minimal fog with subtle variations
      const progress = (dayProgress - 25) / 35;
      return 0.01 + Math.sin(progress * Math.PI) * 0.005 + rainyDayIncrease;
    } else if (dayProgress < 75) {
      // Sunset: fog increasing
      const progress = (dayProgress - 60) / 15;
      return 0.01 + 0.01 * progress + rainyDayIncrease;
    } else {
      // Night: dense fog gradually increasing
      const progress = (dayProgress - 75) / 25;
      return 0.02 + 0.02 * progress + rainyDayIncrease;
    }
  }, [dayProgress, isRainyDay]);
  
  return (
    <>
      {/* Dynamic sky */}
      <color attach="background" args={[skyColor]} />
      
      {/* Sun/Moon - using the SunTracker component for smooth movement */}
      <SunTracker dayProgress={dayProgress} />
      
      {/* Weather effects */}
      <WeatherClouds isRainyDay={isRainyDay} />
      {isRainyDay && <Rain intensity={1.0} />}
      
      {/* Ambient light */}
      <ambientLight intensity={ambientIntensity} />
      
      {/* Fog - increased distance for visibility */}
      <fog attach="fog" args={[fogColor, 20, 80]} />
    </>
  );
};

// FencePost component - individual fence post for the fence
const FencePost = ({ position, scale = 1, rotation = 0 }: { 
  position: [number, number, number], 
  scale?: number, 
  rotation?: number 
}) => {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Fence post */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
};

// FenceRail component - horizontal rail connecting fence posts
const FenceRail = ({ 
  start, 
  end, 
  height = 0.7,
  thickness = 0.1 
}: { 
  start: [number, number, number], 
  end: [number, number, number],
  height?: number,
  thickness?: number
}) => {
  // Calculate position and rotation
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  
  // Calculate length and angle
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  
  return (
    <group position={[midX, height, midZ]} rotation={[0, angle, 0]}>
      <mesh castShadow>
        <boxGeometry args={[length, thickness, thickness]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
    </group>
  );
};

// Fence component - creates a fence around the perimeter of the farm
const Fence = ({ width, height, offset = [0, 0, 0] }: { 
  width: number, 
  height: number, 
  offset?: [number, number, number] 
}) => {
  const [offsetX, offsetY, offsetZ] = offset;
  
  // Generate fence posts deterministically with useMemo
  const fenceElements = useMemo(() => {
    const elements = [];
    const postSpacing = 2; // Space between posts
    
    // Number of posts on each side
    const numPostsX = Math.ceil(width / postSpacing) + 1;
    const numPostsZ = Math.ceil(height / postSpacing) + 1;
    
    // Half dimensions for centering
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Posts and rails along X axis (top and bottom of field)
    for (let i = 0; i < numPostsX; i++) {
      const x = -halfWidth + i * postSpacing;
      
      // Top fence
      elements.push(
        <FencePost 
          key={`post-top-${i}`}
          position={[x + offsetX, offsetY, -halfHeight + offsetZ]} 
        />
      );
      
      // Bottom fence
      elements.push(
        <FencePost 
          key={`post-bottom-${i}`}
          position={[x + offsetX, offsetY, halfHeight + offsetZ]} 
        />
      );
      
      // Rails (except last post)
      if (i < numPostsX - 1) {
        // Top rails
        elements.push(
          <FenceRail 
            key={`rail-top-${i}`}
            start={[x + offsetX, offsetY, -halfHeight + offsetZ]}
            end={[x + postSpacing + offsetX, offsetY, -halfHeight + offsetZ]}
          />
        );
        
        // Second rail a bit higher
        elements.push(
          <FenceRail 
            key={`rail-top-high-${i}`}
            start={[x + offsetX, offsetY, -halfHeight + offsetZ]}
            end={[x + postSpacing + offsetX, offsetY, -halfHeight + offsetZ]}
            height={0.3}
          />
        );
        
        // Bottom rails
        elements.push(
          <FenceRail 
            key={`rail-bottom-${i}`}
            start={[x + offsetX, offsetY, halfHeight + offsetZ]}
            end={[x + postSpacing + offsetX, offsetY, halfHeight + offsetZ]}
          />
        );
        
        // Second rail a bit higher
        elements.push(
          <FenceRail 
            key={`rail-bottom-high-${i}`}
            start={[x + offsetX, offsetY, halfHeight + offsetZ]}
            end={[x + postSpacing + offsetX, offsetY, halfHeight + offsetZ]}
            height={0.3}
          />
        );
      }
    }
    
    // Posts and rails along Z axis (left and right of field)
    for (let i = 0; i < numPostsZ; i++) {
      const z = -halfHeight + i * postSpacing;
      
      // Skip corners to avoid duplicates (already added in X axis loop)
      if (i > 0 && i < numPostsZ - 1) {
        // Left fence
        elements.push(
          <FencePost 
            key={`post-left-${i}`}
            position={[-halfWidth + offsetX, offsetY, z + offsetZ]} 
          />
        );
        
        // Right fence
        elements.push(
          <FencePost 
            key={`post-right-${i}`}
            position={[halfWidth + offsetX, offsetY, z + offsetZ]} 
          />
        );
      }
      
      // Rails (except last post)
      if (i < numPostsZ - 1) {
        // Left rails
        elements.push(
          <FenceRail 
            key={`rail-left-${i}`}
            start={[-halfWidth + offsetX, offsetY, z + offsetZ]}
            end={[-halfWidth + offsetX, offsetY, z + postSpacing + offsetZ]}
          />
        );
        
        // Second rail a bit higher
        elements.push(
          <FenceRail 
            key={`rail-left-high-${i}`}
            start={[-halfWidth + offsetX, offsetY, z + offsetZ]}
            end={[-halfWidth + offsetX, offsetY, z + postSpacing + offsetZ]}
            height={0.3}
          />
        );
        
        // Right rails
        elements.push(
          <FenceRail 
            key={`rail-right-${i}`}
            start={[halfWidth + offsetX, offsetY, z + offsetZ]}
            end={[halfWidth + offsetX, offsetY, z + postSpacing + offsetZ]}
          />
        );
        
        // Second rail a bit higher
        elements.push(
          <FenceRail 
            key={`rail-right-high-${i}`}
            start={[halfWidth + offsetX, offsetY, z + offsetZ]}
            end={[halfWidth + offsetX, offsetY, z + postSpacing + offsetZ]}
            height={0.3}
          />
        );
      }
    }
    
    return elements;
  }, [width, height, offset]);
  
  return <>{fenceElements}</>;
};

// Plot component for 3D farm plots 
const Plot = ({ 
  plot,
  onSelect,
  onHarvest,
  scale = 1
}: { 
  plot: PlotState;
  onSelect: () => void;
  onHarvest: () => void;
  scale?: number;
}) => {
  // Reference to the mesh for interaction
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Set cursor and handle hovering
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  
  // Plot color based on state
  const getPlotColor = () => {
    if (!plot.crop) return "#D2B48C"; // Empty plot - tan color
    
    if (plot.growthStage === 'ready') {
      return "#7CFC00"; // Light green for ready crops
    }
    
    return "#8B4513"; // Brown for growing crops
  };
  
  // Plot height based on growth
  const getPlotHeight = () => {
    if (!plot.crop) return 0.1;
    
    if (plot.growthStage === 'ready') {
      return 0.3; // Taller for ready crops
    }
    
    return 0.15; // Medium for growing crops
  };
  
  // Return 3D plot with appropriate UI based on state
  return (
    <group 
      position={[plot.position.x * 2, 0, plot.position.y * 2]} 
      scale={scale}
    >
      {/* Base plot - soil */}
      <mesh
        ref={meshRef}
        position={[0, getPlotHeight() / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onSelect}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1.8, getPlotHeight(), 1.8]} />
        <meshStandardMaterial 
          color={getPlotColor()} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Crop representation */}
      {plot.crop && (
        <Html position={[0, 0.8, 0]} center sprite>
          <div 
            className={`text-3xl transition-all duration-300 ${hovered ? 'scale-125' : 'scale-100'}`}
            onClick={plot.growthStage === 'ready' ? onHarvest : onSelect}
          >
            {plot.crop.image}
          </div>
        </Html>
      )}
      
      {/* Plot ID or growth progress indicator for debugging */}
      {/*
      <Html position={[0, -0.2, 0]} center sprite>
        <div className="text-xs bg-black/50 text-white px-1 rounded">
          {plot.id}
        </div>
      </Html>
      */}
    </group>
  );
};

// Main IsometricView component
const IsometricView: React.FC<IsometricViewProps> = ({ 
  plots, 
  onSelectPlot, 
  onPlantCrop, 
  onHarvestCrop,
  dayProgress = 50,
  isRainyDay = false
}) => {
  const [time, setTime] = useState(Date.now());
  
  // Update time for growth calculations
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Camera controls for scene
  const CameraControls = () => {
    const { camera } = useThree();
    
    useEffect(() => {
      // Set initial camera position
      camera.position.set(15, 15, 15);
      camera.lookAt(0, 0, 0);
    }, [camera]);
    
    return null;
  };
  
  // Calculate grid dimensions from plots
  const gridDimensions = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    
    plots.forEach(plot => {
      maxX = Math.max(maxX, plot.position.x);
      maxY = Math.max(maxY, plot.position.y);
    });
    
    return { 
      width: (maxX + 1) * 2, 
      height: (maxY + 1) * 2,
      offsetX: 0,
      offsetZ: 0
    };
  }, [plots]);
  
  return (
    <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
      <CameraControls />
      
      {/* Environment */}
      <Environment 
        dayProgress={dayProgress}
        isRainyDay={isRainyDay}
      />
      
      {/* Landscape elements */}
      <Ground size={[gridDimensions.width + 5, gridDimensions.height + 5]} />
      <Mountains />
      <DistantHouses />
      <GrassTufts farmSize={[gridDimensions.width, gridDimensions.height]} />
      <TreeDecorations size={[gridDimensions.width, gridDimensions.height]} />
      
      {/* Fence around the farm */}
      <Fence 
        width={gridDimensions.width + 1} 
        height={gridDimensions.height + 1} 
      />
      
      {/* Plot components */}
      {plots.map(plot => (
        <Plot
          key={plot.id}
          plot={plot}
          onSelect={() => onSelectPlot(plot.id)}
          onHarvest={() => onHarvestCrop(plot.id)}
        />
      ))}
      
      {/* Controls with limited movement */}
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        maxDistance={50}
        minDistance={10}
      />
    </Canvas>
  );
};

export default IsometricView;
