import { useState } from "react";
import LED from "../components/LED";
import { PlasticMaterial } from "../components/materials/Materials";
import { ModuleProps } from "../components/Props";

export type PowerProps = ModuleProps & {
    powerSwitch: (powered: boolean) => void
}

export default function Power({ powerSwitch, color = 'black', ...props }: PowerProps) {
    const [powered, setPowered] = useState(false)

    return <group
        {...props}
    >
        <LED position={[-0.3, 0, 0]} intensity={powered ? 1 : 0} />
        <mesh position={[-0, 0, -0.5]}>
            <boxGeometry args={[1, 1.5, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.125]} >
            <boxGeometry args={[0.27, 0.53, 0.27]} />
            <PlasticMaterial />
        </mesh>
        <group
            onClick={() => { const p = !powered; setPowered(p); powerSwitch(p) }}
            rotation={[powered ? -Math.PI / 8 : 0, 0, 0]}
            position={[0, 0, 0.04]}
        >
            <mesh rotation={[0, 0, Math.PI / 2]} >
                <cylinderGeometry args={[0.25, 0.25, 0.25, 32, 1, false, 3 * Math.PI / 8, 9 * Math.PI / 8]} />
                <PlasticMaterial />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} >
                <planeGeometry args={[0.5, 0.25]} />
                <PlasticMaterial />
            </mesh>
            <mesh rotation={[(Math.PI / 8), 0, Math.PI / 2]} >
                <planeGeometry args={[0.5, 0.25]} />
                <PlasticMaterial />
            </mesh>
        </group>
    </group>
}