import { Text } from '@react-three/drei'
import { useState } from "react"
import { ModuleProps } from "./Props"
import { MetalMaterial, PlasticMaterial } from "./materials/Materials"

export type ButtonProps = ModuleProps & {
    onPush: () => void
    onRelease: () => void
}

export default function Button({ onPush, onRelease, label, labelColor, labelAngle = 0, ...props }: ButtonProps) {
    const [pressed, setPressed] = useState(false)

    return <group
        {...props}
        onPointerDown={() => { setPressed(true); onPush(); }}
        onPointerUp={() => { setPressed(false); onRelease(); }}
    >
        <group>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]} >
                <cylinderGeometry args={[0.25, 0.25, 0.05, 6, 1, false]} />
                <MetalMaterial />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
                <cylinderGeometry args={[0.15, 0.25, 0.02, 6, 1, true]} />
                <MetalMaterial />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, pressed ? 0 : 0.0625]}>
                <cylinderGeometry args={[0.15, 0.15, 0.15, 32, 1, false]} />
                <PlasticMaterial />
            </mesh>
        </group>
        <group rotation={[0, 0, labelAngle]}>
            <Text position={[0, -0.3, 0.0001]} scale={0.075}>
                {label}
                <MetalMaterial color={labelColor} />
            </Text>
        </group>
    </group>
}