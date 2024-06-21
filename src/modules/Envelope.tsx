import { Text } from "@react-three/drei";
import { useContext, useRef } from "react";
import { ConnectionContext } from "../App";
import Button from "../components/Button";
import { OutputJack } from "../components/Jack";
import Knob from "../components/Knob";
import { ModuleProps } from "../components/Props";
import { MetalMaterial } from "../components/materials/Materials";

export default function Envelope({ color = 0x101010, label = "EG", labelAngle = 0, labelColor = 0xffffff, ...props }: ModuleProps) {
    const { audioCtx } = useContext(ConnectionContext)
    const node = useRef(new ConstantSourceNode(audioCtx, { offset: 0 }))
    const attack = useRef(0.1)
    const decay = useRef(0.1)
    const sustain = useRef(1)
    const release = useRef(0.01)

    const trigger = () => {
        try {
            node.current.start()
        } catch {
            // Usually already started
            console.log("no restart")
        }

        if (node.current.offset.cancelAndHoldAtTime) {
            node.current.offset.cancelAndHoldAtTime(audioCtx.currentTime)
        } else {
            // Cancel and hold not supported by Firefox
            node.current.offset.cancelScheduledValues(audioCtx.currentTime)
            node.current.offset.setValueAtTime(node.current.offset.value, audioCtx.currentTime)
        }
        node.current.offset.setTargetAtTime(1, audioCtx.currentTime, attack.current)
        node.current.offset.setTargetAtTime(sustain.current, audioCtx.currentTime + 4 * attack.current, decay.current)
    }

    const untrigger = () => {
        if (node.current.offset.cancelAndHoldAtTime) {
            node.current.offset.cancelAndHoldAtTime(audioCtx.currentTime)
        } else {
            // Cancel and hold not supported by Firefox
            node.current.offset.cancelScheduledValues(audioCtx.currentTime)
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime#choosing_a_good_timeconstant
        node.current.offset.setTargetAtTime(0, audioCtx.currentTime, 4 * release.current)
    }

    return <group
        {...props}
    >
        <Button position={[-5 * 0.75 / 2, 0, 0]} label={"TRIGGER"} onPush={trigger} onRelease={untrigger} />
        <Knob position={[-3 * 0.75 / 2, 0, 0]} updateParameter={f => attack.current = f} minValue={0} maxValue={1} initialValue={0.1} label={"ATTACK"} labelAngle={labelAngle} labelColor={labelColor} />
        <Knob position={[-0.75 / 2, 0, 0]} updateParameter={f => decay.current = f} minValue={0} maxValue={1} initialValue={0.1} label={"DECAY"} labelAngle={labelAngle} labelColor={labelColor} />
        <Knob position={[0.75 / 2, 0, 0]} updateParameter={f => sustain.current = f} minValue={0} maxValue={1} initialValue={1} label={"SUSTAIN"} labelAngle={labelAngle} labelColor={labelColor} />
        <Knob position={[3 * 0.75 / 2, 0, 0]} updateParameter={f => release.current = f} minValue={0} maxValue={1} initialValue={0.01} label={"RELEASE"} labelAngle={labelAngle} labelColor={labelColor} />
        <OutputJack position={[5 * 0.75 / 2, 0, 0]} audioNode={node.current} label={"OUT"} />
        <mesh position={[-0.1, 0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[4.75, 0.8, 1]} />
            <meshStandardMaterial color={color} roughness={1} metalness={0.5} />
        </mesh>
        <Text position={[-2.25, 0, 0.0001]} scale={0.2} rotation={[0, 0, Math.PI / 2]}>
            {label}
            <MetalMaterial color={labelColor} />
        </Text>
    </group>
}