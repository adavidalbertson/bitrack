import { PropsWithChildren } from "react";
import { Jacks } from "./Jack";
import { Knobs } from "./Knob";

export default function ModelInstances({ children }: PropsWithChildren) {
    return <Jacks>
        <Knobs>
            <group rotation={[-Math.PI / 2, 0, 0]}>
                {children}
            </group>
        </Knobs>
    </Jacks>
}