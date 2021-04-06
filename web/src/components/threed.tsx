import React from "react"
import { local, sync } from "../data/riptide"
import { RouteComponentProps } from "@reach/router"
import * as THREE from "three"
import vert from "../data/vert.glsl"
import frag from "../data/frag.glsl"
import { renderFBO, initFBO, render_target, sceneboy, cameraboy } from "./fbo"

const renderer = new THREE.WebGLRenderer()
let camera
let fans = []
let start_time = new Date()

export default function ThreeD(props: RouteComponentProps) {
  let onMouseDown = (event) => {
    event.preventDefault()
    let mouse = new THREE.Vector2()
    mouse.x = event.clientX / window.innerWidth
    mouse.y = 1.0 - event.clientY / window.innerHeight
    fans[0].loc = mouse
    fans[0].power = 0.05
    fans[0].direction = new THREE.Vector2().subVectors(
      mouse,
      new THREE.Vector2(0.5, 0.5)
    )

    console.log(mouse)
  }

  let initFans = () => {
    for (let i = 0; i < 20; i++) {
      fans.push({
        loc: new THREE.Vector2(Math.random(), Math.random()),
        direction: new THREE.Vector2(
          Math.random() * 2.0 - 1.0,
          Math.random() * 2.0 - 1.0
        ),
        power: Math.random() * 0.005,
      })
    }
  }

  initFans()
  const texture_dim = 250.0
  const tsize = texture_dim * texture_dim
  let data = new Float32Array(3 * tsize)
  for (let x = 0; x < texture_dim; x++) {
    for (let y = 0; y < texture_dim; y++) {
      let stride = (x + texture_dim * y) * 3
      data[stride] = x / texture_dim
      data[stride + 1] = y / texture_dim
      data[stride + 2] = 0 //ignore for now
    }
  }
  const texture = new THREE.DataTexture(
    data,
    texture_dim,
    texture_dim,
    THREE.RGBFormat,
    THREE.FloatType
  )

  initFBO(
    renderer,
    texture,
    texture_dim,
    texture_dim,
    fans.map((f) => f.loc),
    fans.map((f) => f.power),
    fans.map((f) => f.direction)
  )

  const particle_size = 0.007
  const geometry = new THREE.InstancedBufferGeometry()
  const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  positions.setXYZ(
    0,
    -texture_dim * particle_size,
    texture_dim * particle_size,
    0.0
  )
  positions.setXYZ(
    1,
    texture_dim * particle_size,
    texture_dim * particle_size,
    0.0
  )
  positions.setXYZ(
    2,
    -texture_dim * particle_size,
    -texture_dim * particle_size,
    0.0
  )
  positions.setXYZ(
    3,
    texture_dim * particle_size,
    -texture_dim * particle_size,
    0.0
  )
  geometry.setAttribute("position", positions)

  // uvs
  const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2)
  uvs.setXY(0, 0.0, 0.0)
  uvs.setXY(1, 1.0, 0.0)
  uvs.setXY(2, 0.0, 1.0)
  uvs.setXY(3, 1.0, 1.0)
  geometry.setAttribute("uv", uvs)

  // index
  geometry.setIndex(
    new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
  )

  const indices = new Uint16Array(texture_dim * texture_dim)
  for (let i = 0; i < tsize; i++) indices[i] = i

  geometry.setAttribute(
    "pindex",
    new THREE.InstancedBufferAttribute(indices, 1, false)
  )

  const material = new THREE.ShaderMaterial({
    uniforms: {
      mapping: {
        value: render_target.texture,
      },
      dims: {
        value: new THREE.Vector2(texture_dim, texture_dim),
      },
      screen: {
        value: new THREE.Vector2(0, 0),
      },
    },
    vertexShader: vert,
    fragmentShader: frag,
  })

  const points = new THREE.Mesh(geometry, material)
  const scene = new THREE.Scene()
  scene.add(points)

  React.useEffect(() => {
    let root = document.getElementById("3-root")
    camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      1,
      1000
    )
    renderer.setSize(root.clientWidth, root.clientHeight)
    root.appendChild(renderer.domElement)

    camera.position.z = 1

    document.addEventListener("mousemove", onMouseDown, false)

    animate()
  }, [])

  let animate = () => {
    requestAnimationFrame(animate)

    const curr_time = new Date()
    renderFBO(
      curr_time.getTime() - start_time.getTime(),
      fans.map((fan) => fan.loc),
      fans.map((fan) => fan.power),
      fans.map((f) => f.direction)
    )
    start_time = new Date()
    material.uniforms.screen.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    )
    material.uniformsNeedUpdate = true
    material.needsUpdate = true

    renderer.setRenderTarget(null)
    renderer.render(scene, camera)
  }

  return <div id="3-root" style={{ width: "100%", height: "100%" }} />
}
