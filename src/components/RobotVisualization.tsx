import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { JointAngles } from '@/types/robot';
import { Box } from 'lucide-react';

interface RobotArmProps {
  joints: JointAngles;
}

function RobotArm({ joints }: RobotArmProps) {
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  const primaryColor = '#22d3ee';
  const secondaryColor = '#475569';
  const accentColor = '#eab308';

  const materials = useMemo(() => ({
    primary: new THREE.MeshStandardMaterial({ 
      color: primaryColor, 
      metalness: 0.8, 
      roughness: 0.2 
    }),
    secondary: new THREE.MeshStandardMaterial({ 
      color: secondaryColor, 
      metalness: 0.6, 
      roughness: 0.4 
    }),
    accent: new THREE.MeshStandardMaterial({ 
      color: accentColor, 
      metalness: 0.7, 
      roughness: 0.3 
    }),
  }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Base Platform */}
      <mesh position={[0, 0.1, 0]} material={materials.secondary}>
        <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
      </mesh>

      {/* Base Rotation Group */}
      <group rotation={[0, degToRad(joints.base), 0]}>
        {/* Base Column */}
        <mesh position={[0, 0.5, 0]} material={materials.primary}>
          <cylinderGeometry args={[0.25, 0.35, 0.8, 16]} />
        </mesh>

        {/* Shoulder Joint Housing */}
        <mesh position={[0, 0.95, 0]} material={materials.secondary}>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
        </mesh>

        {/* Shoulder Pitch Group */}
        <group position={[0, 1.1, 0]} rotation={[degToRad(joints.shoulder), 0, 0]}>
          {/* Upper Arm */}
          <mesh position={[0, 0.6, 0]} material={materials.primary}>
            <boxGeometry args={[0.2, 1.2, 0.25]} />
          </mesh>

          {/* Elbow Joint Housing */}
          <mesh position={[0, 1.2, 0]} material={materials.secondary}>
            <sphereGeometry args={[0.18, 16, 16]} />
          </mesh>

          {/* Elbow Pitch Group */}
          <group position={[0, 1.2, 0]} rotation={[degToRad(joints.elbow), 0, 0]}>
            {/* Forearm */}
            <mesh position={[0, 0.5, 0]} material={materials.primary}>
              <boxGeometry args={[0.15, 1, 0.2]} />
            </mesh>

            {/* Wrist Housing */}
            <mesh position={[0, 1, 0]} material={materials.secondary}>
              <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
            </mesh>

            {/* Wrist Rotation Group */}
            <group position={[0, 1.1, 0]} rotation={[0, degToRad(joints.wrist), 0]}>
              {/* End Effector Mount */}
              <mesh position={[0, 0.1, 0]} material={materials.accent}>
                <cylinderGeometry args={[0.08, 0.1, 0.2, 16]} />
              </mesh>

              {/* Gripper Fingers */}
              <mesh position={[0.06, 0.25, 0]} material={materials.accent}>
                <boxGeometry args={[0.03, 0.15, 0.08]} />
              </mesh>
              <mesh position={[-0.06, 0.25, 0]} material={materials.accent}>
                <boxGeometry args={[0.03, 0.15, 0.08]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

interface RobotVisualizationProps {
  joints: JointAngles;
}

export function RobotVisualization({ joints }: RobotVisualizationProps) {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-primary" />
          <span className="panel-title">3D Visualization</span>
        </div>
        <span className="text-xs text-muted-foreground">Click and drag to rotate</span>
      </div>

      <div className="flex-1 canvas-container rounded-b-lg overflow-hidden">
        <Canvas
          camera={{ position: [4, 3, 4], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#22d3ee" />

          <RobotArm joints={joints} />

          <Grid
            args={[10, 10]}
            position={[0, 0, 0]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#1e293b"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#334155"
            fadeDistance={15}
            fadeStrength={1}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2}
          />

          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  );
}
