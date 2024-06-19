import { Merged, Text } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'
import * as THREE from 'three'
import { generateUUID } from 'three/src/math/MathUtils.js'
import { ConnectionContext } from '../App'
import { MetalMaterial } from './materials/Materials'
import { ModuleProps } from './Props'
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js'

export type JackProps = ModuleProps & {
    audioNode: AudioNode
}

export type InputJackProps = Omit<JackProps, 'audioNode'> & {
    audioNode: AudioNode | AudioParam
}

export type JackRef = {
    id: string
    position: THREE.Vector3
    audioNode: AudioNode
}

export type InputJackRef = Omit<JackRef, 'audioNode'> & {
    audioNode: AudioNode | AudioParam
}

type JackPropsInternal = ModuleProps & {
    plugged: boolean
}

type JackMeshes = {
    exterior: THREE.Mesh,
    interior: THREE.Mesh,
    darkness: THREE.Mesh
}

const nut = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 6, 1, false)
nut.translate(0, 0.025, 0)

const nutFace = new THREE.CylinderGeometry(0.15, 0.25, 0.02, 6, 1, true)
nutFace.translate(0, 0.06, 0)

const outerBarrel = new THREE.CylinderGeometry(0.15, 0.15, 0.15, 32, 1, true)
outerBarrel.translate(0, 0.0625, 0)

const innerBarrel = new THREE.CylinderGeometry(0.13, 0.13, 0.19, 32, 1, true)
innerBarrel.translate(0, 0.0625, 0)

const barrelFace = new THREE.CylinderGeometry(0.13, 0.15, 0.02, 32, 1, true)
barrelFace.translate(0, 0.1475, 0)

const darkness = new THREE.RingGeometry(0, 0.15, 12)
darkness.translate(0, 0, 0.0625)

const exterior = BufferGeometryUtils.mergeGeometries([
    nut,
    nutFace,
    outerBarrel,
    // innerBarrel,
    barrelFace
])

const jackMeshes: JackMeshes = {
    exterior: new THREE.Mesh(exterior, new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 1 })),
    interior: new THREE.Mesh(innerBarrel, new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 1, side: THREE.BackSide })),
    darkness: new THREE.Mesh(darkness, new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, color: 'black' }))
}

const context = createContext(jackMeshes)
export function Jacks({ children }: PropsWithChildren) {
    // const instances = useMemo<JackMeshes>(() => ({
    //     exterior: new THREE.Mesh(exterior, new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 1 })),
    //     interior: new THREE.Mesh(innerBarrel, new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 1, side: THREE.BackSide })),
    //     darkness: new THREE.Mesh(darkness, new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, color: 'black' }))
    // }), [])
    return (
        <Merged meshes={jackMeshes}>
            {(instances: JackMeshes) => <context.Provider value={instances} children={children} />}
        </Merged>
    )
}

export function Jack({ plugged, label, labelColor, labelAngle = 0, ...props }: JackPropsInternal) {
    const [hovered, hover] = useState(false)
    const instances = useContext(context)

    return (
        <group
            {...props}
        >
            <group
                onPointerOver={(event) => (event.stopPropagation(), hover(true))}
                onPointerOut={() => hover(false)}>
                <instances.darkness />
                <instances.exterior rotation={[Math.PI / 2, 0, 0]} color={hovered && !plugged ? 0xff69b4 : 0xffffff} />
                <instances.interior rotation={[Math.PI / 2, 0, 0]} color={hovered && !plugged ? 0xff69b4 : 0xffffff} />
            </group>
            <group rotation={[0, 0, labelAngle]}>
                <Text position={[0, -0.3, 0.0001]} scale={0.075}>
                    {label}
                    <MetalMaterial color={labelColor} />
                </Text>
            </group>
        </group>
    )
}

export function OutputJack({ audioNode, label, labelColor, ...props }: JackProps) {
    const { wires, setControlsDisabled, connect } = useContext(ConnectionContext)
    const [id] = useState<string>(generateUUID())

    const plugged = useMemo(() => wires.some((w) => w.source!.id === id), [wires, id])

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        setControlsDisabled(true)
        const position = new THREE.Vector3()
        e.eventObject.getWorldPosition(position)
        connect({ source: { id, position, audioNode } })
    }

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        e.stopPropagation()
        setControlsDisabled(false)
        const position = new THREE.Vector3()
        e.eventObject.getWorldPosition(position)
        connect({ source: { id, position, audioNode } })
    }

    return <Jack {...props} onPointerDown={onPointerDown} onPointerUp={onPointerUp} plugged={plugged} label={label} labelColor={labelColor} />
}

export function InputJack({ audioNode, label, labelColor, ...props }: InputJackProps) {
    const { wires, setControlsDisabled, connect } = useContext(ConnectionContext)
    const [id] = useState<string>(generateUUID())

    const plugged = useMemo(() => wires.some((w) => w.dest!.id === id), [wires, id])

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        setControlsDisabled(true)
        const position = new THREE.Vector3()
        e.eventObject.getWorldPosition(position)
        connect({ dest: { id, position, audioNode } })
    }

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        e.stopPropagation()
        setControlsDisabled(false)
        const position = new THREE.Vector3()
        e.eventObject.getWorldPosition(position)
        connect({ dest: { id, position, audioNode } })
    }

    return <Jack {...props} onPointerDown={onPointerDown} onPointerUp={onPointerUp} plugged={plugged} label={label} labelColor={labelColor} />
}