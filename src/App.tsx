import { MapControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { createContext, useRef, useState } from 'react'
import { JackRef } from './components/Jack'
import Wire from './components/Wire'
import Mixer from './modules/Mixer'
import Oscillator from './modules/Oscillator'
import Output from './modules/Output'
import Power from './modules/Power'


export type WireConnection = {
    source: JackRef
    dest: JackRef
}

export type WireConnectionInProgress = {
    source?: JackRef
    dest?: JackRef
}

export const ConnectionContext = createContext<{
    setControlsDisabled: (x: boolean) => void
    connect: (audioConnection: WireConnectionInProgress) => void
    audioCtx: AudioContext
    wires: WireConnection[]
}>(null!)

export default function App() {
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [controlsDisabled, setControlsDisabled] = useState<boolean>(false)
    const [wires, setWires] = useState<WireConnection[]>([])
    const [draggingConnection, setDraggingConnection] = useState<WireConnectionInProgress>({})
    const audioCtx = useRef<AudioContext>(new AudioContext())

    const plug = (connection: WireConnectionInProgress) => {
        const fullConnection = { ...draggingConnection, ...connection }
        if (fullConnection.source && fullConnection.dest && fullConnection.source !== fullConnection.dest) {
            setWires(oldWires => [...oldWires, fullConnection as WireConnection])
            fullConnection.source.audioNode.connect(fullConnection.dest.audioNode)
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
            <Canvas onPointerUp={() => { console.log("Release without plugging"); setIsDragging(false); setDraggingConnection(null!) }}>
                <ambientLight intensity={Math.PI} />
                <spotLight position={[5, 5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
                <spotLight position={[-5, -5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
                <pointLight position={[-5, 5, 20]} decay={0} intensity={Math.PI} />
                <pointLight position={[-10, 5, 1]} decay={0} intensity={Math.PI} />
                <pointLight position={[10, 15, 1]} decay={0} intensity={Math.PI} />
                <Power position={[-2.25, 0.75, 0]} powerSwitch={powerSwitch} color={'darkslategray'} />
                <Oscillator position={[-0.75, 0.75, 0]} />
                <Oscillator position={[0.75, 0.75, 0]} />
                <Mixer position={[0, -2, 0]} numInputs={4} />
                <Output position={[2.25, 0.75, 0]} color={'dimgray'} />
                {wires.map((w, i) => <Wire connection={w} key={i} unplug={unplug} />)}
                <MapControls enabled={!isDragging && !controlsDisabled} />
            </Canvas>
        </ConnectionContext.Provider>
    )
}
