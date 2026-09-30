import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Cylinder } from '@react-three/drei'
import { useRef, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import useBuildingStore from '../../store/buildingStore'

// ── Building geometry constants ─────────────────────────────────────────────
const FLOOR_H = 0.35       // Each floor height in 3D units
const FLOOR_W = 5          // Building width
const FLOOR_D = 4          // Building depth
const COURT_W = 1.5        // Courtyard void width
const COURT_D = 1.2        // Courtyard void depth
const FLOORS = [
  { code:'B1', num:-1, color:'#6B7280', label:'Basement', type:'basement' },
  { code:'G',  num: 0, color:'#F59E0B', label:'Ground',   type:'commercial' },
  { code:'1F', num: 1, color:'#FBBF24', label:'1st Floor',type:'commercial' },
  { code:'2F', num: 2, color:'#22C55E', label:'2nd Floor',type:'residential' },
  { code:'3F', num: 3, color:'#14B8A6', label:'3rd–Sky',  type:'terrace' },
  { code:'4F', num: 4, color:'#22C55E', label:'4th Floor',type:'residential' },
  { code:'5F', num: 5, color:'#22C55E', label:'5th Floor',type:'residential' },
  { code:'6F', num: 6, color:'#14B8A6', label:'6th–Sky',  type:'terrace' },
  { code:'7F', num: 7, color:'#22C55E', label:'7th Floor',type:'residential' },
  { code:'8F', num: 8, color:'#22C55E', label:'8th Floor',type:'residential' },
  { code:'9F', num: 9, color:'#0EA5E9', label:'9th–Sky',  type:'terrace' },
]

// Individual floor slab mesh
function FloorSlab({ floorNum, color, code, isActive, onClick, showStructure, louverAngle }) {
  const y = floorNum * FLOOR_H
  const opacity = isActive ? 1 : 0.35
  const scale = isActive ? 1.02 : 1

  return (
    <group position={[0, y, 0]} onClick={() => onClick(code)}>
      {/* Main slab – with courtyard void cutout (simulated via two halves) */}
      <Box args={[(FLOOR_W - COURT_W) / 2, FLOOR_H * 0.9, FLOOR_D]} position={[-(FLOOR_W + COURT_W) / 4, 0, 0]}>
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.6} />
      </Box>
      <Box args={[(FLOOR_W - COURT_W) / 2, FLOOR_H * 0.9, FLOOR_D]} position={[(FLOOR_W + COURT_W) / 4, 0, 0]}>
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.6} />
      </Box>
      {/* Front slab bridge */}
      <Box args={[COURT_W, FLOOR_H * 0.9, (FLOOR_D - COURT_D) / 2]} position={[0, 0, -(FLOOR_D + COURT_D) / 4]}>
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.6} />
      </Box>
      {/* Back slab bridge */}
      <Box args={[COURT_W, FLOOR_H * 0.9, (FLOOR_D - COURT_D) / 2]} position={[0, 0, (FLOOR_D + COURT_D) / 4]}>
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.6} />
      </Box>

      {/* Structural columns (visible when showStructure) */}
      {showStructure && [[-2.2,-1.8],[-2.2,1.8],[2.2,-1.8],[2.2,1.8],[0,-1.8],[0,1.8]].map(([cx,cz],i) => (
        <Cylinder key={i} args={[0.06,0.06,FLOOR_H,8]} position={[cx, 0, cz]}>
          <meshStandardMaterial color="#94A3B8" roughness={0.4} />
        </Cylinder>
      ))}

      {/* Kinetic louvers on east face (visible when showStructure) */}
      {showStructure && [0.3,0.6,0.9,1.2,1.5,1.8].map((lz,i) => (
        <Box key={i} args={[0.04, 0.02, 0.6]} position={[FLOOR_W / 2 + 0.15, 0, lz - 1]}>
          <meshStandardMaterial
            color="#F59E0B"
            transparent opacity={0.8}
            side={THREE.DoubleSide}
          />
        </Box>
      ))}
    </group>
  )
}

// Courtyard green core
function CourtyardVoid() {
  return (
    <group position={[0, 4.5 * FLOOR_H, 0]}>
      {/* Green glow cylinder through courtyard */}
      <Cylinder args={[0.5, 0.5, 9 * FLOOR_H, 16, 1, true]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#22C55E" transparent opacity={0.12} side={THREE.DoubleSide} />
      </Cylinder>
      {/* Green particles (simplified as small spheres) */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[
          (Math.sin(i * 0.8) * 0.4),
          (i - 4) * FLOOR_H * 1.1,
          (Math.cos(i * 0.8) * 0.4),
        ]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#16A34A" emissive="#16A34A" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -FLOOR_H, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1E293B" roughness={0.9} />
    </mesh>
  )
}

function BuildingScene({ activeFloor, setActiveFloor, layers, louverAngle }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <pointLight position={[0, 5, 0]} color="#22C55E" intensity={0.4} />

      <Ground />
      <CourtyardVoid />

      {FLOORS.map((floor) => {
        const isActive = activeFloor === floor.code || activeFloor === 'ALL'
        return (
          <FloorSlab
            key={floor.code}
            floorNum={floor.num}
            color={floor.color}
            code={floor.code}
            isActive={isActive}
            onClick={setActiveFloor}
            showStructure={layers.structure}
            louverAngle={louverAngle}
          />
        )
      })}

      <OrbitControls
        enablePan makeDefault
        minDistance={4} maxDistance={30}
        target={[0, 2, 0]}
      />
      <Environment preset="city" />
    </>
  )
}

export default function BuildingModel3D({ activeFloor, onFloorClick }) {
  const { layers, louverAngle } = useBuildingStore()
  const [hovered, setHovered] = useState(null)

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [12, 8, 12], fov: 45 }}
        shadows
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <BuildingScene
            activeFloor={activeFloor}
            setActiveFloor={onFloorClick}
            layers={layers}
            louverAngle={louverAngle}
          />
        </Suspense>
      </Canvas>

      {/* Overlay tips */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
        <div>🖱 Drag to orbit · Scroll to zoom</div>
        <div>Click any floor to select it</div>
      </div>
    </div>
  )
}
