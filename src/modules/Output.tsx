import { GroupProps } from "@react-three/fiber";
import { useContext } from "react";
import { ModuleContext } from "../App";
import { InputJack } from "../components/Jack";

export default function Output({ ...props }: GroupProps) {
    const { audioCtx } = useContext(ModuleContext)
    return <group
        {...props}
    >
        <InputJack position={[0, 0, 0]} audioNode={audioCtx.destination} />
        <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={'dimgray'} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}