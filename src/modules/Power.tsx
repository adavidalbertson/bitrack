import { Text } from "@react-three/drei";
import { useState } from "react";
import LED from "../components/LED";
import { MetalMaterial, PlasticMaterial } from "../components/materials/Materials";
import { ModuleProps } from "../components/Props";

export type PowerProps = ModuleProps & {
    powerSwitch: (powered: boolean) => void
}

export default function Power({ powerSwitch, color = 0x101010, label = 'PWR', labelColor = 0xff0000, ...props }: PowerProps) {
    const [powered, setPowered] = useState(false)

    return <group
        {...props}
    >
        <Text position={[0, 0.5, 0.0001]} scale={0.2}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
        <LED position={[-0.3, 0, 0]} intensity={powered ? 1 : 0} />
        <mesh position={[-0, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[1, 1.5, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.125]} >
            <boxGeometry args={[0.27, 0.53, 0.27]} />
            <PlasticMaterial />
        </mesh>
        <group
            onClick={() => { const p = !powered; setPowered(p); powerSwitch(p) }}
            rotation={[powered ? -Math.PI / 8 : 0, 0, 0]}
            position={[0, 0, 0.04]}
        >
            <mesh rotation={[0, 0, Math.PI / 2]} >
                <cylinderGeometry args={[0.25, 0.25, 0.25, 32, 1, false, 3 * Math.PI / 8, 9 * Math.PI / 8]} />
                <PlasticMaterial />
            </mesh>
            <group>
                <mesh rotation={[0, 0, Math.PI / 2]} >
                    <planeGeometry args={[0.5, 0.25]} />
                    <PlasticMaterial />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.125, 0.0001]}>
                    <ringGeometry args={[0.05, 0.06]} />
                    <MetalMaterial color={labelColor} />
                </mesh>
            </group>
            <group rotation={[(Math.PI / 8), 0, Math.PI / 2]}>
                <mesh  >
                    <planeGeometry args={[0.5, 0.25]} />
                    <PlasticMaterial />
                </mesh>
                <mesh position={[0.125, 0, 0.0001]}>
                    <planeGeometry args={[0.1, 0.01]} />
                    <MetalMaterial color={labelColor} />
                </mesh>
            </group>
        </group>
    </group>
}