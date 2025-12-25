import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';

const AnimatedSphere = ({ isSpeaking }) => {
    const sphereRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        sphereRef.current.rotation.x = time * 0.2;
        sphereRef.current.rotation.y = time * 0.3;

        const scale = isSpeaking ? 1 + Math.sin(time * 10) * 0.05 : 1 + Math.sin(time * 2) * 0.02;
        sphereRef.current.scale.set(scale, scale, scale);
    });

    return (
        <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2}>
            <MeshDistortMaterial
                color={isSpeaking ? "#4F46E5" : "#3B82F6"}
                attach="material"
                distort={isSpeaking ? 0.5 : 0.3}
                speed={isSpeaking ? 3 : 1.5}
                roughness={0.4}
                metalness={0.1}
            />
        </Sphere>
    );
};

const Avatar = ({ isSpeaking }) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60A5FA" />
                <AnimatedSphere isSpeaking={isSpeaking} />
                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
};

export default Avatar;
