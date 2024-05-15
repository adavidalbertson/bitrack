import { GroupProps } from "@react-three/fiber"
import { WireConnection, WireConnectionInProgress } from "../App"

export type ModuleProps = GroupProps & {
    setControlsDisabled: (x: boolean) => void
    connect: (audioConnection: WireConnectionInProgress) => void
    audioCtx: AudioContext
    wires: WireConnection[]
}