/* eslint-disable react/no-unknown-property */
import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import * as THREE from "three"

function MetalMaterial({side, hovered}) {
  return <meshStandardMaterial
      color={hovered ? 'hotpink' : 'white'}
      roughness={0.25}
      metalness={1}
      side={ side ? side : THREE.FrontSide}
    />
}

function Jack(props) {
  const ref = useRef()
  const [hovered, hover] = useState(false)

  return (
    <group
      {...props}
      ref={ref}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={() => hover(false)}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]} >
        <cylinderGeometry args={[0.25, 0.25, 0.05, 6, 1, false]} />
        <MetalMaterial hovered={hovered} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.15, 0.25, 0.02, 6, 1, true]} />
        <MetalMaterial hovered={hovered} flatshading/>
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.0625]}>
        <ringGeometry args={[0, 0.15, 12]} />
        <meshStandardMaterial color={'black'} roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0625]}>
        <cylinderGeometry args={[0.15, 0.15, 0.15, 32, 1, true]} />
        <MetalMaterial hovered={hovered} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0625]}>
        <cylinderGeometry args={[0.13, 0.13, 0.19, 32, 1, true]} />
        <MetalMaterial hovered={hovered} side={THREE.BackSide}/>
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1475]}>
        <cylinderGeometry args={[0.13, 0.15, 0.02, 32, 1, true]} />
        <MetalMaterial hovered={hovered} />
      </mesh>
    </group>
  )
}

const wireColors = ['black', 'gray', 'white', 'red']

function Wire({start, end, color}) {
  const path = [start.clone().setZ(0.775), start.clone().setZ(0.9), end.clone().setZ(0.9), end.clone().setZ(0.775)]
  // CurveType = "centripetal" | "chordal" | "catmullrom";
  const curve = new THREE.CatmullRomCurve3(path, false, "chordal", 0.75)
  const wireGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false)
  
  return <group>
    <Plug position={start} color={color} />
    <Plug position={end} color={color} />
    <mesh geometry={wireGeometry}>
      <meshStandardMaterial color={color} roughness={0.25} metalness={0} />
    </mesh>
  </group>
}

function Plug({color, position}) {
  return <group>
    {/* <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0625]}> */}
    <mesh rotation={[Math.PI / 2, 0, 0]} position={position}>
      <cylinderGeometry args={[0.1, 0.1, 0.5, 32, 1, false]} />
      <MetalMaterial />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={position.clone().setZ(0.325)}>
      <cylinderGeometry args={[0.13, 0.13, 0.3, 32, 1, false]} />
      <meshStandardMaterial color={color} roughness={0.25} metalness={0} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={position.clone().setZ(0.625)}>
      <cylinderGeometry args={[0.1, 0.13, 0.3, 32, 1, false]} />
      <meshStandardMaterial color={color} roughness={0.25} metalness={0} />
    </mesh>
  </group>
}

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
