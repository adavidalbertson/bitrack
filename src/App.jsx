/* eslint-disable react/no-unknown-property */
import { MapControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import Jack from './components/Jack'
import Wire from './components/Wire'

const wireColors = ['black', 'gray', 'white', 'red']

export default function App() {
  const [startJack, setStartJack] = useState()
  const [isDragging, setIsDragging] = useState(false)
  const [wires, setWires] = useState([])

  const startDrag = (e) => {
    setIsDragging(true)
    setStartJack(e.eventObject.position)
    console.log("Start drag ", e.eventObject)
  }

  const endDrag = (e) => {
    setIsDragging(false)
    if (startJack && startJack !== e.eventObject.position) {
      const newWire = {
        start: startJack,
        end: e.eventObject.position,
        color: wireColors[Math.floor(Math.random()*wireColors.length)]
      }
      setWires(oldWires => [...oldWires, newWire])
      console.log("End drag ",  e.eventObject)
      setStartJack(null)
    }
  }

  let jackPositions = []
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 4; z++) {
      jackPositions.push([x - 3.5, z - 1.5, 0])
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
      { jackPositions.map((pos, i) => <Jack key={i} position={pos} onPointerDown={startDrag} onPointerUp={endDrag} />)} 
      { wires.map((w, i) => <Wire start={w.start} end={w.end} color={w.color} key={i} />) }
      <MapControls enabled={!isDragging} />
    </Canvas>
  )
}
