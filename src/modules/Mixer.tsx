import { useEffect, useState } from "react"
import { InputJack, OutputJack } from "../components/Jack"
import Knob from "../components/Knob"
import { ModuleProps } from "./Props"

export type MixerProps = ModuleProps & {
    numInputs?: number
}

export default function Mixer({ audioCtx, numInputs = 2, connect, setControlsDisabled, wires, ...props }: MixerProps) {
    const [inputs, setInputs] = useState<GainNode[]>([])
    const [output, setOutput] = useState<ChannelMergerNode>(new ChannelMergerNode(audioCtx, { numberOfInputs: numInputs }))

    useEffect(() => {
        const nextOutput = new ChannelMergerNode(audioCtx, { numberOfInputs: numInputs })

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
        // inputs[i].gain.cancelScheduledValues(audioCtx.currentTime)
        inputs[i].gain.exponentialRampToValueAtTime(level, audioCtx.currentTime + 0.2)
    }

    return <group
        {...props}
    >
        {inputs.map((v, i) =>
            <group position={[0.75 * (i - (numInputs) / 2), 0, 0]} key={i}>
                <InputJack position={[0, 0.3, 0]} audioNode={v} connect={connect} setControlsDisabled={setControlsDisabled} wires={wires} />
                <Knob position={[0, -0.3, 0]} setControlsDisabled={setControlsDisabled} updateParameter={updateGain(i)} initialValue={v.gain.value} />
            </group>
        )}
        <OutputJack position={[0.75 * numInputs / 2, 0, 0]} audioNode={output} connect={connect} setControlsDisabled={setControlsDisabled} wires={wires} />
        <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[0.75 * (numInputs + 1), 1.25, 1]} />
            <meshStandardMaterial color={'black'} roughness={1} metalness={0.5} />
        </mesh>
    </group>
}