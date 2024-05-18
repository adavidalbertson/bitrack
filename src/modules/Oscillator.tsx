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
        try {
            osc.current.stop()
        } catch {
            // Sometimes it's already stopped
        }
        osc.current = new OscillatorNode(audioCtx, {
            type: waveType,
            frequency: osc.current.frequency.value,
        })
        freqModAmt.current = new GainNode(audioCtx, { gain: 1 })
        freqModAmt.current.connect(osc.current.frequency)
        osc.current.start()
    }, [audioCtx, waveType])

    const updateFreq = (f: number) => {
        osc.current.frequency.exponentialRampToValueAtTime(f, audioCtx.currentTime + 0.2)
    }

    const updateFreqModAmt = (g: number) => {
        freqModAmt.current.gain.exponentialRampToValueAtTime(g, audioCtx.currentTime + 0.2)
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