import * as THREE from 'three'

const wireColors = [
    'black',
    0x1f1f1f,
    0x3f3f3f,
    0x7f7f7f,
    0xffffff,
    0xdd0808,
    0xdd0808,
]

export function createWireColor(): THREE.ColorRepresentation {
    return wireColors[Math.floor(Math.random() * wireColors.length)]
}