import { GroupProps } from "@react-three/fiber"
import { WireConnection } from "../App"

export type ModuleProps = GroupProps & {
    setControlsDisabled: (x: boolean) => void
    connect: (audioConnection: WireConnection) => void
    audioCtx: AudioContext
    wires: WireConnection[]
}