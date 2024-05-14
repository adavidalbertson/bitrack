import { useRef, useState } from 'react'
import * as THREE from 'three'
import { MetalMaterial, PlasticMaterial } from "./materials/Materials"

const wireColors = [
    0x000000,
    0x1f1f1f,
    0x3f3f3f,
    0x7f7f7f,
    0xffffff,
    0xdd0808,
    0xdd0808,
]

export type WireProps = {
    start: THREE.Vector3
    end: THREE.Vector3
}

export default function Wire({ start, end }: WireProps) {
    const ref = useRef<THREE.Group>(null!)
    const [color] = useState(new THREE.Color(wireColors[Math.floor(Math.random() * wireColors.length)]))
    const path = [start.clone().setZ(0.775), start.clone().setZ(0.9), end.clone().setZ(0.9), end.clone().setZ(0.775)]
    const curve = new THREE.CatmullRomCurve3(path, false, "chordal", 0.75)
    const wireGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false)

    return <group ref={ref}>
        <Plug position={start} color={color} />
        <Plug position={end} color={color} />
        <mesh geometry={wireGeometry}>
            <PlasticMaterial color={color} />
        </mesh>
    </group>
}

type PlugProps = {
    color: THREE.Color
    position: THREE.Vector3
}

function Plug({ color, position }: PlugProps) {
    return <group>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={position}>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 32, 1, false]} />
            <MetalMaterial />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={position.clone().setZ(0.325)}>
            <cylinderGeometry args={[0.13, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={position.clone().setZ(0.625)}>
            <cylinderGeometry args={[0.1, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} />
        </mesh>
    </group>
}