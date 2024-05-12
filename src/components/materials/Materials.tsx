import { MeshStandardMaterialProps } from '@react-three/fiber'
import * as THREE from 'three'

export type HoverableStandardMaterialProps = MeshStandardMaterialProps & { hovered?: boolean }

export function MetalMaterial({ side, hovered = false }: HoverableStandardMaterialProps) {
    return <meshStandardMaterial
        color={hovered ? 'hotpink' : 'white'}
        roughness={0.25}
        metalness={1}
        side={side ? side : THREE.FrontSide}
    />
}