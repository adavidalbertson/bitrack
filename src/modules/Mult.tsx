import { useContext, useEffect, useState } from "react"
import { ConnectionContext } from "../App"
import { InputJack, OutputJack } from "../components/Jack"
import { ModuleProps } from "../components/Props"

export type MultProps = ModuleProps & {
    numOutputs?: number
}

export default function Mult({ numOutputs = 2, color = 0x101010, labelColor, labelAngle = Math.PI / 6, ...props }: MultProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const [input] = useState<GainNode>(new GainNode(audioCtx, { gain: 1 }))
    const [outputs, setOutputs] = useState<GainNode[]>([])

    useEffect(() => {
        const nextOutputs = []
        while (nextOutputs.length < numOutputs) {
            const addOutput = new GainNode(audioCtx, { gain: 1 })
            input.connect(addOutput)
            nextOutputs.push(addOutput)
        }
        setOutputs(nextOutputs)
    }, [audioCtx, input, numOutputs])

    return <group
        {...props}
    >
        <InputJack position={[-0.5 * (numOutputs / 2), 0, 0]} audioNode={input} label={"MULT IN"} labelColor={labelColor} labelAngle={labelAngle} />
        {outputs.map((v, i) => <OutputJack position={[0.5 * (i - (numOutputs / 2) + 1), 0, 0]} key={i} audioNode={v} label={"MULT " + (i + 1)} labelColor={labelColor} labelAngle={labelAngle} />)}
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[0.5 * (numOutputs + 1) + 0.25, 0.75, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}