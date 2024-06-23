import { GroupProps } from "@react-three/fiber";
import { Color, ColorRepresentation } from "three";

export type LEDProps = GroupProps & {
    intensity?: number
    color?: ColorRepresentation
}

export default function LED({ intensity = 0, color = 0xff0000, ...props }: LEDProps) {
    return <group
        {...props}
    >
        <mesh>
            <sphereGeometry args={[0.05]} />
            <meshPhysicalMaterial color={0xcdcdcd} transmission={0.99} reflectivity={0.5} roughness={0} />
        </mesh>
        <mesh>
            <sphereGeometry args={[0.04]} />
            <meshPhysicalMaterial color={new Color(color).lerp(new Color(0x101010), 0.98)} emissive={color} emissiveIntensity={intensity} transmission={0} reflectivity={0.5} roughness={0} />
        </mesh>
        <pointLight color={new Color(color).lerp(new Color(0x101010), 0.05)} intensity={5 * intensity} position={[0, 0, 0.05]} decay={1.25} />
    </group>
}