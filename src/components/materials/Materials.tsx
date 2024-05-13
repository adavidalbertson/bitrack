import { MeshStandardMaterialProps } from '@react-three/fiber'
import * as THREE from 'three'

export type HoverableStandardMaterialProps = MeshStandardMaterialProps & { hovered?: boolean, color?: THREE.ColorRepresentation, hoverColor?: THREE.ColorRepresentation }

export function MetalMaterial({ side, hovered = false, color = 0xffffff, hoverColor = 0xff69b4 }: HoverableStandardMaterialProps) {
    return <meshStandardMaterial
        color={hovered ? hoverColor : color}
        roughness={0.25}
        metalness={1}
        side={side ? side : THREE.FrontSide}
    />
}

export function PlasticMaterial({ side, hovered = false, color = 0x050505, hoverColor = 0x300020 }: HoverableStandardMaterialProps) {
    return <meshStandardMaterial
        color={hovered ? hoverColor : color}
        roughness={0.25}
        metalness={0}
        side={side ? side : THREE.FrontSide}
    />
}