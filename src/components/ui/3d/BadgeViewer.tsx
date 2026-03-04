"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Float,
    Center,
    Text3D,
    Environment,
    ContactShadows,
    Sparkles
} from "@react-three/drei";
import * as THREE from "three";

// Premium 3D Badge (Nishon) component
function BadgeMesh({ color = "#00b4d8", metalness = 0.9, roughness = 0.1 }: { color?: string, metalness?: number, roughness?: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Constant elegant rotation
            groupRef.current.rotation.y += delta * 0.4;

            // Hover scale effect
            const targetScale = hovered ? 1.15 : 1;
            groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1);
            groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.1);
            groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.1);
        }
    });

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: metalness,
        roughness: roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2,
    });

    const ringMaterial = new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 1,
        roughness: 0.1,
        clearcoat: 0.5,
        envMapIntensity: 3,
    });

    return (
        <group
            ref={groupRef}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            rotation={[Math.PI / 8, 0, 0]} // Default slight tilt for better view
        >
            {/* Main Badge Base */}
            <mesh>
                <cylinderGeometry args={[1.2, 1.2, 0.2, 64]} />
                <primitive object={bodyMaterial} />
            </mesh>

            {/* Outer Glowing Rim */}
            <mesh position={[0, 0, 0]}>
                <torusGeometry args={[1.2, 0.08, 32, 64]} />
                <meshStandardMaterial
                    color="#FFD700"
                    emissive="#FFD700"
                    emissiveIntensity={hovered ? 0.8 : 0.2}
                    metalness={1}
                    roughness={0.2}
                />
            </mesh>

            {/* Inner Ring Decorative */}
            <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.05, 64]} />
                <primitive object={ringMaterial} side={THREE.DoubleSide} />
            </mesh>

            {/* Center Star / Logo Place */}
            <mesh position={[0, 0.15, 0]}>
                <octahedronGeometry args={[0.4, 0]} />
                <meshPhysicalMaterial
                    color="#ffeb3b"
                    metalness={0.9}
                    roughness={0.1}
                    emissive={hovered ? "#ffeb3b" : "#000000"}
                    emissiveIntensity={hovered ? 0.5 : 0}
                />
            </mesh>

            {/* Tiny stars/sparks around badge */}
            {hovered && (
                <Sparkles
                    count={20}
                    scale={3}
                    size={4}
                    speed={0.4}
                    opacity={0.8}
                    color="#FFD700"
                    position={[0, 0, 0]}
                />
            )}
        </group>
    );
}

export function BadgeViewer() {
    return (
        <div className="w-full h-full min-h-[300px] relative drop-shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-black/5 to-white/5">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                {/* Perfect lighting for metallic surfaces */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow color="#ffffff" />
                <directionalLight position={[-5, 5, 5]} intensity={1} color="#00b4d8" />
                <pointLight position={[0, 0, 5]} intensity={2} distance={10} color="#FFD700" />

                {/* Advanced Environment for reflection */}
                <Environment preset="night" />

                <Float speed={2} rotationIntensity={0.3} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
                    <BadgeMesh />
                </Float>

                {/* Dramatic soft shadow below */}
                <ContactShadows
                    position={[0, -2, 0]}
                    opacity={0.7}
                    scale={10}
                    blur={2.5}
                    far={4}
                    color="#000000"
                />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
}
