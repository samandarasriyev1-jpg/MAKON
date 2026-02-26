"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Center, Text3D } from "@react-three/drei";
import * as THREE from "three";

function BadgeMesh({ color = "#FFD700", metalness = 1, roughness = 0.2, text = "1" }: { color?: string, metalness?: number, roughness?: number, text?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Subtle idle rotation
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            if (hovered) {
                meshRef.current.rotation.y += delta * 2;
            }
        }
    });

    return (
        <group
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.1 : 1}
        >
            <mesh ref={meshRef}>
                <cylinderGeometry args={[1, 1, 0.2, 32]} />
                <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />

                {/* Inner ring */}
                <mesh position={[0, 0.11, 0]}>
                    <ringGeometry args={[0.7, 0.9, 32]} />
                    <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} side={THREE.DoubleSide} />
                </mesh>
            </mesh>
        </group>
    );
}

export function BadgeViewer() {
    return (
        <div className="w-full h-full min-h-[200px] relative">
            <Canvas camera={{ position: [0, 4, 0], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <directionalLight position={[-10, 10, -5]} intensity={0.5} />

                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        <BadgeMesh color="#C0C0C0" />
                    </group>
                </Float>

                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
}
