import { useCallback, useContext, useLayoutEffect, useRef, useState } from "react";
import { ConnectionContext } from "../App";
import { OutputJack } from "../components/Jack";
import Knob from "../components/Knob";
import LED from "../components/LED";
import { ModuleProps } from "../components/Props";

type SequencerProps = ModuleProps & {
    steps?: number
}

export default function Sequencer({ steps = 8, color = 0x101010, ...props }: SequencerProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const outs = useRef(new ConstantSourceNode(audioCtx, { offset: 0 }))
    const values = useRef<number[]>(new Array(steps).fill(0))
    const [step, setStep] = useState(0)
    const beatTimeout = useRef<ReturnType<typeof setTimeout>>()

    useLayoutEffect(() => {
        outs.current = new ConstantSourceNode(audioCtx, { offset: 0 })
        audioCtx.onstatechange = () => {
            if (audioCtx.state === "running") {
                advance(0)
            } else if (audioCtx.state === "suspended") {
                clearTimeout(beatTimeout.current)
                setStep(0)
            }
        }
    }, [audioCtx])

    const advance = useCallback((s: number) => {
        try {
            outs.current.start()
        } catch {
            // Usually already started
            console.log("no restart")
        }

        outs.current.offset.cancelScheduledValues(audioCtx.currentTime)
        outs.current.offset.linearRampToValueAtTime(values.current[s], audioCtx.currentTime + 0.01)
        const nextStep = (s + 1) % steps
        beatTimeout.current = setTimeout(() => {
            setStep(nextStep)
            advance(nextStep)
        }, 1000)
    }, [step, values, outs])

    const updateValue = (s: number) => (v: number) => {
        values.current = values.current.map(
            (sv, si) => si === s ? v : sv
        )
    }

    return <group {...props}>
        {values.current.map((_, s) => {
            return <Knob key={`step-${s}`} position={[0.6 * (s - ((steps) / 2)), 0, 0]} updateParameter={updateValue(s)} />
        }
        )}
        <OutputJack position={[0.6 * (steps) / 2, 0, 0]} audioNode={outs.current} label={"OUT "} />
        {[...Array(steps)].map((_, s) => <LED key={`step-${s}-led`} position={[0.6 * (s - ((steps) / 2)), -0.4, 0]} intensity={step === s ? 1 : 0} />)}
        <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[0.6 * (steps + 1), 1.25, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}