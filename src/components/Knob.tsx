import { Merged, Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import * as THREE from 'three';
import { ConnectionContext } from "../App";
import { MetalMaterial } from "./materials/Materials";
import { ModuleProps } from "./Props";


export type KnobProps = ModuleProps & {
    updateParameter?: (v: number) => void

    minValue?: number
    maxValue?: number
    initialValue?: number
    exponential?: boolean

    knobShapeParams?: KnobShapeParams
}

type KnobMeshes = {
    flange: THREE.Mesh,
    knob: THREE.Mesh,
    knurls: THREE.Mesh,
    pointer: THREE.Mesh,
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

const flatKnobShape = {
    knurls: 5,
    flangeHeight: 0.2,
    flangeRadius: 0.25,
    knobHeight: 0.19,
    knobRadius: 0.249,
    knurlDepth: 0.02,
    knurlHeight: 0.2
}

function createKnobMeshes({ knurls, flangeHeight, flangeRadius, knobHeight, knobRadius, knurlDepth, knurlHeight }: KnobShapeParams): KnobMeshes {
    const flangeGeometry = new THREE.CylinderGeometry(knobRadius, flangeRadius, flangeHeight, 32, 1, false, 0)
    flangeGeometry.translate(0, flangeHeight / 2, 0)
    const knobGeometry = new THREE.CylinderGeometry(knobRadius, knobRadius, knobHeight, 32, 1, false)
    knobGeometry.translate(0, knobHeight / 2, 0)
    const knurlGeometry = new THREE.BoxGeometry((knobRadius + knurlDepth) * Math.sin(Math.PI / (2 * knurls)), 2 * knobRadius + knurlDepth, knurlHeight)
    knurlGeometry.translate(0, 0, knurlHeight / 2)
    const pointerGeometry = new THREE.BoxGeometry(0.0175, knobRadius + knurlDepth, knobHeight + 2 * knurlDepth)
    pointerGeometry.translate(0, (knobRadius / 2) + knurlDepth, knobHeight / 2)

    const plasticMaterial = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0 })
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
const flatKnobMeshes = createKnobMeshes(flatKnobShape)

const defaultContext = createContext(standardKnobMeshes)
function DefaultKnobs({ children }: PropsWithChildren) {
    return (
        <Merged meshes={standardKnobMeshes} frustumCulled={false}>
            {(instances: KnobMeshes) => <defaultContext.Provider value={instances} children={children} />}
        </Merged>
    )
}

const flatContext = createContext(flatKnobMeshes)
function FlatKnobs({ children }: PropsWithChildren) {
    return (
        <Merged meshes={flatKnobMeshes}>
            {(instances: KnobMeshes) => <flatContext.Provider value={instances} children={children} />}
        </Merged>
    )
}

export function Knobs({ children }: PropsWithChildren) {
    return (
        <DefaultKnobs>
            <FlatKnobs>
                {children}
            </FlatKnobs>
        </DefaultKnobs>
    )
}

const calculateNewValue = (value: number, deltaY: number, deltaX: number, actualMin: number, actualMax: number) => Math.max(actualMin, Math.min(value - (actualMax - actualMin) * ((deltaY / 1000) - (deltaX / 10000)), actualMax))
const calculateRotation = (value: number, actualMin: number, actualMax: number) => ((value - actualMin) / (actualMax - actualMin)) * (-3 * Math.PI / 2) + (3 * Math.PI / 4)

function KnobWrapper({ updateParameter = () => { }, minValue = 0, maxValue = 1, initialValue = 0, exponential = false, label, labelColor, labelAngle = 0, children, ...props }: PropsWithChildren<KnobProps>) {
    const { setControlsDisabled } = useContext(ConnectionContext)
    const [value, setValue] = useState(exponential ? Math.log2(initialValue) : initialValue)

    const actualMin = exponential ? Math.log2(minValue) : minValue
    const actualMax = exponential ? Math.log2(maxValue) : maxValue

    return <group {...props}>
        <group
            onPointerOver={() => { setControlsDisabled(true) }}
            onPointerOut={() => { setControlsDisabled(false) }}
            rotation={[0, 0, calculateRotation(value, actualMin, actualMax)]}
            onWheel={(e: ThreeEvent<WheelEvent>) => { const v = calculateNewValue(value, e.deltaY, e.deltaX, actualMin, actualMax); setValue(v); updateParameter(exponential ? Math.pow(2, v) : v) }}
        >
            {children}
        </group>
        <group rotation={[0, 0, labelAngle]}>
            <Text scale={0.075} position={[0, -0.3, 0.0001]}>
                {label}
                <MetalMaterial color={labelColor} />
            </Text>
        </group>
    </group>
}

function KnobModel({ knobShapeParams = defaultKnobShape, color = 0x050505, ...props }: KnobProps) {
    const [hovered, hover] = useState(false)

    const instances: KnobMeshes = useContext(defaultContext)

    return <KnobWrapper {...props} onPointerOver={() => { hover(true) }} onPointerOut={() => { hover(false) }}>
        < // @ts-expect-error This is a Mesh
            instances.flange
            rotation={[Math.PI / 2, 0, 0]} color={hovered ? 0x300020 : color} castShadow receiveShadow />
        < // @ts-expect-error This is a Mesh
            instances.knob
            rotation={[Math.PI / 2, 0, 0]} color={hovered ? 0xff69b4 : 0xffffff} castShadow receiveShadow />
        {[...Array(knobShapeParams.knurls)].map((_, i) => < // @ts-expect-error This is a Mesh
            instances.knurls
            key={i} rotation={[0, 0, i * (Math.PI / knobShapeParams.knurls)]} color={hovered ? 0x300020 : color} />)}
        < // @ts-expect-error This is a Mesh
            instances.pointer
        />
    </KnobWrapper>
}

function FlatKnobModel({ knobShapeParams = defaultKnobShape, color = 0x050505, ...props }: KnobProps) {
    const [hovered, hover] = useState(false)

    const instances: KnobMeshes = useContext(flatContext)

    return <KnobWrapper {...props} onPointerOver={() => { hover(true) }} onPointerOut={() => { hover(false) }}>
        < // @ts-expect-error This is a Mesh
            instances.flange
            rotation={[Math.PI / 2, 0, 0]} color={hovered ? 0x300020 : color} castShadow receiveShadow />
        < // @ts-expect-error This is a Mesh
            instances.knob
            rotation={[Math.PI / 2, 0, 0]} color={hovered ? 0xff69b4 : 0xffffff} castShadow receiveShadow />
        {[...Array(knobShapeParams.knurls)].map((_, i) => < // @ts-expect-error This is a Mesh
            instances.knurls
            key={i} rotation={[0, 0, i * (Math.PI / knobShapeParams.knurls)]} color={hovered ? 0x300020 : color} />)}
        < // @ts-expect-error This is a Mesh
            instances.pointer
        />
    </KnobWrapper>
}

export default function Knob(props: KnobProps) {
    return <KnobModel {...props} />
}

export function BalancedKnob(props: KnobProps) {
    return <KnobModel {...props} minValue={-1} maxValue={1} />
}

export function FlatKnob(props: KnobProps) {
    return <FlatKnobModel {...props} knobShapeParams={flatKnobShape} />
}

export function BalancedFlatKnob(props: KnobProps) {
    return <FlatKnobModel {...props} knobShapeParams={flatKnobShape} minValue={-1} maxValue={1} />
}