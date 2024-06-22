import { PropsWithChildren } from "react";
import { Jacks } from "./Jack";
import { Knobs } from "./Knob";

export default function ModelInstances({ children }: PropsWithChildren) {
    return <Jacks>
        <Knobs>
            {children}
        </Knobs>
    </Jacks>
}