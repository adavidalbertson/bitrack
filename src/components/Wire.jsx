import * as THREE from 'three'
import { MetalMaterial } from "./materials/Materials"

const wireColors = ['black', 'gray', 'white', 'red']

export default function Wire({start, end, color}) {
  const path = [start.clone().setZ(0.775), start.clone().setZ(0.9), end.clone().setZ(0.9), end.clone().setZ(0.775)]
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

export function Plug({color, position}) {
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