import { GroupProps } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { ModuleContext } from "../App";
import { OutputJack } from "../components/Jack";
import Knob from "../components/Knob";

export default function Oscillator({ ...props }: GroupProps) {
    const { audioCtx } = useContext(ModuleContext)
    const [freq, setFreq] = useState(220)
    const osc = useRef(new OscillatorNode(audioCtx, {
        type: "triangle",
        frequency: freq,
    }))

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
        osc.current.start()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioCtx])

    const updateFreq = (f: number) => {
        setFreq(f)
        osc.current.frequency.exponentialRampToValueAtTime(f, audioCtx.currentTime + 0.2)
    }

    return <group
        {...props}
    >
        <Knob position={[0, 1, 0]} updateParameter={updateFreq} minValue={110} maxValue={440} initialValue={220} />
        <OutputJack position={[0, 0, 0]} audioNode={osc.current} />
        <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[1, 3, 1]} />
            <meshStandardMaterial color={'greenyellow'} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}