import { Text } from "@react-three/drei";
import { useContext, useEffect, useRef } from "react";
import { ConnectionContext } from "../App";
import { InputJack, OutputJack } from "../components/Jack";
import { FlatKnob } from "../components/Knob";
import { ModuleProps } from "../components/Props";
import { MetalMaterial } from "../components/materials/Materials";

export default function Filter({ color, label = 'VCF', labelColor, labelAngle, ...props }: ModuleProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const vcf = useRef(new BiquadFilterNode(audioCtx, { type: 'lowpass', frequency: 1000, Q: 0.1 }))
    const vcfModAmt = useRef(new GainNode(audioCtx, { gain: 1 }))
    const resModAmt = useRef(new GainNode(audioCtx, { gain: 1 }))

    useEffect(() => {
        vcf.current = new BiquadFilterNode(audioCtx, { type: 'lowpass', frequency: vcf.current.frequency.value, gain: vcf.current.gain.value, Q: vcf.current.Q.value })
        vcfModAmt.current = new GainNode(audioCtx, { gain: vcfModAmt.current.gain.value })
        resModAmt.current = new GainNode(audioCtx, { gain: resModAmt.current.gain.value })
        vcfModAmt.current.connect(vcf.current.frequency)
        resModAmt.current.connect(vcf.current.Q)
    }, [audioCtx])

    const updateFreq = (f: number) => {
        vcf.current.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.04)
    }

    const updateRes = (f: number) => {
        vcf.current.Q.setTargetAtTime(f, audioCtx.currentTime, 0.04)
    }

    const updateVcfModAmt = (f: number) => {
        vcfModAmt.current.gain.setTargetAtTime(f, audioCtx.currentTime, 0.04)
    }

    const updateResModAmt = (f: number) => {
        resModAmt.current.gain.setTargetAtTime(f, audioCtx.currentTime, 0.04)
    }

    return <group {...props}>
        <group position={[0, 0.3, 0]}>
            <InputJack position={[3 * -0.75 / 2, 0, 0]} audioNode={vcf.current} label={"IN"} labelColor={labelColor} labelAngle={labelAngle} />
            <InputJack position={[-0.75 / 2, 0, 0]} audioNode={vcfModAmt.current} label={"VFC MOD"} labelColor={labelColor} labelAngle={labelAngle} />
            <InputJack position={[0.75 / 2, 0, 0]} audioNode={resModAmt.current} label={"RES MOD"} labelColor={labelColor} labelAngle={labelAngle} />
            <OutputJack position={[3 * 0.75 / 2, 0, 0]} audioNode={vcf.current} label={"OUT"} labelColor={labelColor} labelAngle={labelAngle} />
        </group>
        <group position={[0, -0.3, 0]}>
            <FlatKnob position={[3 * -0.75 / 2, 0, 0]} minValue={10} initialValue={2000} maxValue={10000} exponential updateParameter={updateFreq} label={"CUTOFF"} labelColor={labelColor} labelAngle={labelAngle} />
            <FlatKnob position={[-0.75 / 2, 0, 0]} minValue={0} initialValue={100} maxValue={1000} updateParameter={updateVcfModAmt} label={"VCF MOD AMT"} labelColor={labelColor} labelAngle={labelAngle} />
            <FlatKnob position={[0.75 / 2, 0, 0]} minValue={0} initialValue={1} maxValue={25} updateParameter={updateResModAmt} label={"RES MOD AMT"} labelColor={labelColor} labelAngle={labelAngle} />
            <FlatKnob position={[3 * 0.75 / 2, 0, 0]} updateParameter={updateRes} minValue={0.1} initialValue={0.1} maxValue={25} label={"RES"} labelColor={labelColor} labelAngle={labelAngle} />
        </group>
        <mesh position={[-0.1, -0.05, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[3.1, 1.3, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
        <Text position={[-1.5, 0, 0.0001]} scale={0.2} rotation={[0, 0, Math.PI / 2]}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
    </group>
}