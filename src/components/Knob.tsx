import { GroupProps, ThreeEvent } from "@react-three/fiber";
import { useState } from "react";
import { MetalMaterial } from "./materials/Materials";


export type KnobProps = GroupProps & {
    setControlsDisabled: (x: boolean) => void

    minValue?: number
    maxValue?: number
    initialValue?: number

    knurls?: number
    flangeHeight?: number
    flangeRadius?: number
    knobHeight?: number
    knobRadius?: number
    knurlDepth?: number
}

export default function Knob({setControlsDisabled, minValue = 0, maxValue = 1, initialValue = 0, knurls = 16, flangeHeight = 0.1, flangeRadius = 0.25, knobHeight = 0.25, knobRadius = 0.15, knurlDepth = 0.01, ...props}: KnobProps) {
    const [hovered, hover] = useState(false)
    const [value, setValue] = useState(initialValue)

    const calculateNewValue = (value: number, deltaY: number, deltaX: number) => Math.max(minValue, Math.min(value - (maxValue - minValue) * ((deltaY / 1000) - (deltaX / 10000)), maxValue))
    const calculateRotation = (value: number) => (value / (maxValue - minValue)) * (-3 * Math.PI / 2) + ((maxValue + minValue)) * (3 * Math.PI / 4)

    return <group
        {...props}
        onPointerOver={() => { setControlsDisabled(true); hover(true) }}
        onPointerOut={() => { setControlsDisabled(false); hover(false) }}
        rotation={[0, 0, calculateRotation(value)]}
        onWheel={(e: ThreeEvent<WheelEvent>) => { const v = calculateNewValue(value, e.deltaY, e.deltaX); console.log(v); setValue(v)}}
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

export function BalancedKnob(props: KnobProps) {
    return <Knob {...props} minValue={-1} maxValue={1}/>
}
