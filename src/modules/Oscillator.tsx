import { Text } from "@react-three/drei";
import { useContext, useEffect, useRef } from "react";
import { ConnectionContext } from "../App";
import { InputJack, OutputJack } from "../components/Jack";
import Knob from "../components/Knob";
import { MetalMaterial } from "../components/materials/Materials";
import { ModuleProps } from "../components/Props";

export type OscillatorProps = ModuleProps & {
    minFreq?: number
    maxFreq?: number
    initialFreq?: number
    waveType?: "sine" | "square" | "sawtooth" | "triangle"
}

export default function Oscillator({ minFreq = 110, initialFreq = 220, maxFreq = 440, waveType = 'sawtooth', color = 0x101010, label = 'VCO', labelColor, labelAngle = Math.PI / 6, ...props }: OscillatorProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const osc = useRef(new OscillatorNode(audioCtx, {
        type: waveType,
        frequency: initialFreq,
    }))
    const freqModAmt = useRef(new GainNode(audioCtx, { gain: 1 }))

    useEffect(() => {
        start()
    })

    const start = () => {
        try {
            freqModAmt.current.connect(osc.current.frequency)
        } catch {
            // Usually already connected
        }
        try {
            osc.current.start()
        } catch {
            // Usually already started
        }
    }

    const updateFreq = (f: number) => {
        osc.current.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.04)
    }

    const updateFreqModAmt = (g: number) => {
        freqModAmt.current.gain.setTargetAtTime(g, audioCtx.currentTime, 0.04)
    }

    return <group
        {...props}
    >
        <Text position={[0, 1.5, 0.0001]} scale={0.2}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
        <group position={[0, -0.15, 0]}>
            <Knob position={[0, 1.2, 0]} updateParameter={updateFreq} minValue={minFreq} maxValue={maxFreq} initialValue={initialFreq} exponential label={label + ' FREQ'} labelColor={labelColor} labelAngle={labelAngle} />
            <Knob position={[0, 0.4, 0]} updateParameter={updateFreqModAmt} minValue={0} maxValue={100} initialValue={1} label={label + ' MOD AMT'} labelColor={labelColor} labelAngle={labelAngle} />
            <InputJack position={[0, -0.4, 0]} audioNode={freqModAmt.current} label={label + ' MOD'} labelColor={labelColor} labelAngle={labelAngle} />
            <OutputJack position={[0, -1.2, 0]} audioNode={osc.current} label={label + ' OUT'} labelColor={labelColor} labelAngle={labelAngle} />
        </group>
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[1, 3.5, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}