import { GroupProps } from "@react-three/fiber";
import { useState } from "react";
import { PlasticMaterial } from "./materials/Materials";

export type PowerProps = GroupProps & {
    powerSwitch: (powered: boolean) => void
}

export default function Power({ powerSwitch, ...props }: PowerProps) {
    const [powered, setPowered] = useState(false)

    return <group
        {...props}
    >
        <mesh position={[0, 0, -0.135]} >
            <boxGeometry args={[0.27, 0.53, 0.27]} />
            <PlasticMaterial />
        </mesh>
        <group
            onClick={() => { const p = !powered; setPowered(p); powerSwitch(p) }}
            rotation={[powered ? -Math.PI / 8 : 0, 0, 0]}
            position={[0, 0, 0.02]}
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