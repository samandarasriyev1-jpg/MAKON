"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Float,
    Environment,
    ContactShadows,
    useGLTF,
    MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";

// A procedural trophy using basic Three.js shapes, stylized like glass/gold
function TrophyMesh(props: any) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Rotate slowly
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <group
            ref={groupRef}
            {...props}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.1 : 1}
        >
            {/* Base */}
            <mesh position={[0, -1.2, 0]}>
                <cylinderGeometry args={[0.8, 1, 0.4, 32]} />
                <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Stem */}
            <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.2, 0.4, 1.2, 32]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
            </mesh>

            {/* Cup Bowl */}
            <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color={hovered ? "#FFD700" : "#D4AF37"}
                    metalness={1}
                    roughness={0.1}
                    emissive={hovered ? "#FFD700" : "#000000"}
                    emissiveIntensity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Left Handle */}
            <mesh position={[-1.1, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <torusGeometry args={[0.4, 0.1, 16, 32, Math.PI]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
            </mesh>

            {/* Right Handle */}
            <mesh position={[1.1, 0.6, 0]} rotation={[0, Math.PI, Math.PI / 4]}>
                <torusGeometry args={[0.4, 0.1, 16, 32, Math.PI]} />
                <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
            </mesh>

            {/* Center Crystal (Glass effect) */}
            <mesh position={[0, 0.5, 0]}>
                <octahedronGeometry args={[0.4]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={2}
                    chromaticAberration={0.025}
                    anisotropy={0.1}
                    distortion={0.1}
                    distortionScale={0.1}
                    temporalDistortion={0.2}
                    color="#00b4d8"
                />
            </mesh>
        </group>
    );
}

export function RewardTrophy() {
    return (
        <div className="w-full h-full min-h-[300px] relative">
            <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
                {/* Environment & Lighting */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="city" />

                {/* The 3D Object */}
                <Float
                    speed={2} // Animation speed, defaults to 1
                    rotationIntensity={0.5} // XYZ rotation intensity, defaults to 1
                    floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
                    floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
                >
                    <TrophyMesh position={[0, 0, 0]} />
                </Float>

                {/* Shadows */}
                <ContactShadows
                    position={[0, -1.5, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2}
                    far={4}
                    color="#00b4d8"
                />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 2}
                />
            </Canvas>
        </div>
    );
}
