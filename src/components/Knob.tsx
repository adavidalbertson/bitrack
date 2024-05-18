import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useContext, useState } from "react";
import { ConnectionContext } from "../App";
import { MetalMaterial, PlasticMaterial } from "./materials/Materials";
import { ModuleProps } from "./Props";


export type KnobProps = ModuleProps & {
    updateParameter?: (v: number) => void

    minValue?: number
    maxValue?: number
    initialValue?: number
    exponential?: boolean

    knobShapeParams?: KnobShapeParams
}

export type KnobShapeParams = {
    knurls?: number
    flangeHeight?: number
    flangeRadius?: number
    knobHeight?: number
    knobRadius?: number
    knurlDepth?: number
    knurlHeight?: number
}

const defaultKnobShape = {
    knurls: 16,
    flangeHeight: 0.1,
    flangeRadius: 0.25,
    knobHeight: 0.25,
    knobRadius: 0.15,
    knurlDepth: 0.01,
    knurlHeight: 0.24
}

export default function Knob({ updateParameter = () => { }, minValue = 0, maxValue = 1, initialValue = 0, exponential = false, knobShapeParams, color, label, labelColor, labelAngle = 0, ...props }: KnobProps) {
    const { setControlsDisabled } = useContext(ConnectionContext)
    const [hovered, hover] = useState(false)
    const [value, setValue] = useState(exponential ? Math.log2(initialValue) : initialValue)

    const actualMin = exponential ? Math.log2(minValue) : minValue
    const actualMax = exponential ? Math.log2(maxValue) : maxValue

    const calculateNewValue = (value: number, deltaY: number, deltaX: number) => { console.log(value); return Math.max(actualMin, Math.min(value - (actualMax - actualMin) * ((deltaY / 1000) - (deltaX / 10000)), actualMax)) }
    const calculateRotation = (value: number) => ((value - actualMin) / (actualMax - actualMin)) * (-3 * Math.PI / 2) + (3 * Math.PI / 4)

    const shapeParams = { ...defaultKnobShape, ...knobShapeParams }

    return <group {...props}>
        <group
            onPointerOver={() => { setControlsDisabled(true); hover(true) }}
            onPointerOut={() => { setControlsDisabled(false); hover(false) }}
            rotation={[0, 0, calculateRotation(value)]}
            onWheel={(e: ThreeEvent<WheelEvent>) => { const v = calculateNewValue(value, e.deltaY, e.deltaX); setValue(v); updateParameter(exponential ? Math.pow(2, v) : v) }}
        >
            {/* Flange */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, shapeParams.flangeHeight / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[shapeParams.knobRadius, shapeParams.flangeRadius, shapeParams.flangeHeight, 32, 1, false, 0]} />
                <PlasticMaterial color={color} hovered={hovered} />
            </mesh>
            {/* Knob */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, shapeParams.knobHeight / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[shapeParams.knobRadius, shapeParams.knobRadius, shapeParams.knobHeight, 32, 1, false]} />
                <MetalMaterial color={color} hovered={hovered} />
            </mesh>
            {/* Knurls */}
            {[...Array(shapeParams.knurls)].map((_, i) => <mesh key={i} position={[0, 0, shapeParams.knurlHeight / 2]} rotation={[0, 0, i * (Math.PI / shapeParams.knurls)]}>
                <boxGeometry args={[(shapeParams.knobRadius + shapeParams.knurlDepth) * Math.sin(Math.PI / (2 * shapeParams.knurls)), 2 * shapeParams.knobRadius + shapeParams.knurlDepth, shapeParams.knurlHeight]} />
                <PlasticMaterial color={color} hovered={hovered} />
            </mesh>)}
            {/* Pointer */}
            <mesh position={[0, (shapeParams.knobRadius / 2) + shapeParams.knurlDepth, shapeParams.knobHeight / 2]}>
                <boxGeometry args={[0.0175, shapeParams.knobRadius + shapeParams.knurlDepth, shapeParams.knobHeight + 2 * shapeParams.knurlDepth]} />
                <meshStandardMaterial color={0xffffff} roughness={0.25} metalness={0} />
            </mesh>
        </group>
        <group rotation={[0, 0, labelAngle]}>
            <Text scale={0.075} position={[0, -0.3, 0.0001]}>
                {label}
                <MetalMaterial color={labelColor} />
            </Text>
        </group>
    </group>
}

export function BalancedKnob(props: KnobProps) {
    return <Knob {...props} minValue={-1} maxValue={1} />
}

const flatKnobParams = {
    knurls: 5,
    flangeHeight: 0.2,
    flangeRadius: 0.25,
    knobHeight: 0.19,
    knobRadius: 0.249,
    knurlDepth: 0.02,
    knurlHeight: 0.2
}

export function FlatKnob(props: KnobProps) {
    return <Knob {...props} knobShapeParams={flatKnobParams} />
}

export function BalancedFlatKnob(props: KnobProps) {
    return <FlatKnob {...props} minValue={-1} maxValue={1} knobShapeParams={flatKnobParams} />
}