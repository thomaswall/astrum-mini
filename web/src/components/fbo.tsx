import * as THREE from "three"
import fbo_vert from "../data/fbo_vert.glsl"
import fbo_frag from "../data/fbo_frag.glsl"

let camera, scene
let texture
let renderTargetA, renderTargetB, simMaterial
let renderer

const initFBO = (
  _renderer: THREE.WebGLRenderer,
  initTexture: THREE.Texture,
  width: number,
  height: number,
  fan_locs: THREE.Vector3[],
  fan_powers: number[]
) => {
  renderer = _renderer
  texture = initTexture
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true

  simMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dims: {
        value: new THREE.Vector2(width, height),
      },
      posTex: {
        value: texture,
      },
      time: {
        value: 0.0,
      },
      fan_locs: {
        value: fan_locs,
      },
      fan_powers: {
        value: fan_powers,
      },
    },
    vertexShader: fbo_vert,
    fragmentShader: fbo_frag,
  })

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    width / 2,
    -width / 2,
    1,
    1000
  )
  camera.position.z = 1
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(width, width), simMaterial))

  renderTargetA = new THREE.WebGLRenderTarget(width, height, {})
  renderTargetB = renderTargetA.clone()

  renderer.setRenderTarget(renderTargetA)
  renderer.render(scene, camera)
  renderer.setRenderTarget(renderTargetB)
  renderer.render(scene, camera)
}

const renderFBO = (
  time: number,
  fan_locs: THREE.Vector3[],
  fan_powers: number[]
) => {
  const oldA = renderTargetA
  renderTargetA = renderTargetB
  renderTargetB = oldA
  simMaterial.uniforms.posTex.value = renderTargetA.texture
  simMaterial.uniforms.time.value = time
  simMaterial.uniforms.fan_locs.value = fan_locs
  simMaterial.uniforms.fan_powers.value = fan_powers
  simMaterial.uniformsNeedUpdate = true
  renderer.setRenderTarget(renderTargetB)
  renderer.render(scene, camera)
  renderTargetB.needsUpdate = true
}

export {
  initFBO,
  renderFBO,
  renderTargetB as render_target,
  scene as sceneboy,
  camera as cameraboy,
}
