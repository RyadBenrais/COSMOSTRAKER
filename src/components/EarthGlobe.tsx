import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import useISS from '../hooks/useISS'

interface EarthGlobeProps {
  showISS?: boolean
}

function EarthGlobe({ showISS = true }: EarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const issMarkerRef = useRef<THREE.Mesh | null>(null)
  const { position } = useISS()

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.z = 2.8

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(420, 420)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // Étoiles
    const starsGeo = new THREE.BufferGeometry()
    const starCount = 2000
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })
    scene.add(new THREE.Points(starsGeo, starsMat))

    // Lumières
    const ambientLight = new THREE.AmbientLight(0x111133, 0.8)
    scene.add(ambientLight)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5)
    sunLight.position.set(5, 2, 3)
    scene.add(sunLight)

    // Globe
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

    // Nuages
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

    // Atmosphère
    const atmosGeo = new THREE.SphereGeometry(1.06, 64, 64)
    const atmosMat = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.FrontSide,
      depthWrite: false,
    })
    scene.add(new THREE.Mesh(atmosGeo, atmosMat))

    // Marqueur ISS
    if (showISS) {
      const issGeo = new THREE.SphereGeometry(0.03, 16, 16)
      const issMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      const issMarker = new THREE.Mesh(issGeo, issMat)

      const glowGeo = new THREE.SphereGeometry(0.05, 16, 16)
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.3,
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      issMarker.add(glow)

      scene.add(issMarker)
      issMarkerRef.current = issMarker
    }

    // Animation
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      earth.rotation.y += 0.0008
      clouds.rotation.y += 0.001
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  // Mise à jour position ISS
  useEffect(() => {
    if (!issMarkerRef.current || !position) return

    const lat = (position.latitude * Math.PI) / 180
    const lon = (position.longitude * Math.PI) / 180
    const radius = 1.1

    issMarkerRef.current.position.set(
      radius * Math.cos(lat) * Math.sin(lon),
      radius * Math.sin(lat),
      radius * Math.cos(lat) * Math.cos(lon)
    )
  }, [position])

  return <div ref={mountRef} className="flex items-center justify-center" />
}

export default EarthGlobe