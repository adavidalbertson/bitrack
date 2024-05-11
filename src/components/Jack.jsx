import { useRef, useState } from 'react'
import { MetalMaterial } from './materials/Materials'

import * as THREE from 'three'

export default function Jack(props) {
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