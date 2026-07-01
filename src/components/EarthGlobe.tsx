import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function EarthGlobe() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // 1. Scène, caméra, renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.z = 2.8

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(420, 420)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // 2. Étoiles
    const starsGeo = new THREE.BufferGeometry()
    const starCount = 2000
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })
    scene.add(new THREE.Points(starsGeo, starsMat))

    // 3. Lumières
    const ambientLight = new THREE.AmbientLight(0x111133, 0.8)
    scene.add(ambientLight)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5)
    sunLight.position.set(5, 2, 3)
    scene.add(sunLight)

    // 4. Globe terrestre
    const earthGeo = new THREE.SphereGeometry(1, 64, 64)
    const textureLoader = new THREE.TextureLoader()
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x2266aa,
      shininess: 80,
      specular: new THREE.Color(0x4488cc),
    })
    const earth = new THREE.Mesh(earthGeo, earthMat)
    scene.add(earth)

    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
      (texture) => {
        earthMat.map = texture
        earthMat.needsUpdate = true
      }
    )

    // 5. Nuages
    const cloudGeo = new THREE.SphereGeometry(1.015, 64, 64)
    const cloudMat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    })
    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png',
      (texture) => {
        cloudMat.map = texture
        cloudMat.alphaMap = texture
        cloudMat.needsUpdate = true
      }
    )
    const clouds = new THREE.Mesh(cloudGeo, cloudMat)
    scene.add(clouds)

    // 6. Atmosphère
    const atmosGeo = new THREE.SphereGeometry(1.06, 64, 64)
    const atmosMat = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.FrontSide,
      depthWrite: false,
    })
    scene.add(new THREE.Mesh(atmosGeo, atmosMat))

    // 7. Animation
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      earth.rotation.y += 0.0008
      clouds.rotation.y += 0.001
      renderer.render(scene, camera)
    }
    animate()

    // 8. Nettoyage
    return () => {
      cancelAnimationFrame(animId)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="flex items-center justify-center"
    />
  )
}

export default EarthGlobe