import { GroupProps, ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { WireConnection } from '../App'
import { MetalMaterial } from './materials/Materials'
import { generateUUID } from 'three/src/math/MathUtils.js'

export type JackProps = GroupProps & {
    audioNode: AudioNode
    connect: (audioConnection: WireConnection) => void
    setControlsDisabled: (x: boolean) => void
    wires: WireConnection[]
}

type JackPropsInternal = GroupProps & {
    plugged: boolean
}

function Jack({plugged, ...props}: JackPropsInternal) {
    const ref = useRef<THREE.Group>(null!)
    const [hovered, hover] = useState(false)

    return (
        <group
            {...props}
            ref={ref}
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
    )
}

export function OutputJack({ audioNode, setControlsDisabled, connect, wires, ...props }: JackProps) {
    const [id] = useState<string>(generateUUID())

    const plugged = useMemo(() => wires.some((w) => w.sourceId === id), [wires, id])

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        console.log("connect output", audioNode)
        setControlsDisabled(true)
        const pos = new THREE.Vector3()
        e.eventObject.getWorldPosition(pos)
        connect({ sourcePos: pos, sourceId: id, sourceNode: audioNode })
    }

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        e.stopPropagation()
        console.log("to output", audioNode)
        setControlsDisabled(false)
        const pos = new THREE.Vector3()
        e.eventObject.getWorldPosition(pos)
        connect({ sourcePos: pos, sourceId: id, sourceNode: audioNode })
    }

    return <Jack {...props} onPointerDown={onPointerDown} onPointerUp={onPointerUp} plugged={plugged} />
}

export function InputJack({ audioNode, setControlsDisabled, connect, wires, ...props }: JackProps) {
    const [id] = useState<string>(generateUUID())

    const plugged = useMemo(() => wires.some((w) => w.destId === id), [wires, id])

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        console.log("connect input", audioNode)
        setControlsDisabled(true)
        const pos = new THREE.Vector3()
        e.eventObject.getWorldPosition(pos)
        connect({ destPos: pos, destId: id, destNode: audioNode })
    }

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (plugged) { return }
        e.stopPropagation()
        console.log("to input", audioNode)
        setControlsDisabled(false)
        const pos = new THREE.Vector3()
        e.eventObject.getWorldPosition(pos)
        connect({ destPos: pos, destId: id, destNode: audioNode })
    }

    return <Jack {...props} onPointerDown={onPointerDown} onPointerUp={onPointerUp} plugged={plugged} />
}