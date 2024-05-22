import { Text } from "@react-three/drei";
import { useCallback, useContext, useEffect, useRef } from "react";
import { ConnectionContext } from "../App";
import { InputJack, OutputJack } from "../components/Jack";
import Knob from "../components/Knob";
import { ModuleProps } from "../components/Props";
import { MetalMaterial } from "../components/materials/Materials";

export default function Reverb({ color = 0x101010, label = "REVERB", labelAngle = 0, labelColor = 0xffffff, ...props }: ModuleProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const verb = useRef(new ConvolverNode(audioCtx))
    const input = useRef(new GainNode(audioCtx, { gain: 1 }))
    const wetGain = useRef(new GainNode(audioCtx, { gain: 1 }))
    const dryGain = useRef(new GainNode(audioCtx, { gain: 1 }))
    const output = useRef(new GainNode(audioCtx, { gain: 1 }))
    const verbLength = useRef(1)
    const lengthKnobTimeout = useRef<number>()

    const createConvolutionBuffers = useCallback(() => {
        const bufferLength = Math.round(audioCtx.sampleRate * verbLength.current)
        const generateBuffer = () => Float32Array.from([...Array(bufferLength)]
            .map(() => Math.pow(1 - Math.random() / 2, Math.pow(1 / 1000, 1 / bufferLength)))
        )

        const offlineAudioCtx = new OfflineAudioContext(2, bufferLength, audioCtx.sampleRate)
        const leftBuffer = generateBuffer()
        const rightBuffer = generateBuffer()
        const buffer = new AudioBuffer({ numberOfChannels: 2, length: bufferLength, sampleRate: audioCtx.sampleRate })
        buffer.copyToChannel(leftBuffer, 0)
        buffer.copyToChannel(rightBuffer, 1)
        const bufferNode = new AudioBufferSourceNode(offlineAudioCtx, {
            buffer: buffer
        })
        bufferNode.connect(offlineAudioCtx.destination)
        bufferNode.start()
        offlineAudioCtx.oncomplete = (e) => { bufferNode.stop(); verb.current.buffer = e.renderedBuffer }
        offlineAudioCtx.startRendering()
    }, [audioCtx.sampleRate])

    useEffect(() => {
        createConvolutionBuffers()
        input.current.connect(verb.current)
        input.current.connect(dryGain.current)
        verb.current.connect(wetGain.current)
        dryGain.current.connect(output.current)
        wetGain.current.connect(output.current)
    }, [audioCtx, createConvolutionBuffers])

    const updateDry = (f: number) => {
        dryGain.current.gain.exponentialRampToValueAtTime(f, audioCtx.currentTime + 0.2)
    }

    const updateWet = (f: number) => {
        wetGain.current.gain.exponentialRampToValueAtTime(f, audioCtx.currentTime + 0.2)
    }

    const updateLength = (f: number) => {
        clearTimeout(lengthKnobTimeout.current)
        lengthKnobTimeout.current = setTimeout(() => {
            verbLength.current = f
            createConvolutionBuffers()
        }, 250)
    }

    return <group
        {...props}
    >
        <InputJack position={[-1.5, 0, 0]} audioNode={input.current} label={"IN"} />
        <Knob position={[-0.75, 0, 0]} updateParameter={updateDry} minValue={0} maxValue={1} initialValue={1} label={"DRY"} labelAngle={labelAngle} labelColor={labelColor} />
        <Knob position={[0, 0, 0]} updateParameter={updateLength} minValue={0} maxValue={10} initialValue={1} label={"DECAY"} labelAngle={labelAngle} labelColor={labelColor} />
        <Knob position={[0.75, 0, 0]} updateParameter={updateWet} minValue={0} maxValue={2} initialValue={1} label={"WET"} labelAngle={labelAngle} labelColor={labelColor} />
        <OutputJack position={[1.5, 0, 0]} audioNode={output.current} label={"OUT"} />
        <mesh position={[-0.1, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[4.1, 0.8, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
        <Text position={[-2, 0, 0.0001]} scale={0.2} rotation={[0, 0, Math.PI / 2]}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
    </group>
}