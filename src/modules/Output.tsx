import { useContext } from "react";
import { ConnectionContext } from "../App";
import { InputJack } from "../components/Jack";
import { ModuleProps } from "../components/Props";

export default function Output({ color = 0x101010, ...props }: ModuleProps) {
    const { audioCtx } = useContext(ConnectionContext)

    return <group
        {...props}
    >
        <InputJack position={[0, 0, 0]} audioNode={audioCtx.destination} />
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}