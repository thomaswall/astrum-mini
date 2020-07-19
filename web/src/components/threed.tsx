import React from "react"
import { local, sync } from "../data/riptide";
import { RouteComponentProps } from "@reach/router"
import * as THREE from 'three'
import vert from '../data/vert.glsl'
import frag from '../data/frag.glsl'

let scene, renderer, camera, plane
let texture, texture_dim

let fans = []

export default function ThreeD(props: RouteComponentProps) {

    let initFans = () => {
        fans.push({
            loc: new THREE.Vector2(0, 0.5),
            power: 2
        })
        fans.push({
            loc: new THREE.Vector2(0.5, 0),
            power: 1
        })
    }

    React.useEffect(() => {
        initFans()

        scene = new THREE.Scene()
        renderer = new THREE.WebGLRenderer()

        let root = document.getElementById("3-root")
        camera = new THREE.PerspectiveCamera(75, root.clientWidth / root.clientHeight, 0.1, 1000)
        renderer.setSize(root.clientWidth, root.clientHeight)
        root.appendChild(renderer.domElement)

        texture_dim = 100
        let tsize = texture_dim * texture_dim
        let data = new Uint8Array(3 * tsize)
        for(let i = 0; i < tsize; i++) {
            let stride = i * 3
            data[stride] = 0
            data[stride + 1] = i % 140 == 0 ? 255 : 0
            data[stride + 2] = 0
        }
        texture = new THREE.DataTexture(data, texture_dim, texture_dim, THREE.RGBFormat)

        let geometry = new THREE.PlaneGeometry(5, 5)
        let material = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    value: 1.0
                },
                mapping: {
                    value: texture
                },
                fan_locs: {
                    value: fans.map(fan => fan.loc)
                },
                fan_powers: {
                    value: fans.map(fan => fan.power)
                }
            },
            vertexShader: vert,
            fragmentShader: frag
        })
        plane = new THREE.Mesh(geometry, material)
        scene.add(plane)

        camera.position.z = 10

        animate()

    }, [])

    let animate = () => {
        requestAnimationFrame(animate)

        plane.rotation.x += 0.001
        plane.rotation.y += 0.001

        renderer.render(scene, camera)
    }

    return <div id="3-root" style={{width: "100%", height: "100%"}}/>
}
