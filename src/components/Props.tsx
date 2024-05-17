import { GroupProps } from "@react-three/fiber"
import { ColorRepresentation } from "three"

export type ModuleProps = GroupProps & {
    color?: ColorRepresentation
}