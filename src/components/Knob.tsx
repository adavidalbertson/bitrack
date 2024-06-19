import { Merged, Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { ConnectionContext } from "../App";
import { MetalMaterial, PlasticMaterial } from "./materials/Materials";
import { ModuleProps } from "./Props";
import * as THREE from 'three';


export type KnobProps = ModuleProps & {
    updateParameter?: (v: number) => void

    minValue?: number
    maxValue?: number
    initialValue?: number
    exponential?: boolean

    knobShapeParams?: KnobShapeParams
}

export type KnobShapeParams = {
    knurls: number
    flangeHeight: number
    flangeRadius: number
    knobHeight: number
    knobRadius: number
    knurlDepth: number
    knurlHeight: number
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

function createKnobMeshes({ knurls, flangeHeight, flangeRadius, knobHeight, knobRadius, knurlDepth, knurlHeight }: KnobShapeParams) {
    const flangeGeometry = new THREE.CylinderGeometry(knobRadius, flangeRadius, flangeHeight, 32, 1, false, 0)
    flangeGeometry.translate(0, flangeHeight / 2, 0)
    const knobGeometry = new THREE.CylinderGeometry(knobRadius, knobRadius, knobHeight, 32, 1, false)
    knobGeometry.translate(0, knobHeight / 2, 0)
    const knurlGeometry = new THREE.BoxGeometry((knobRadius + knurlDepth) * Math.sin(Math.PI / (2 * knurls)), 2 * knobRadius + knurlDepth, knurlHeight)
    knurlGeometry.translate(0, 0, knurlHeight / 2)
    const pointerGeometry = new THREE.BoxGeometry(0.0175, knobRadius + knurlDepth, knobHeight + 2 * knurlDepth)
    pointerGeometry.translate(0, (knobRadius / 2) + knurlDepth, knobHeight / 2)

    const plasticMaterial = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0, color: 0x050505 })
    const metalMaterial = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 1 })
    const pointerMaterial = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0 })

    const flangeMesh = new THREE.Mesh(flangeGeometry, plasticMaterial)
    const knobMesh = new THREE.Mesh(knobGeometry, metalMaterial)
    const knurlMesh = new THREE.Mesh(knurlGeometry, plasticMaterial)
    const pointerMesh = new THREE.Mesh(pointerGeometry, pointerMaterial)

    return {
        flange: flangeMesh,
        knob: knobMesh,
        knurls: knurlMesh,
        pointer: pointerMesh
    }
}

const standardKnobMeshes = createKnobMeshes(defaultKnobShape)

const context = createContext(standardKnobMeshes)
export function Knobs({ children }: PropsWithChildren) {
    return (
        <Merged meshes={standardKnobMeshes}>
            {(instances) => <context.Provider value={instances} children={children} />}
        </Merged>
    )
}

export default function Knob({ updateParameter = () => { }, minValue = 0, maxValue = 1, initialValue = 0, exponential = false, knobShapeParams, color, label, labelColor, labelAngle = 0, ...props }: KnobProps) {
    const { setControlsDisabled } = useContext(ConnectionContext)
    const [hovered, hover] = useState(false)
    const [value, setValue] = useState(exponential ? Math.log2(initialValue) : initialValue)

    const actualMin = exponential ? Math.log2(minValue) : minValue
    const actualMax = exponential ? Math.log2(maxValue) : maxValue

    const calculateNewValue = (value: number, deltaY: number, deltaX: number) => Math.max(actualMin, Math.min(value - (actualMax - actualMin) * ((deltaY / 1000) - (deltaX / 10000)), actualMax))
    const calculateRotation = (value: number) => ((value - actualMin) / (actualMax - actualMin)) * (-3 * Math.PI / 2) + (3 * Math.PI / 4)

    const shapeParams = { ...defaultKnobShape, ...knobShapeParams }

    const instances = useContext(context)

    return <group {...props}>
        <group
            onPointerOver={() => { setControlsDisabled(true); hover(true) }}
            onPointerOut={() => { setControlsDisabled(false); hover(false) }}
            rotation={[0, 0, calculateRotation(value)]}
            onWheel={(e: ThreeEvent<WheelEvent>) => { const v = calculateNewValue(value, e.deltaY, e.deltaX); setValue(v); updateParameter(exponential ? Math.pow(2, v) : v) }}
        >
            <instances.flange rotation={[Math.PI / 2, 0, 0]} color={hovered ? 0x300020 : 0x050505} castShadow receiveShadow />
            <instances.knob rotation={[Math.PI / 2, 0, 0]} color={hovered && !plugged ? 0xff69b4 : 0xffffff} castShadow receiveShadow />
            {[...Array(shapeParams.knurls)].map((_, i) => <instances.knurls key={i} rotation={[0, 0, i * (Math.PI / shapeParams.knurls)]} color={hovered ? 0x300020 : 0x050505} />)}
            <instances.pointer />
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