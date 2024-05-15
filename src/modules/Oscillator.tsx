import { useEffect, useRef, useState } from "react";
import { OutputJack } from "../components/Jack";
import Knob from "../components/Knob";
import { ModuleProps } from "./Props";

export default function Oscillator({ setControlsDisabled, connect, audioCtx, wires, ...props }: ModuleProps) {
    const [freq, setFreq] = useState(220)
    const osc = useRef(new OscillatorNode(audioCtx, {
        type: "triangle",
        frequency: freq,
    }))
    const amp = useRef(new GainNode(audioCtx, { gain: 1 }))

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
        // TODO: Move amp to its own module
        amp.current = new GainNode(audioCtx, {
            gain: 1,
        })
        osc.current.connect(amp.current)
        osc.current.start()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioCtx])

    const updateFreq = (f: number) => {
        setFreq(f)
        osc.current.frequency.cancelScheduledValues
        osc.current.frequency.exponentialRampToValueAtTime(f, audioCtx.currentTime + 0.2)
    }

    return <group
        {...props}
    >
        <Knob setControlsDisabled={setControlsDisabled} position={[0, 1, 0]} updateParameter={updateFreq} minValue={110} maxValue={440} initialValue={220} />
        <OutputJack position={[0, 0, 0]} setControlsDisabled={setControlsDisabled} audioNode={osc.current} connect={connect} wires={wires} />
        <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={'greenyellow'} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}