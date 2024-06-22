import { Text } from "@react-three/drei"
import { useContext, useEffect, useState } from "react"
import { ConnectionContext } from "../App"
import { InputJack, OutputJack } from "../components/Jack"
import Knob from "../components/Knob"
import { MetalMaterial } from "../components/materials/Materials"
import { ModuleProps } from "../components/Props"

export type MixerProps = ModuleProps & {
    numInputs?: number
}

export default function Mixer({ numInputs = 2, color = 0x101010, label = "MIX", labelColor, labelAngle = Math.PI / 6, ...props }: MixerProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const [inputs, setInputs] = useState<GainNode[]>([])
    const [output, setOutput] = useState<GainNode>(new GainNode(audioCtx, { gain: 1 }))

    useEffect(() => {
        const nextOutput = new GainNode(audioCtx, { gain: 1 })

        const nextInputs: GainNode[] = []
        for (let i = 0; i < numInputs; i++) {
            const nextNode = new GainNode(audioCtx, { gain: inputs[i] ? inputs[i].gain.value : 0.5 })
            nextInputs.push(nextNode)
            nextNode.connect(nextOutput)
        }
        setInputs(nextInputs)
        setOutput(nextOutput)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioCtx, numInputs])

    const updateGain = (i: number) => (level: number) => {
        inputs[i].gain.setTargetAtTime(level, audioCtx.currentTime, 0.04)
    }

    return <group
        {...props}
    >
        {inputs.map((v, i) =>
            <group position={[0.75 * (i - (numInputs) / 2), 0, 0]} key={i}>
                <InputJack position={[0, 0.3, 0]} audioNode={v} label={"IN " + (i + 1)} labelColor={labelColor} labelAngle={labelAngle} />
                <Knob position={[0, -0.3, 0]} updateParameter={updateGain(i)} initialValue={v.gain.value} label={"LVL " + (i + 1)} labelColor={labelColor} labelAngle={labelAngle} />
            </group>
        )}
        <Text position={[0.75 * numInputs / 2, 0.4, 0.0001]} scale={0.2}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
        <OutputJack position={[0.75 * numInputs / 2, 0, 0]} audioNode={output} label={"OUT"} labelColor={labelColor} labelAngle={labelAngle} />
        <mesh position={[0, -0.05, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[0.75 * (numInputs + 1), 1.3, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}