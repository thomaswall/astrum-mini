import React from "react"
import { local, sync } from "../data/riptide";
import { RouteComponentProps } from "@reach/router"
import * as THREE from 'three'
import vert from '../data/vert.glsl'
import frag from '../data/frag.glsl'
import { renderFBO, initFBO, renderTarget } from "./fbo"

let renderer, camera
let fans = []
const start_time = new Date()

export default function ThreeD(props: RouteComponentProps) {

    let initFans = () => {
        fans.push({
            loc: new THREE.Vector2(0, 0.5),
            direction: new THREE.Vector2(-1.0, 0.0),
            power: 2
        })
        fans.push({
            loc: new THREE.Vector2(0.5, 0),
            direction: new THREE.Vector2(1.0, 0.0),
            power: 1
        })
    }

    initFans()
    const texture_dim = 1080.0
    const tsize = texture_dim * texture_dim
    let data = new Uint8Array(3 * tsize)
    for(let x = 0; x < texture_dim; x++) {
        for(let y = 0; y < texture_dim; y++) {
            let stride = (x * texture_dim + y) * 3
            data[stride] = x
            data[stride + 1] = y
            data[stride + 2] = 0 //ignore for now
        }
    }
    const texture = new THREE.DataTexture(data, texture_dim, texture_dim, THREE.RGBFormat)
    initFBO(texture, texture_dim, texture_dim)

    const geometry = new THREE.InstancedBufferGeometry();
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    geometry.setAttribute('position', positions);

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXY(0, 0.0, 0.0);
    uvs.setXY(1, 1.0, 0.0);
    uvs.setXY(2, 0.0, 1.0);
    uvs.setXY(3, 1.0, 1.0);
    geometry.setAttribute('uv', uvs);

    // index
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));

    const indices = new Uint16Array(texture_dim);
    for (let i = 0; i < tsize; i++) indices[i] = i;

    geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            mapping: {
                value: renderTarget.texture
            },
            dims: {
                value: new THREE.Vector2(texture_dim, texture_dim)
            }
        },
        vertexShader: vert,
        fragmentShader: frag
    })
    const points = new THREE.Mesh(geometry, material)
    const scene = new THREE.Scene()
    scene.add(points)

    React.useEffect(() => {
        renderer = new THREE.WebGLRenderer()
        let root = document.getElementById("3-root")
        camera = new THREE.PerspectiveCamera(75, root.clientWidth / root.clientHeight, 0.1, 1000)
        renderer.setSize(root.clientWidth, root.clientHeight)
        root.appendChild(renderer.domElement)
    

        camera.position.z = 20

        animate()

    }, [])

    let animate = () => {
        requestAnimationFrame(animate)

        const curr_time = new Date()
        renderFBO(curr_time.getTime() - start_time.getTime(), fans.map(fan => fan.loc), fans.map(fan => fan.power))
        material.uniformsNeedUpdate = true

        renderer.render(scene, camera)
    }

    return <div id="3-root" style={{width: "100%", height: "100%"}}/>
}
