import { Environment, Lightformer, MapControls, SoftShadows } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { createContext, useRef, useState } from 'react'
import { InputJackRef, JackRef } from './components/Jack'
import Wire, { WirePreview } from './components/Wire'
import Filter from './modules/Filter'
import Mixer from './modules/Mixer'
import Oscillator from './modules/Oscillator'
import Output from './modules/Output'
import Power from './modules/Power'


export type WireConnection = {
    source: JackRef
    dest: JackRef
}

export type PartialConnection = {
    source?: JackRef
    dest?: InputJackRef
}

export const ConnectionContext = createContext<{
    setControlsDisabled: (x: boolean) => void
    connect: (audioConnection: PartialConnection) => void
    audioCtx: AudioContext
    wires: WireConnection[]
}>({
    setControlsDisabled: () => { },
    connect: () => { },
    audioCtx: new AudioContext(),
    wires: []
})

export default function App() {
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [controlsDisabled, setControlsDisabled] = useState<boolean>(false)
    const [wires, setWires] = useState<WireConnection[]>([])
    const [draggingConnection, setDraggingConnection] = useState<PartialConnection>({})
    const audioCtx = useRef<AudioContext>(new AudioContext())

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
            setDraggingConnection(connection)
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
        setDraggingConnection(existingConnection.dest.id === jackId ? { source: existingConnection.source } : { dest: existingConnection.dest })
        setWires(oldwires => oldwires.filter(w => w.source.id !== jackId && w.dest.id !== jackId))
    }

    const powerSwitch = (powered: boolean) => {
        console.log(audioCtx.current)
        if (powered) {
            console.log("power on!")
            audioCtx.current.resume()
        } else {
            audioCtx.current.suspend()
            console.log("power off!")
        }
    }

    return (
        <ConnectionContext.Provider value={{ setControlsDisabled, connect: plug, audioCtx: audioCtx.current, wires }} >
            <Canvas shadows onPointerUp={() => { setIsDragging(false); setDraggingConnection(null!) }}>
                <ambientLight intensity={1} />
                <directionalLight position={[5, 5, 10]} shadow-mapSize={2048} shadow-bias={-0.0001} castShadow intensity={5}>
                    <orthographicCamera attach="shadow-camera" args={[-5, 5, 10, -5, 1, 100]} />
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
                {wires.map((w, i) => <Wire connection={w} key={i} unplug={unplug} />)}
                {isDragging && <WirePreview connection={draggingConnection} />}
                <MapControls enabled={!isDragging && !controlsDisabled} />
                <mesh receiveShadow scale={20} position={[0, 0, -1.01]} >
                    <planeGeometry />
                    <shadowMaterial transparent opacity={0.5} />
                </mesh>
                <SoftShadows size={40} samples={20} />
                <Environment resolution={64} >
                    <group rotation={[-Math.PI * 0 / 4, 0, 0]}>
                        <Lightformer form="ring" intensity={1} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[2, 100, 1]} />
                        <Lightformer form="rect" intensity={0.5} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[100, 10, 1]} />
                    </group>
                </Environment>
            </Canvas>
        </ConnectionContext.Provider >
    )
}
