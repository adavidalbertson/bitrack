import { useContext } from "react";
import { ConnectionContext } from "../App";
import { InputJack } from "../components/Jack";
import { ModuleProps } from "../components/Props";
import { Text } from "@react-three/drei";
import { MetalMaterial } from "../components/materials/Materials";

export default function Output({ color = 0x101010, label = 'OUT', labelColor, ...props }: ModuleProps) {
    const { audioCtx } = useContext(ConnectionContext)

    return <group
        {...props}
    >
        <Text position={[0, 0.5, 0.0001]} scale={0.2}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
        <InputJack position={[0, 0, 0]} audioNode={audioCtx.destination} />
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}