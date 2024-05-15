import { MapControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { JackRef } from './components/Jack'
import Wire from './components/Wire'
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
        existingConnection.source.audioNode.disconnect(existingConnection.dest.audioNode)
        setDraggingConnection(existingConnection.dest.id === jackId ? { source: existingConnection.source } : { dest: existingConnection.dest })
        setWires(oldwires => oldwires.filter(w => w.source.id !== jackId && w.dest.id !== w.dest.id))
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
        <Canvas onPointerUp={() => { console.log("Release without plugging"); setIsDragging(false); setDraggingConnection(null!) }}>
            <ambientLight intensity={Math.PI} />
            <spotLight position={[5, 5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
            <spotLight position={[-5, -5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
            <pointLight position={[-5, 5, 20]} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, 5, 1]} decay={0} intensity={Math.PI} />
            <pointLight position={[10, 15, 1]} decay={0} intensity={Math.PI} />
            <Power position={[-1.5, 0.75, 0]} powerSwitch={powerSwitch} />
            <Oscillator position={[0, 1.75, 0]} connect={plug} setControlsDisabled={setControlsDisabled} audioCtx={audioCtx.current} wires={wires} />
            <Oscillator position={[0, -1.75, 0]} connect={plug} setControlsDisabled={setControlsDisabled} audioCtx={audioCtx.current} wires={wires} />
            <Output position={[1.5, 0, 0]} connect={plug} setControlsDisabled={setControlsDisabled} audioCtx={audioCtx.current} wires={wires} />
            {wires.map((w, i) => <Wire connection={w} key={i} unplug={unplug} />)}
            <MapControls enabled={!isDragging && !controlsDisabled} />
        </Canvas>
    )
}
