import { MapControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import Wire from './components/Wire'
import Oscillator from './modules/Oscillator'
import Output from './modules/Output'
import Power from './modules/Power'


export type WireConnection = {
    sourcePos?: THREE.Vector3
    destPos?: THREE.Vector3

    sourceId?: string
    destId?: string

    sourceNode?: AudioNode
    destNode?: AudioNode
}

export default function App() {
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [wires, setWires] = useState<WireConnection[]>([])
    const [draggingConnection, setDraggingConnection] = useState<WireConnection>(null!)
    const audioCtx = useRef<AudioContext>(new AudioContext())

    const connect = (connection: WireConnection) => {
        const fullConnection = { ...draggingConnection, ...connection }
        if (fullConnection.sourcePos && fullConnection.destPos && fullConnection.sourcePos !== fullConnection.destPos) {
            setWires(oldWires => [...oldWires, fullConnection])
            console.log("Wire connected!")
            if (fullConnection.sourceNode && fullConnection.destNode) {
                console.log("Audio connected!")
                fullConnection.sourceNode.connect(fullConnection.destNode)
            }
        } else {
            setDraggingConnection(connection)
        }
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
            <Oscillator position={[0, 0, 0]} connect={connect} setControlsDisabled={setIsDragging} audioCtx={audioCtx.current} wires={wires} />
            <Output position={[1.5, 0, 0]} connect={connect} setControlsDisabled={setIsDragging} audioCtx={audioCtx.current} wires={wires} />
            {wires.map((w, i) => <Wire sourcePos={w.sourcePos!} destPos={w.destPos!} sourceId={w.sourceId!} destId={w.destId!} key={i} />)}
            <MapControls enabled={!isDragging} />
        </Canvas>
    )
}
