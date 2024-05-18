import { Text } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { useContext, useMemo, useState } from 'react'
import * as THREE from 'three'
import { generateUUID } from 'three/src/math/MathUtils.js'
import { ConnectionContext } from '../App'
import { MetalMaterial } from './materials/Materials'
import { ModuleProps } from './Props'

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

function Jack({ plugged, label, labelColor, labelAngle = 0, ...props }: JackPropsInternal) {
    const [hovered, hover] = useState(false)

    return (
        <group
            {...props}
        >
            <group
                onPointerOver={(event) => (event.stopPropagation(), hover(true))}
                onPointerOut={() => hover(false)}>
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]} >
                    <cylinderGeometry args={[0.25, 0.25, 0.05, 6, 1, false]} />
                    <MetalMaterial hovered={hovered && !plugged} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
                    <cylinderGeometry args={[0.15, 0.25, 0.02, 6, 1, true]} />
                    <MetalMaterial hovered={hovered && !plugged} />
                </mesh>
                <mesh rotation={[0, 0, 0]} position={[0, 0, 0.0625]}>
                    <ringGeometry args={[0, 0.15, 12]} />
                    <meshStandardMaterial color={'black'} roughness={1} metalness={0} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0625]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.15, 32, 1, true]} />
                    <MetalMaterial hovered={hovered && !plugged} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0625]}>
                    <cylinderGeometry args={[0.13, 0.13, 0.19, 32, 1, true]} />
                    <MetalMaterial hovered={hovered && !plugged} side={THREE.BackSide} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1475]}>
                    <cylinderGeometry args={[0.13, 0.15, 0.02, 32, 1, true]} />
                    <MetalMaterial hovered={hovered && !plugged} />
                </mesh>
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
        console.log("connect output", audioNode)
        setControlsDisabled(true)
        const position = new THREE.Vector3()
        e.eventObject.getWorldPosition(position)
        connect({ source: { id, position, audioNode } })
    }

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        e.stopPropagation()
        console.log("to output", audioNode)
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
        console.log("connect input", audioNode)
        setControlsDisabled(true)
        const position = new THREE.Vector3()
        e.eventObject.getWorldPosition(position)
        connect({ dest: { id, position, audioNode } })
    }

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        e.stopPropagation()
        console.log("to input", audioNode)
        setControlsDisabled(false)
        const position = new THREE.Vector3()
        e.eventObject.getWorldPosition(position)
        connect({ dest: { id, position, audioNode } })
    }

    return <Jack {...props} onPointerDown={onPointerDown} onPointerUp={onPointerUp} plugged={plugged} label={label} labelColor={labelColor} />
}