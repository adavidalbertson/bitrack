import * as THREE from 'three'

export function MetalMaterial({side, hovered}) {
    return <meshStandardMaterial
        color={hovered ? 'hotpink' : 'white'}
        roughness={0.25}
        metalness={1}
        side={ side ? side : THREE.FrontSide}
      />
  }