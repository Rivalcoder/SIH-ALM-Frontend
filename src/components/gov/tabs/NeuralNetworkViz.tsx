"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, Html, Float, Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// --- Types ---
interface NeuralNetworkVizProps {
    data: {
        label: string;
        value: string | number;
        subtext?: string;
        color?: string;
    }[];
}

// --- Components ---

function Connection({ start, end, color = "#4f46e5" }: { start: THREE.Vector3; end: THREE.Vector3; color?: string }) {
    const points = useMemo(() => [start, end], [start, end]);
    const lineRef = useRef<any>(null);

    useFrame((state) => {
        if (lineRef.current) {
            // Simple pulsing opacity or width could be added here if line supports it
            // manipulating material directly
            lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <Line
            ref={lineRef}
            points={points}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.5}
        />
    );
}

function Node({ position, data, color = "#3b82f6", isCenter = false }: { position: [number, number, number]; data?: any; color?: string; isCenter?: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!hovered) {
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
        }
        // Pulse effect
        const t = state.clock.getElapsedTime();
        const scale = isCenter ? 1.5 + Math.sin(t) * 0.1 : 0.8 + Math.sin(t * 2 + position[0]) * 0.1;
        meshRef.current.scale.setScalar(hovered ? scale * 1.2 : scale);
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <dodecahedronGeometry args={[isCenter ? 1 : 0.6, 0]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isCenter ? 2 : 1}
                    roughness={0.2}
                    metalness={0.8}
                    wireframe={isCenter}
                />
            </mesh>

            {/* Inner glow core */}
            <mesh scale={isCenter ? 0.8 : 0.4}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="white" transparent opacity={0.5} />
            </mesh>

            {/* Label - Only for data nodes */}
            {!isCenter && data && (
                <Html distanceFactor={12} position={[0, 1.2, 0]} className="pointer-events-none">
                    <div className="bg-black/80 border border-blue-500/50 p-3 rounded-lg backdrop-blur-md min-w-[140px] text-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <div className="text-xs text-blue-300 font-mono tracking-wider mb-1 uppercase opacity-80">{data.label}</div>
                        <div className="text-lg font-bold text-white tracking-widest bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                            {data.value}
                        </div>
                        {data.subtext && <div className="text-[10px] text-gray-400 mt-1">{data.subtext}</div>}
                    </div>
                </Html>
            )}
        </group>
    );
}

function NetworkScene({ data }: { data: NeuralNetworkVizProps['data'] }) {
    const centerPos = new THREE.Vector3(0, 0, 0);
    // Distribute nodes on a sphere
    const nodes = useMemo(() => {
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
        return data.map((item, i) => {
            const y = 1 - (i / (data.length - 1)) * 2; // y goes from 1 to -1
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;

            // Scale up to separate them
            const scale = 5.5;
            return {
                pos: new THREE.Vector3(x * scale, y * scale, z * scale),
                data: item
            };
        });
    }, [data]);

    // Particles moving along connections
    const Particles = () => {
        const particleCount = 20;
        const particles = useMemo(() => new Array(particleCount).fill(0).map(() => ({
            speed: 0.02 + Math.random() * 0.05,
            offset: Math.random(),
            targetIndex: Math.floor(Math.random() * data.length)
        })), []);

        return (
            <group>
                {particles.map((p, i) => (
                    <Particle key={i} speed={p.speed} offset={p.offset} targetPos={nodes[p.targetIndex].pos} />
                ))}
            </group>
        )
    }

    const Particle = ({ speed, offset, targetPos }: { speed: number, offset: number, targetPos: THREE.Vector3 }) => {
        const meshRef = useRef<THREE.Mesh>(null!);

        useFrame((state) => {
            const t = (state.clock.getElapsedTime() * speed + offset) % 1;
            // Move from center (0,0,0) to targetPos
            const currentPos = new THREE.Vector3().lerpVectors(centerPos, targetPos, t);
            // Create a parabolic arc
            const height = Math.sin(t * Math.PI) * 1;
            currentPos.y += height;

            meshRef.current.position.copy(currentPos);
            // Fade in/out at ends
            const opacity = Math.sin(t * Math.PI);
            (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
        });

        return (
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color="#a5f3fc" transparent />
            </mesh>
        )
    }


    return (
        <group>
            {/* Center Brain Node */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Node position={[0, 0, 0]} isCenter color="#6366f1" />
            </Float>

            {/* Satellite Nodes and Connections */}
            {nodes.map((node, i) => (
                <group key={i}>
                    <Connection start={centerPos} end={node.pos} color={node.data.color || "#3b82f6"} />
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
                        <Node position={[node.pos.x, node.pos.y, node.pos.z]} data={node.data} color={node.data.color} />
                    </Float>
                </group>
            ))}

            <Particles />

        </group>
    );
}


export default function NeuralNetworkViz({ data }: NeuralNetworkVizProps) {
    return (
        <div className="w-full h-[500px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-800 relative group">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    NEURAL ANALYSIS KERNEL
                </h2>
                <div className="flex items-center gap-2 text-xs text-blue-400/60 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    LIVE DATA STREAM
                </div>
            </div>

            <Canvas camera={{ position: [0, 0, 14], fov: 45 }} dpr={[1, 2]}>
                <color attach="background" args={['#020617']} />

                {/* Cinematic Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#4f46e5" />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#06b6d4" />
                <spotLight position={[0, 10, 0]} intensity={2} angle={0.5} penumbra={1} color="#818cf8" />

                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} color="#60a5fa" />

                <NetworkScene data={data} />

                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                />

                {/* Post-processing feel (using fog for depth) */}
                <fog attach="fog" args={['#020617', 10, 25]} />
            </Canvas>
        </div>
    );
}
