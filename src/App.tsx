import { Environment, Lightformer, MapControls, SoftShadows } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { createContext, useRef, useState } from 'react'
import { ColorRepresentation } from 'three'
import { InputJackRef, JackRef, Jacks } from './components/Jack'
import Wire, { WirePreview } from './components/Wire'
import { createWireColor } from './constants'
import Filter from './modules/Filter'
import Mixer from './modules/Mixer'
import Mult from './modules/Mult'
import Oscillator from './modules/Oscillator'
import Output from './modules/Output'
import Power from './modules/Power'
import Reverb from './modules/Reverb'
import Amp from './modules/Amp'
import Envelope from './modules/Envelope'
import { Perf } from 'r3f-perf'
import { Knobs } from './components/Knob'


export type WireConnection = {
    source: JackRef
    dest: JackRef
    color?: ColorRepresentation
}

export type PartialConnection = {
    source?: JackRef
    dest?: InputJackRef
    color?: ColorRepresentation
}

const mainAudioContext = new AudioContext()
mainAudioContext.suspend()

export const ConnectionContext = createContext<{
    setControlsDisabled: (x: boolean) => void
    connect: (audioConnection: PartialConnection) => void
    audioCtx: AudioContext
    wires: WireConnection[]
}>({
    setControlsDisabled: () => { },
    connect: () => { },
    audioCtx: mainAudioContext,
    wires: []
})

export default function App() {
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [controlsDisabled, setControlsDisabled] = useState<boolean>(false)
    const [wires, setWires] = useState<WireConnection[]>([])
    const [draggingConnection, setDraggingConnection] = useState<PartialConnection>({})
    const audioCtx = useRef<AudioContext>(mainAudioContext)

    const plug = (connection: PartialConnection) => {
        const fullConnection = { ...draggingConnection, ...connection }
        if (fullConnection.source && fullConnection.dest && fullConnection.source !== fullConnection.dest) {
            setWires(oldWires => [...oldWires, fullConnection as WireConnection])
            // Dang this is awkward
            if ((fullConnection.dest.audioNode as AudioNode).connect) {
                fullConnection.source.audioNode.connect(fullConnection.dest.audioNode as AudioNode)
            } else {
                fullConnection.source.audioNode.connect(fullConnection.dest.audioNode as AudioParam)
            }
            setIsDragging(false)
        } else {
            setDraggingConnection({ color: connection.color || createWireColor(), ...connection })
            setIsDragging(true)
        }
    }

    const unplug = (jackId: string) => {
        setIsDragging(true)
        const existingConnection = wires.find(w => w.source.id === jackId || w.dest.id === jackId)!
        try {
            existingConnection.source.audioNode.disconnect(existingConnection.dest.audioNode)
        } catch {
            // Sometimes they're already disconnected
        }
        const nextConnection: PartialConnection = existingConnection.dest.id === jackId ? { source: existingConnection.source } : { dest: existingConnection.dest }
        nextConnection.color = existingConnection.color
        setDraggingConnection(nextConnection)
        setWires(oldwires => oldwires.filter(w => w.source.id !== jackId && w.dest.id !== jackId))
    }

    const powerSwitch = (powered: boolean) => {
        if (powered) {
            audioCtx.current.resume()
        } else {
            audioCtx.current.suspend()
        }
    }

    return (
        <ConnectionContext.Provider value={{ setControlsDisabled, connect: plug, audioCtx: audioCtx.current, wires }} >
            <Canvas shadows onPointerUp={() => { setIsDragging(false); setDraggingConnection(null!) }}>
                <Perf />
                <Jacks>
                    <Knobs>
                        <ambientLight intensity={1} />
                        <directionalLight position={[5, 5, 10]} shadow-mapSize={2048} shadow-bias={-0.0001} castShadow intensity={5}>
                            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 1, 100]} />
                        </directionalLight>
                        <Oscillator position={[-3.5, 0.75, 0]} minFreq={0.1} initialFreq={1} maxFreq={20} waveType={'triangle'} color={'darkgray'} label={'LFO'} labelColor={0x0000aa} labelAngle={0} />
                        <Oscillator position={[-3.5 + 1.5, 0.75, 0]} label={"VCO1"} />
                        <Oscillator position={[-2.5 + 1.5, 0.75, 0]} label={"VCO2"} />
                        <Oscillator position={[-1.5 + 1.5, 0.75, 0]} label={"VCO3"} waveType={'square'} />
                        <Oscillator position={[1.5, 0.75, 0]} minFreq={0.1} initialFreq={1} maxFreq={20} waveType={'triangle'} color={'darkgray'} label={'LFO'} labelColor={0x0000aa} labelAngle={0} />
                        <Filter position={[-2.3, -2, 0]} color={0x103040} />
                        <Mixer position={[1.7, -2, 0]} numInputs={4} />
                        <Power position={[3, 1.75, 0]} powerSwitch={powerSwitch} color={'darkslategray'} />
                        <Output position={[3, -0.25, 0]} color={'dimgray'} />
                        <Mult position={[-4.75, 1.38, 0]} rotation={[0, 0, Math.PI / 2]} numOutputs={3} labelAngle={0} />
                        <Mult position={[-4.75, -1.33, 0]} rotation={[0, 0, -Math.PI / 2]} numOutputs={4} labelAngle={Math.PI} />
                        <Reverb position={[-4.75 + 2.15 - (0.75 / 2), 3.2, 0]} />
                        <Envelope position={[3.5 - 2.15 + (0.75 / 2), 3.2, 0]} />
                        <Amp position={[4.2, 0.75, 0]} rotation={[0, 0, -Math.PI / 2]} />
                        {wires.map((w, i) => <Wire connection={w} key={i} unplug={unplug} />)}
                        {isDragging && <WirePreview connection={draggingConnection} />}
                        <MapControls enabled={!isDragging && !controlsDisabled} />
                        <mesh receiveShadow position={[0, 0, -1.01]} >
                            <planeGeometry args={[20, 20]} />
                            <shadowMaterial transparent opacity={0.5} />
                        </mesh>
                        <SoftShadows size={40} samples={20} />
                        <Environment resolution={64} >
                            <group rotation={[-Math.PI * 0 / 4, 0, 0]}>
                                <Lightformer form="ring" intensity={1} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[2, 100, 1]} />
                                <Lightformer form="rect" intensity={0.5} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[100, 10, 1]} />
                            </group>
                        </Environment>
                    </Knobs>
                </Jacks>
            </Canvas>
        </ConnectionContext.Provider >
    )
}
