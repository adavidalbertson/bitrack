import { Text } from "@react-three/drei";
import { useContext, useRef } from "react";
import { ConnectionContext } from "../App";
import { InputJack, OutputJack } from "../components/Jack";
import Knob from "../components/Knob";
import { ModuleProps } from "../components/Props";
import { MetalMaterial } from "../components/materials/Materials";

export default function Amp({ color = 0x010101, label = 'AMP', labelColor, labelAngle, ...props }: ModuleProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const amp = useRef(new GainNode(audioCtx, { gain: 0 }))

    const updateGain = (f: number) => {
        amp.current.gain.exponentialRampToValueAtTime(f, audioCtx.currentTime + 0.2)
    }

    return <group
        {...props}
    >
        <InputJack position={[-3 * 0.75 / 2, 0, 0]} audioNode={amp.current} label={"IN"} labelAngle={labelAngle} labelColor={labelColor} />
        <Knob position={[-0.75 / 2, 0, 0]} updateParameter={updateGain} minValue={0} initialValue={0} maxValue={1} label={"GAIN"} labelAngle={labelAngle} labelColor={labelColor} />
        <InputJack position={[0.75 / 2, 0, 0]} audioNode={amp.current.gain} label={"VCA MOD"} labelAngle={labelAngle} labelColor={labelColor} />
        <OutputJack position={[3 * 0.75 / 2, 0, 0]} audioNode={amp.current} label={"OUT"} labelAngle={labelAngle} labelColor={labelColor} />
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[3.1, 0.8, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
        <Text position={[-0.8, 0, 0.0001]} scale={0.2} rotation={[0, 0, Math.PI / 2]}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
    </group>
}