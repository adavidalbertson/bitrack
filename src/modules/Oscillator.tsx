import { useContext, useEffect, useRef, useState } from "react";
import { ConnectionContext } from "../App";
import { InputJack, OutputJack } from "../components/Jack";
import Knob from "../components/Knob";
import { ModuleProps } from "../components/Props";

export type OscillatorProps = ModuleProps & {
    minFreq?: number
    maxFreq?: number
    initialFreq?: number
}

export default function Oscillator({ minFreq = 110, initialFreq = 220, maxFreq = 440, color = 0x101010, ...props }: OscillatorProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const [freq, setFreq] = useState(220)
    const osc = useRef(new OscillatorNode(audioCtx, {
        type: "triangle",
        frequency: freq,
    }))
    const freqModAmt = useRef(new GainNode(audioCtx, { gain: 1 }))

    useEffect(() => {
        try {
            osc.current.stop()
        } catch {
            // Sometimes it's already stopped
        }
        osc.current = new OscillatorNode(audioCtx, {
            type: "triangle",
            frequency: freq,
        })
        freqModAmt.current.connect(osc.current.frequency)
        osc.current.start()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioCtx])

    const updateFreq = (f: number) => {
        setFreq(f)
        osc.current.frequency.exponentialRampToValueAtTime(f, audioCtx.currentTime + 0.2)
    }

    const updateFreqModAmt = (g: number) => {
        // setFreq(f)
        freqModAmt.current.gain.exponentialRampToValueAtTime(g, audioCtx.currentTime + 0.2)
    }

    return <group
        {...props}
    >
        <Knob position={[0, 1, 0]} updateParameter={updateFreq} minValue={minFreq} maxValue={maxFreq} initialValue={initialFreq} />
        <Knob position={[0, 0.33333, 0]} updateParameter={updateFreqModAmt} minValue={0} maxValue={100} initialValue={1} />
        <InputJack position={[0, -0.33333, 0]} audioNode={freqModAmt.current} />
        <OutputJack position={[0, -1, 0]} audioNode={osc.current} />
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}