import { ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from 'three'
import { PartialConnection, WireConnection } from '../App'
import { InputJackRef } from './Jack'
import { MetalMaterial, PlasticMaterial } from "./materials/Materials"

const wireColors = [
    'black',
    0x1f1f1f,
    0x3f3f3f,
    0x7f7f7f,
    0xffffff,
    0xdd0808,
    0xdd0808,
]

export function createWireColor(): THREE.ColorRepresentation {
    return wireColors[Math.floor(Math.random() * wireColors.length)]
}

export type WireProps = {
    connection: WireConnection
    unplug: (jackId: string) => void
}

export default function Wire({ connection, unplug }: WireProps) {
    const color = connection.color ? connection.color : createWireColor()
    const path = [connection.source.position.clone().setZ(0.775), connection.source.position.clone().setZ(0.9), connection.dest.position.clone().setZ(0.9), connection.dest.position.clone().setZ(0.775)]
    const curve = new THREE.CatmullRomCurve3(path, false, "chordal", 0.75)

    return <group>
        <Plug jack={connection.source} color={color} unplug={unplug} />
        <Plug jack={connection.dest} color={color} unplug={unplug} />
        <mesh castShadow receiveShadow>
            <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
            <PlasticMaterial color={color} />
        </mesh>
    </group>
}

type PlugProps = {
    color: THREE.ColorRepresentation
    jack: InputJackRef
    unplug?: (jackId: string) => void
}

function Plug({ color, jack, unplug = () => { } }: PlugProps) {
    return <group
        onPointerDown={() => unplug(jack.id)}
    >
        <mesh rotation={[Math.PI / 2, 0, 0]} position={jack.position} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 32, 1, false]} />
            <MetalMaterial />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={jack.position.clone().setZ(0.325)} castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={jack.position.clone().setZ(0.625)} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} />
        </mesh>
    </group>
}

export type WirePreviewProps = {
    connection: PartialConnection
}

export function WirePreview({ connection }: WirePreviewProps) {
    const jack = (connection.source || connection.dest)!
    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const [looseEnd, setLooseEnd] = useState<THREE.Vector3>(jack.position)

    const dragLooseEnd = (e: ThreeEvent<PointerEvent>) => {
        const intersect = new THREE.Vector3(0, 0, 0)
        e.ray.intersectPlane(intersectPlane, intersect)
        setLooseEnd(intersect)
    }

    const color = connection.color || createWireColor()
    const path = [jack.position.clone().setZ(0.775), jack.position.clone().setZ(0.9), looseEnd.clone().setZ(0.9), looseEnd.clone().setZ(0.775)]
    const curve = new THREE.CatmullRomCurve3(path, false, "chordal", 0.75)

    return <group onPointerMove={dragLooseEnd} >
        <PlugPreview position={jack.position} color={color} />
        <PlugPreview position={looseEnd} color={color} />
        <mesh castShadow receiveShadow>
            <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
            <PlasticMaterial color={color} transparent opacity={0.25} />
        </mesh>
        <mesh>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    </group>
}

type PreviewPlugProps = {
    position: THREE.Vector3,
    color: THREE.ColorRepresentation
}

function PlugPreview({ color, position }: PreviewPlugProps) {
    return <group>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={position} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 32, 1, false]} />
            <MetalMaterial transparent opacity={0.25} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={position.clone().setZ(0.325)} castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} transparent opacity={0.25} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={position.clone().setZ(0.625)} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} transparent opacity={0.25} />
        </mesh>
    </group>
}