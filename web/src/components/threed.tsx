import React, { useState } from "react"
import { local, sync } from "../data/riptide"
import { RouteComponentProps } from "@reach/router"
import * as THREE from "three"
import vert from "../data/vert.glsl"
import frag from "../data/frag.glsl"
import styled from "styled-components"
import { renderFBO, initFBO, render_target, sceneboy, cameraboy } from "./fbo"

const renderer = new THREE.WebGLRenderer({ antialias: true })
const gl = renderer.getContext()
gl.getExtension("OES_texture_float")
let camera
let fans = []
let start_time = new Date()
let read = new Float32Array()
let last_count = 639
let callback = (_count) => {}

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
}

let initFans = () => {
  for (let i = 0; i < 20; i++) {
    const loc = new THREE.Vector2(Math.random(), Math.random())
    const icon_geo = new THREE.PlaneGeometry(10, 10)
    const icon_mat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    })
    const icon = new THREE.Mesh(icon_geo, icon_mat)
    icon.position.set(
      (loc.x - 0.5) * window.innerWidth,
      (loc.y - 0.5) * window.innerHeight,
      0
    )
    fans.push({
      loc: loc,
      direction: new THREE.Vector2(
        Math.random() * 2.0 - 1.0,
        Math.random() * 2.0 - 1.0
      ),
      power: Math.random() * 0.0015,
      icon: icon,
    })
  }
}

initFans()
const texture_dim = 250.0
const tsize = texture_dim * texture_dim
let data = new Float32Array(3 * tsize)
read = new Float32Array(4 * tsize)
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

for (let fan of fans) scene.add(fan.icon)
scene.add(points)

const my_loc = fans[0].icon.position
const plot_geo = new THREE.PlaneGeometry(
  window.innerWidth * 0.1,
  window.innerWidth * 0.1,
  3,
  3
)
const plot_mat = new THREE.LineBasicMaterial({
  color: 0xffff00,
})

const plot = new THREE.LineSegments(new THREE.EdgesGeometry(plot_geo), plot_mat)
plot.position.set(my_loc.x, my_loc.y, my_loc.z)
scene.add(plot)

const animate = () => {
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

  const plot_loc = new THREE.Vector2(my_loc.x, my_loc.y)
    .divideScalar(window.innerWidth)
    .addScalar(0.5)

  let boundaries_x = new THREE.Vector2(plot_loc.x - 0.1, plot_loc.x + 0.1)
  let boundaries_y = new THREE.Vector2(plot_loc.y - 0.1, plot_loc.y + 0.1)
  let new_count = 0
  renderer.readRenderTargetPixels(
    render_target,
    0,
    0,
    texture_dim,
    texture_dim,
    read
  )
  for (let i = 0; i < read.length; i += 4) {
    if (
      read[i] >= boundaries_x.x &&
      read[i] <= boundaries_x.y &&
      read[i + 1] >= boundaries_y.x &&
      read[i + 1] <= boundaries_y.y
    )
      new_count++
  }
  if (Math.abs(new_count - last_count) > 1) {
    last_count = new_count
    callback(new_count)
  }

  renderer.setRenderTarget(null)
  renderer.render(scene, camera)

  requestAnimationFrame(animate)
}

const setDirection = (direction) => {
  fans[0].direction = new THREE.Vector2(
    direction * 2.0 - 1.0,
    direction * 2.0 - 1.0
  )
}

const setPower = (power) => {
  fans[0].power = power
}

let init = false

export default function ThreeD(props: RouteComponentProps) {
  const [count, set_count] = useState(0)
  const [direction, set_direction] = useState(50)
  const [power, set_power] = useState(50)

  React.useEffect(() => {
    if (!init) {
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
      init = true
    }

    //document.addEventListener("mousemove", onMouseDown, false)
    callback = (_count) => {
      set_count(_count)
    }

    animate()
  }, [])

  React.useEffect(() => {
    setDirection(direction / 100.0)
  }, [direction])

  React.useEffect(() => {
    setPower((power / 100.0) * 0.0005)
  }, [power])

  const Controls = styled.div`
    position: fixed;
    width: 20rem;
    height: 20rem;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(1, 0, 1, 0.2);
  `

  const Slider = styled.input`
    -webkit-appearance: none;
    cursor: pointer;
    background-color: #000;
    width: 15 rem;
    margin: 1rem;

    ::-webkit-slider-thumb {
      -webkit-appearance: none;
      border: 1px solid #000000;
      height: 1.5rem;
      width: 0.7rem;
      background: #ffffff;
      cursor: pointer;
    }

    ::-ms-track {
      width: 100%;
      cursor: pointer;

      background: transparent;
      border-color: transparent;
      color: transparent;
    }
  `

  const Count = styled.div`
    color: white;
    font-size: 2rem;
  `

  return (
    <div id="3-root" style={{ width: "100%", height: "100%" }}>
      <Controls>
        <Slider
          onChange={(e) => set_direction(e.target.value)}
          type="range"
          min="1"
          max="100"
          value={direction}
        />
        <Slider
          onChange={(e) => set_power(e.target.value)}
          type="range"
          min="1"
          max="100"
          value={power}
        />
        <Count>{count}</Count>
      </Controls>
    </div>
  )
}
