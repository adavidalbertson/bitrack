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
    knurlHeight?: number
}

export default function Knob({setControlsDisabled, minValue = 0, maxValue = 1, initialValue = 0, knurls = 16, flangeHeight = 0.1, flangeRadius = 0.25, knobHeight = 0.25, knobRadius = 0.15, knurlDepth = 0.01, knurlHeight=0.24, ...props}: KnobProps) {
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
        {/* Flange */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, flangeHeight / 2]}>
            <cylinderGeometry args={[knobRadius, flangeRadius, flangeHeight, 32, 1, false, 0]} />
            <meshStandardMaterial color={hovered ? 0x300020 : 0x000000} roughness={0.25} metalness={0} />
        </mesh>
        {/* Knob */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, knobHeight / 2]}>
            <cylinderGeometry args={[knobRadius, knobRadius, knobHeight, 32, 1, false]} />
            <MetalMaterial hovered={hovered} />
        </mesh>
        {/* Knurls */}
        {[...Array(knurls)].map((_, i) => <mesh key={i} position={[0, 0, knurlHeight / 2]} rotation={[0, 0, i * (Math.PI / knurls)]}>
            <boxGeometry args={[(knobRadius + knurlDepth) * Math.sin(Math.PI / (2 * knurls)), 2 * knobRadius + knurlDepth, knurlHeight]} />
            <meshStandardMaterial color={hovered ? 0x300020 : 0x000000} roughness={0.25} metalness={0} />
        </mesh>)}
        {/* Pointer */}
        <mesh position={[0, (knobRadius / 2) + knurlDepth, knobHeight / 2]}>
            <boxGeometry args={[0.0175, knobRadius + knurlDepth, knobHeight + 2 * knurlDepth]} />
            <meshStandardMaterial color={0xffffff} roughness={0.25} metalness={0} />
        </mesh>
    </group>
}

export function BalancedKnob(props: KnobProps) {
    return <Knob {...props} minValue={-1} maxValue={1}/>
}

export function FlatKnob(props: KnobProps) {
    return <Knob {...props} knurls={5} flangeHeight={0.2} flangeRadius={0.25} knobHeight={0.19} knobRadius={0.249} knurlDepth={0.02} knurlHeight={0.2} />
}

export function BalancedFlatKnob(props: KnobProps) {
    return <FlatKnob {...props} minValue={-1} maxValue={1} />
}