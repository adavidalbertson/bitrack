import { GroupProps, ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import Jack from "../components/Jack";
import Knob from "../components/Knob";

export type OscillatorProps = GroupProps & {
    setControlsDisabled: (x: boolean) => void
    jackStartDrag: (e: ThreeEvent<PointerEvent>) => void
    jackEndDrag: (e: ThreeEvent<PointerEvent>) => void
    audioCtx: AudioContext
}

export default function Oscillator({ setControlsDisabled, jackStartDrag, jackEndDrag, audioCtx, ...props }: OscillatorProps) {
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
        amp.current = new GainNode(audioCtx, {
            gain: 1,
        })
        osc.current.connect(amp.current).connect(audioCtx.destination)
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
        <Knob setControlsDisabled={setControlsDisabled} position={[0, 1, 0]} updateParameter={updateFreq} minValue={100} maxValue={300} initialValue={200} />
        <Jack position={[0, 0, 0]} onPointerDown={jackStartDrag} onPointerUp={jackEndDrag} />
        <Jack position={[0, -1, 0]} onPointerDown={jackStartDrag} onPointerUp={jackEndDrag} />
        <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={'greenyellow'} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}