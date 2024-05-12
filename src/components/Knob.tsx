import { GroupProps, ThreeEvent } from "@react-three/fiber";
import { useState } from "react";
import { MetalMaterial } from "./materials/Materials";


export type KnobProps = GroupProps & { setControlsDisabled: (x: boolean) => void }

export default function Knob(props: KnobProps) {
    const [hovered, hover] = useState(false)
    const [value, setValue] = useState(0)

    const knurls = 16
    const flangeHeight = 0.1
    const flangeRadius = 0.25
    const knobHeight = 0.25
    const knobRadius = 0.15
    const knurlDepth = 0.01

    return <group
        {...props}
        onPointerOver={() => { props.setControlsDisabled(true); hover(true) }}
        onPointerOut={() => { props.setControlsDisabled(false); hover(false) }}
        rotation={[0, 0, value * (-3 * Math.PI / 2) + (3 * Math.PI / 4)]}
        onWheel={(e: ThreeEvent<WheelEvent>) => { const newV = Math.max(0, Math.min(value - (e.deltaY / 1000), 1)); console.log(newV); setValue(newV) }}
    >
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
            <cylinderGeometry args={[knobRadius, flangeRadius, flangeHeight, 32, 1, false, 0]} />
            <meshStandardMaterial color={hovered ? 'magenta' : 0x000000} roughness={0.25} metalness={0} transparent={false} opacity={0.25} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.175]}>
            <cylinderGeometry args={[knobRadius, knobRadius, knobHeight, 32, 1, false]} />
            <MetalMaterial />
        </mesh>
        {[...Array(knurls)].map((_, i) => <mesh key={i} position={[0, 0, 0.175]} rotation={[0, 0, i * (Math.PI / knurls)]}>
            <boxGeometry args={[Math.PI / (12 * knurls), 2 * knobRadius + knurlDepth, 0.2]} />
            <meshStandardMaterial color={hovered ? 'magenta' : 0x000000} roughness={0.25} metalness={0} />
        </mesh>)}
        <mesh position={[0, (knobRadius / 2) + knurlDepth, 0.175]}>
            <boxGeometry args={[0.0175, knobRadius + knurlDepth, 0.275]} />
            <meshStandardMaterial color={0xffffff} roughness={0.25} metalness={0} />
        </mesh>
    </group>
}
