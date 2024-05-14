import { MapControls } from '@react-three/drei'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import Power from './components/Power'
import Wire, { WireProps } from './components/Wire'
import Oscillator from './modules/Oscillator'


export default function App() {
    const [startJack, setStartJack] = useState<THREE.Vector3 | null>(null)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [wires, setWires] = useState<WireProps[]>([])
    const audioCtx = useRef<AudioContext>(new AudioContext())

    const startDrag = (e: ThreeEvent<PointerEvent>) => {
        setIsDragging(true)
        const pos = new THREE.Vector3()
        e.eventObject.getWorldPosition(pos)
        setStartJack(pos)
        console.log("Start drag ", e.eventObject)
    }

    const endDrag = (e: ThreeEvent<PointerEvent>) => {
        setIsDragging(false)
        const pos = new THREE.Vector3()
        e.eventObject.getWorldPosition(pos)
        if (startJack && startJack !== pos) {
            const newWire: WireProps = {
                start: startJack,
                end: pos,
            }
            setWires(oldWires => [...oldWires, newWire])
            console.log("End drag ", e.eventObject)
            setStartJack(null)
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

    const jackPositions: THREE.Vector3[] = []
    for (let x = 0; x < 6; x++) {
        for (let y = 1; y < 4; y++) {
            jackPositions.push(new THREE.Vector3(x - 3.5, y - 1.5, 0))
        }
    }
    for (let x = 0; x < 3; x++) {
        jackPositions.push(new THREE.Vector3(x - 0.5, -1.5, 0))
    }

    const knobPositions: THREE.Vector3[] = []
    for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 4; y++) {
            knobPositions.push(new THREE.Vector3(x + 2.5, y - 1.5, 0))
        }
    }
    const balancedKnobPositions: THREE.Vector3[] = []
    for (let x = 0; x < 3; x++) {
        balancedKnobPositions.push(new THREE.Vector3(x - 3.5, -1.5, 0))
    }

    return (
        <Canvas>
            <ambientLight intensity={Math.PI} />
            <spotLight position={[5, 5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
            <spotLight position={[-5, -5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
            <pointLight position={[-5, 5, 20]} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, 5, 1]} decay={0} intensity={Math.PI} />
            <pointLight position={[10, 15, 1]} decay={0} intensity={Math.PI} />
            <Power position={[- 3.5, 2.5, 0]} powerSwitch={powerSwitch} />
            <Oscillator position={[-4.5, 0, 0]} jackStartDrag={startDrag} jackEndDrag={endDrag} setControlsDisabled={setIsDragging} audioCtx={audioCtx.current} />
            {wires.map((w, i) => <Wire start={w.start} end={w.end} key={i} />)}
            <MapControls enabled={!isDragging} />
        </Canvas>
    )
}
