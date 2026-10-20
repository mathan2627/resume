import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { Terminal, ShieldCheck, Sparkles } from "lucide-react";

interface SkillNodeData {
  id: string;
  name: string;
  category: string;
  evidence: string;
  color: string;
  position: [number, number, number];
  size: number;
}

const NODES: SkillNodeData[] = [
  { id: "react", name: "React", category: "Frontend", evidence: "95% Assessed", color: "#38bdf8", position: [-2.2, 1.2, 0.5], size: 0.35 },
  { id: "ts", name: "TypeScript", category: "Frontend", evidence: "GitHub Proven", color: "#60a5fa", position: [-1.2, 2.0, -0.6], size: 0.32 },
  { id: "nextjs", name: "Next.js", category: "Full-Stack", evidence: "Live Repo AST", color: "#818cf8", position: [-2.8, -0.4, 0.2], size: 0.3 },
  { id: "python", name: "Python", category: "AI/Backend", evidence: "Challenge Passed", color: "#34d399", position: [2.0, 1.4, -0.4], size: 0.36 },
  { id: "ai", name: "Gemini / AI", category: "AI/ML", evidence: "Vector Embedding", color: "#a78bfa", position: [1.3, 2.2, 0.6], size: 0.38 },
  { id: "go", name: "Go / Systems", category: "Backend", evidence: "Concurrency Tests", color: "#22d3ee", position: [2.5, -0.2, 0.4], size: 0.32 },
  { id: "docker", name: "Docker", category: "DevOps", evidence: "Config Verified", color: "#38bdf8", position: [1.8, -1.5, -0.5], size: 0.28 },
  { id: "postgres", name: "PostgreSQL", category: "Database", evidence: "SQL Rubric 90%", color: "#f472b6", position: [-1.4, -1.8, 0.4], size: 0.3 },
  { id: "core", name: "ProofPath Hub", category: "Intelligence", evidence: "Verified Core", color: "#6366f1", position: [0, 0, 0], size: 0.5 },
];

const CONNECTIONS: [string, string][] = [
  ["core", "react"],
  ["core", "python"],
  ["core", "ai"],
  ["core", "ts"],
  ["core", "go"],
  ["core", "postgres"],
  ["react", "ts"],
  ["react", "nextjs"],
  ["python", "ai"],
  ["go", "docker"],
  ["postgres", "docker"],
  ["ts", "nextjs"],
];

// Interactive Node Component
function SkillNode({
  node,
  isHovered,
  onHover,
}: {
  node: SkillNodeData;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isCore = node.id === "core";

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isCore) {
        meshRef.current.rotation.y += delta * 0.4;
      }
    }
  });

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(node.id);
          }}
          onPointerOut={() => onHover(null)}
          scale={isHovered ? 1.3 : 1}
        >
          <sphereGeometry args={[node.size, 32, 32]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={isHovered ? 0.9 : isCore ? 0.6 : 0.3}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Outer Halo Ring for core or hovered */}
        {(isCore || isHovered) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[node.size * 1.3, node.size * 1.45, 32]} />
            <meshBasicMaterial color={node.color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* HTML Tag / Tooltip */}
        <Html
          position={[0, node.size + 0.3, 0]}
          center
          distanceFactor={10}
          className="pointer-events-none select-none transition-all duration-200"
        >
          <div
            className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-semibold whitespace-nowrap shadow-xl border flex items-center gap-1.5 transition-all ${
              isHovered
                ? "bg-slate-900/95 text-white border-cyan-400 scale-110"
                : "bg-slate-950/70 text-slate-300 border-white/10"
            }`}
          >
            {isCore ? (
              <Sparkles className="w-3 h-3 text-indigo-400" />
            ) : isHovered ? (
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
            ) : (
              <Terminal className="w-3 h-3 text-blue-400" />
            )}
            <span>{node.name}</span>
            {isHovered && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-normal">
                {node.evidence}
              </span>
            )}
          </div>
        </Html>
      </Float>
    </group>
  );
}

// Connecting Lines
function ConstellationLines({ hoveredId }: { hoveredId: string | null }) {
  const lineData = useMemo(() => {
    const nodeMap = new Map<string, [number, number, number]>();
    for (const n of NODES) {
      nodeMap.set(n.id, n.position);
    }

    return CONNECTIONS.map(([startId, endId]) => {
      const start = nodeMap.get(startId);
      const end = nodeMap.get(endId);
      if (!start || !end) return null;

      const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const isConnected = hoveredId === startId || hoveredId === endId;

      return { geometry, isConnected, key: `${startId}-${endId}` };
    }).filter(Boolean);
  }, [hoveredId]);

  return (
    <group>
      {lineData.map((line) => {
        if (!line) return null;
        return (
          <primitive
            key={line.key}
            object={
              new THREE.Line(
                line.geometry,
                new THREE.LineBasicMaterial({
                  color: line.isConnected ? 0x38bdf8 : 0x334155,
                  transparent: true,
                  opacity: line.isConnected ? 0.9 : 0.35,
                  linewidth: line.isConnected ? 2 : 1,
                })
              )
            }
          />
        );
      })}
    </group>
  );
}

// Particle Dust System
function ParticleDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#38bdf8"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Scene Root with Pointer Parallax
function ConstellationScene({ hoveredId, setHoveredId }: { hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const sceneRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (sceneRef.current) {
      const targetX = (state.pointer.x * Math.PI) / 12;
      const targetY = (-state.pointer.y * Math.PI) / 16;
      sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, targetX, 0.05);
      sceneRef.current.rotation.x = THREE.MathUtils.lerp(sceneRef.current.rotation.x, targetY, 0.05);
    }
  });

  return (
    <group ref={sceneRef}>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#818cf8" />
      <pointLight position={[0, 0, 5]} intensity={1.2} color="#ffffff" />

      <ParticleDust />
      <ConstellationLines hoveredId={hoveredId} />

      {NODES.map((node) => (
        <SkillNode
          key={node.id}
          node={node}
          isHovered={hoveredId === node.id}
          onHover={setHoveredId}
        />
      ))}
    </group>
  );
}

// Graceful CSS Fallback for WebGL-disabled or Reduced Motion
function FallbackConstellation() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center p-6">
      <div className="relative w-full max-w-lg aspect-square rounded-full border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-slate-900/40 to-transparent flex items-center justify-center">
        {/* Core Ring */}
        <div className="w-32 h-32 rounded-full border border-cyan-400/40 bg-blue-600/10 flex flex-col items-center justify-center text-center p-3 animate-pulse">
          <Sparkles className="w-6 h-6 text-cyan-400 mb-1" />
          <span className="text-xs font-bold text-white">ProofPath</span>
          <span className="text-[10px] text-cyan-300">Evidence Hub</span>
        </div>

        {/* Orbiting Badges */}
        {NODES.slice(0, 6).map((node, i) => {
          const angle = (i * 2 * Math.PI) / 6;
          const radius = 140;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={node.id}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
              <span>{node.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const SkillConstellationScene: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL || prefersReducedMotion) {
    return <FallbackConstellation />;
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px]">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ConstellationScene hoveredId={hoveredId} setHoveredId={setHoveredId} />
      </Canvas>

      {/* Interactive Helper Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[11px] text-slate-400 flex items-center gap-1.5 pointer-events-none select-none">
        <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
        <span>Hover nodes to inspect verified skill pathways</span>
      </div>
    </div>
  );
};
