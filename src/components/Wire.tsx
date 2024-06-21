import { ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from 'three'
import { PartialConnection, WireConnection } from '../App'
import { createWireColor } from '../constants'
import { InputJackRef } from './Jack'
import { MetalMaterial, PlasticMaterial } from "./materials/Materials"


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
    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 2), 0)
    const [looseEnd, setLooseEnd] = useState<THREE.Vector3>(jack.position)

    const dragLooseEnd = (e: ThreeEvent<PointerEvent>) => {
        const intersect = new THREE.Vector3(0, 0, 0)
        e.ray.intersectPlane(intersectPlane, intersect)
        intersect.setZ(1)
        setLooseEnd(intersect)
    }

    const color = connection.color || createWireColor()
    const path = [jack.position.clone().setZ(0.775), jack.position.clone().setZ(0.9), looseEnd.clone().setZ(1.9), looseEnd.clone().setZ(1.775)]
    const curve = new THREE.CatmullRomCurve3(path, false, "chordal", 0.75)

    return <group onPointerMove={dragLooseEnd} >
        <PlugPreview position={jack.position} color={color} />
        <PlugPreview position={looseEnd} color={color} />
        <mesh castShadow receiveShadow>
            <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
            <PlasticMaterial color={color} transparent opacity={previewOpacity} />
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

const previewOpacity = 0.5

const points: THREE.Vector2[] = [];
for ( let i = -1; i <= 1; i += 0.2 ) {
    points.push( new THREE.Vector2( 0.6 * Math.pow( i, 2 ) + 1, i) );
}

export function PlugPreview({ color, position }: PreviewPlugProps) {
    return <group position={position}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 32, 1, false]} />
            <MetalMaterial transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.35 - 0.125 - 0.0125]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8 * 0.095, 0.8 * 0.095, 0.025, 32, 1, false]} />
            <PlasticMaterial color={0x050505} transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.35]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.25, 32, 1, false]} />
            <MetalMaterial transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.35 + 0.125 + 0.0125]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8 * 0.095, 0.8 * 0.095, 0.025, 32, 1, false]} />
            <PlasticMaterial color={0x050505} transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.505]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.01, 32, 1, false]} />
            <MetalMaterial transparent opacity={previewOpacity} />
        </mesh>
        <mesh scale={0.05} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.56]} castShadow receiveShadow>
            <latheGeometry args={[points, 32]} />
            <MetalMaterial transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.615]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.01, 32, 1, false]} />
            <MetalMaterial transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.664]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.025, 0.09, 32, 1, false]} />
            <MetalMaterial transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.325]} castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} transparent opacity={previewOpacity} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.625]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.3, 32, 1, false]} />
            <PlasticMaterial color={color} transparent opacity={previewOpacity} />
        </mesh>
    </group>
}