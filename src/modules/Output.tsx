import { InputJack } from "../components/Jack";
import { ModuleProps } from "./Props";

export default function Output({ audioCtx, setControlsDisabled, connect, ...props }: ModuleProps) {
    return <group
        {...props}
    >
        <InputJack position={[0, 0, 0]} setControlsDisabled={setControlsDisabled} connect={connect} audioNode={audioCtx.destination} />
        <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={'dimgray'} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}