import { MapControls } from '@react-three/drei'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import Jack from './components/Jack'
import Wire, { WireProps } from './components/Wire'
import * as THREE from 'three'


export default function App() {
    const [startJack, setStartJack] = useState<THREE.Vector3 | null>(null)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [wires, setWires] = useState<WireProps[]>([])

    const startDrag = (e: ThreeEvent<PointerEvent>) => {
        setIsDragging(true)
        setStartJack(e.eventObject.position)
        console.log("Start drag ", e.eventObject)
    }

    const endDrag = (e: ThreeEvent<PointerEvent>) => {
        setIsDragging(false)
        if (startJack && startJack !== e.eventObject.position) {
            const newWire: WireProps = {
                start: startJack,
                end: e.eventObject.position,
            }
            setWires(oldWires => [...oldWires, newWire])
            console.log("End drag ", e.eventObject)
            setStartJack(null)
        }
    }

    const jackPositions: THREE.Vector3[] = []
    for (let x = 0; x < 8; x++) {
        for (let z = 0; z < 4; z++) {
            jackPositions.push(new THREE.Vector3(x - 3.5, z - 1.5, 0))
        }
    }

    return (
        <Canvas>
            <ambientLight intensity={Math.PI} />
            <spotLight position={[5, 5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
            <spotLight position={[-5, -5, 20]} angle={0.75} penumbra={1} decay={0} intensity={Math.PI / 2} />
            <pointLight position={[-5, 5, 20]} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, 5, 1]} decay={0} intensity={Math.PI} />
            <pointLight position={[10, 15, 1]} decay={0} intensity={Math.PI} />
            <mesh position={[-2.5, 0, -0.5]}>
                <boxGeometry args={[2.6, 3.6, 1]} />
                <meshStandardMaterial color={'darkSlateGray'} roughness={1} metalness={0.5} />
            </mesh>
            <mesh position={[1.5, 0, -0.5]}>
                <boxGeometry args={[4.6, 3.6, 1]} />
                <meshStandardMaterial color={'black'} roughness={1} metalness={0.5} />
            </mesh>
            {jackPositions.map((pos, i) => <Jack key={i} position={pos} onPointerDown={startDrag} onPointerUp={endDrag} />)}
            {wires.map((w, i) => <Wire start={w.start} end={w.end} key={i} />)}
            <MapControls enabled={!isDragging} />
        </Canvas>
    )
}