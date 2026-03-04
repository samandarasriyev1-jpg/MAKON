"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Float,
    Environment,
    ContactShadows,
    Text3D,
    Center
} from "@react-three/drei";
import * as THREE from "three";

// A Premium procedural trophy using basic Three.js shapes, stylized like glass/gold with MAKON 'M' logo
function TrophyMesh(props: any) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Rotate slowly
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.3;
            // Add a slight interactive tilt on hover
            const targetX = hovered ? 0.1 : 0;
            const targetZ = hovered ? 0.1 : 0;
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.1);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, 0.1);
        }
    });

    const premiumGoldMaterial = new THREE.MeshPhysicalMaterial({
        color: "#Ffb703", // Vivid Premium Gold
        metalness: 0.9,
        roughness: 0.15,
        envMapIntensity: 2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: hovered ? "#FFD700" : "#000000",
        emissiveIntensity: hovered ? 0.3 : 0,
    });

    const darkBaseMaterial = new THREE.MeshStandardMaterial({
        color: "#0f172a", // Slate 900
        metalness: 0.8,
        roughness: 0.6,
    });

    const silverAccent = new THREE.MeshStandardMaterial({
        color: "#e2e8f0",
        metalness: 1,
        roughness: 0.1,
    });

    return (
        <group
            ref={groupRef}
            {...props}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.05 : 1}
        >
            {/* Base Bottom */}
            <mesh position={[0, -1.4, 0]}>
                <cylinderGeometry args={[0.9, 1.1, 0.3, 64]} />
                <primitive object={darkBaseMaterial} />
            </mesh>
            {/* Base Top Accent */}
            <mesh position={[0, -1.2, 0]}>
                <cylinderGeometry args={[0.85, 0.9, 0.1, 64]} />
                <primitive object={silverAccent} />
            </mesh>

            {/* Stem */}
            <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.15, 0.4, 1.5, 32]} />
                <primitive object={premiumGoldMaterial} />
            </mesh>

            {/* Stem details (Rings) */}
            <mesh position={[0, -0.8, 0]}>
                <torusGeometry args={[0.3, 0.05, 16, 32]} />
                <primitive object={silverAccent} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <torusGeometry args={[0.2, 0.05, 16, 32]} />
                <primitive object={silverAccent} />
            </mesh>

            {/* Cup Bowl */}
            <mesh position={[0, 0.9, 0]}>
                <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
                <meshPhysicalMaterial
                    color={hovered ? "#ffeb3b" : "#Ffb703"}
                    metalness={1}
                    roughness={0.1}
                    side={THREE.DoubleSide}
                    envMapIntensity={2.5}
                    clearcoat={1}
                />
            </mesh>

            {/* Left Handle */}
            <mesh position={[-1.1, 0.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <torusGeometry args={[0.5, 0.08, 32, 64, Math.PI]} />
                <primitive object={premiumGoldMaterial} />
            </mesh>

            {/* Right Handle */}
            <mesh position={[1.1, 0.8, 0]} rotation={[0, Math.PI, Math.PI / 4]}>
                <torusGeometry args={[0.5, 0.08, 32, 64, Math.PI]} />
                <primitive object={premiumGoldMaterial} />
            </mesh>

            {/* Floating MAKON M Logo inside Cup */}
            <group position={[0, 0.6, 0]}>
                <Center>
                    <Text3D
                        font="https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_bold.typeface.json"
                        size={0.6}
                        height={0.2}
                        curveSegments={12}
                        bevelEnabled
                        bevelThickness={0.02}
                        bevelSize={0.02}
                        bevelOffset={0}
                        bevelSegments={5}
                    >
                        M
                        <meshPhysicalMaterial
                            color="#ffffff"
                            metalness={1}
                            roughness={0}
                            transmission={0.9}
                            ior={1.5}
                            thickness={0.5}
                            envMapIntensity={3}
                            emissive={hovered ? "#00b4d8" : "#000000"}
                            emissiveIntensity={hovered ? 0.5 : 0}
                        />
                    </Text3D>
                </Center>
            </group>
        </group>
    );
}

export function RewardTrophy() {
    return (
        <div className="w-full h-full min-h-[350px] relative drop-shadow-2xl">
            <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
                {/* Premium Lighting Setup */}
                <ambientLight intensity={0.6} />
                <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={2.5} castShadow color="#ffffff" shadow-bias={-0.0001} />
                <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={1} color="#00b4d8" /> {/* Cool blue rim light */}
                <pointLight position={[0, 2, 5]} intensity={0.8} color="#FFD700" /> {/* Warm front light */}

                {/* Real-world reflection environment map */}
                <Environment preset="studio" />

                {/* The 3D Object */}
                <Float
                    speed={1.5}
                    rotationIntensity={0.2}
                    floatIntensity={0.8}
                    floatingRange={[-0.1, 0.1]}
                >
                    <TrophyMesh position={[0, 0.2, 0]} />
                </Float>

                {/* Glow/Shadow beneath */}
                <ContactShadows
                    position={[0, -1.8, 0]}
                    opacity={0.6}
                    scale={10}
                    blur={3}
                    far={4}
                    color="#000000"
                />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.7}
                />
            </Canvas>
        </div>
    );
}
