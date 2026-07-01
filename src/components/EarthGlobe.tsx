import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import useISS from '../hooks/useISS'

interface PopupInfo {
  region: string
  utcOffset: number
  localTime: string
  x: number
  y: number
}

function EarthGlobe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const issMarkerRef = useRef<THREE.Mesh | null>(null)
  const astronautRef = useRef<THREE.Mesh | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const debrisRef = useRef<THREE.Points | null>(null)

  const [debrisCount, setDebrisCount] = useState<number>(150)
  const [popup, setPopup] = useState<PopupInfo | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const { position } = useISS()

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.position.z = 2.8
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(480, 480)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1.5
    controls.maxDistance = 5
    controls.enablePan = false
    controlsRef.current = controls

    const starsGeo = new THREE.BufferGeometry()
    const starCount = 2500
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 150
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.12, transparent: true, opacity: 0.8,
    })))

    scene.add(new THREE.AmbientLight(0x111133, 0.8))
    const sunLight = new THREE.DirectionalLight(0xfff5e8, 2.5)
    sunLight.position.set(5, 2, 3)
    scene.add(sunLight)
    const rimLight = new THREE.DirectionalLight(0x3355aa, 0.3)
    rimLight.position.set(-4, -1, -3)
    scene.add(rimLight)

    const textureLoader = new THREE.TextureLoader()
    const earthGeo = new THREE.SphereGeometry(1, 64, 64)
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x2266aa, shininess: 80,
      specular: new THREE.Color(0x4488cc),
    })
    const earth = new THREE.Mesh(earthGeo, earthMat)
    scene.add(earth)

    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => { earthMat.map = tex; earthMat.needsUpdate = true }
    )
    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_specular_2048.jpg',
      (tex) => { earthMat.specularMap = tex; earthMat.needsUpdate = true }
    )

    const cloudGeo = new THREE.SphereGeometry(1.015, 64, 64)
    const cloudMat = new THREE.MeshPhongMaterial({
      transparent: true, opacity: 0.4, depthWrite: false,
    })
    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png',
      (tex) => { cloudMat.map = tex; cloudMat.alphaMap = tex; cloudMat.needsUpdate = true }
    )
    scene.add(new THREE.Mesh(cloudGeo, cloudMat))

    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x4488ff, transparent: true,
        opacity: 0.1, side: THREE.FrontSide, depthWrite: false,
      })
    ))

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.002, 8, 128),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 })
    )
    orbitRing.rotation.x = Math.PI / 4
    scene.add(orbitRing)

    const issMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    )
    issMarker.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.25 })
    ))
    scene.add(issMarker)
    issMarkerRef.current = issMarker

    const astronaut = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.12, 8),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa })
    )
    astronaut.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.2 })
    ))
    astronaut.position.set(0, 1.15, 0)
    scene.add(astronaut)
    astronautRef.current = astronaut

    const buildDebris = (count: number) => {
      const geo = new THREE.BufferGeometry()
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const lat = (Math.random() - 0.5) * Math.PI
        const lon = Math.random() * Math.PI * 2
        const r = 1.05 + Math.random() * 0.3
        pos[i * 3] = r * Math.cos(lat) * Math.sin(lon)
        pos[i * 3 + 1] = r * Math.sin(lat)
        pos[i * 3 + 2] = r * Math.cos(lat) * Math.cos(lon)
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      return new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xf472b6, size: 0.015, transparent: true, opacity: 0.6,
      }))
    }

    const debris = buildDebris(debrisCount)
    scene.add(debris)
    debrisRef.current = debris

    let animId: number
    const clouds = scene.children.find(
      c => c instanceof THREE.Mesh &&
      (c as THREE.Mesh).material === cloudMat
    ) as THREE.Mesh

    const animate = () => {
      animId = requestAnimationFrame(animate)
      earth.rotation.y += 0.0006
      if (clouds) clouds.rotation.y += 0.0008
      orbitRing.rotation.z += 0.001
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      controls.dispose()
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (!issMarkerRef.current || !position) return
    const lat = (position.latitude * Math.PI) / 180
    const lon = (position.longitude * Math.PI) / 180
    const r = 1.12
    issMarkerRef.current.position.set(
      r * Math.cos(lat) * Math.sin(lon),
      r * Math.sin(lat),
      r * Math.cos(lat) * Math.cos(lon)
    )
  }, [position])

  useEffect(() => {
    if (!sceneRef.current || !debrisRef.current) return
    sceneRef.current.remove(debrisRef.current)
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(debrisCount * 3)
    for (let i = 0; i < debrisCount; i++) {
      const lat = (Math.random() - 0.5) * Math.PI
      const lon = Math.random() * Math.PI * 2
      const r = 1.05 + Math.random() * 0.3
      pos[i * 3] = r * Math.cos(lat) * Math.sin(lon)
      pos[i * 3 + 1] = r * Math.sin(lat)
      pos[i * 3 + 2] = r * Math.cos(lat) * Math.cos(lon)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const newDebris = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xf472b6, size: 0.015, transparent: true, opacity: 0.6,
    }))
    sceneRef.current.add(newDebris)
    debrisRef.current = newDebris
  }, [debrisCount])

  const getRegionFromCoords = (lat: number, lon: number): string => {
    if (lat > 35 && lat < 70 && lon > -10 && lon < 40) return '🇪🇺 Europe'
    if (lat > 36 && lat < 71 && lon > 40 && lon < 65) return '🌍 Moyen-Orient'
    if (lat > 25 && lat < 50 && lon > -125 && lon < -65) return '🇺🇸 États-Unis'
    if (lat > 50 && lat < 85 && lon > -140 && lon < -55) return '🇨🇦 Canada'
    if (lat > -35 && lat < 25 && lon > -20 && lon < 55) return '🌍 Afrique'
    if (lat > 10 && lat < 55 && lon > 55 && lon < 150) return '🌏 Asie'
    if (lat > -50 && lat < 10 && lon > -80 && lon < -35) return '🌎 Amérique du Sud'
    if (lat > -50 && lat < 10 && lon > 110 && lon < 180) return '🌏 Océanie'
    if (lat > 10 && lat < 30 && lon > -120 && lon < -60) return '🌎 Mexique / Caraïbes'
    if (lat > 70 || lat < -60) return '🧊 Pôle'
    return '🌊 Océan'
  }

  const getUTCOffset = (lon: number): number => {
    return Math.round(lon / 15)
  }

  const handlePinMouseDown = (e: React.MouseEvent) => {
  e.preventDefault()
  setIsDragging(true)
  setDragPos({ x: e.clientX, y: e.clientY })
}

  const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return
  setDragPos({ x: e.clientX, y: e.clientY })

  if (!mountRef.current || !astronautRef.current) return
  const rect = mountRef.current.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current!)
  const globe = sceneRef.current?.children.find(
    c => c instanceof THREE.Mesh &&
    (c as THREE.Mesh).geometry instanceof THREE.SphereGeometry &&
    c !== astronautRef.current
  ) as THREE.Mesh

  if (globe) {
    const hits = raycaster.intersectObject(globe)
    if (hits.length > 0) {
      const point = hits[0].point.normalize().multiplyScalar(1.15)
      astronautRef.current.position.copy(point)
      astronautRef.current.lookAt(new THREE.Vector3(0, 0, 0))
    }
  }
}

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !astronautRef.current) return
    setIsDragging(false)
    const pos = astronautRef.current.position
    const lat = Math.asin(pos.y / pos.length()) * (180 / Math.PI)
    const lon = Math.atan2(pos.x, pos.z) * (180 / Math.PI)
    const region = getRegionFromCoords(lat, lon)
    const utcOffset = getUTCOffset(lon)
    const now = new Date()
    const localHour = (now.getUTCHours() + utcOffset + 24) % 24
    const localMin = now.getUTCMinutes().toString().padStart(2, '0')
    const localSec = now.getUTCSeconds().toString().padStart(2, '0')
    if (!mountRef.current) return
    const rect = mountRef.current.getBoundingClientRect()
    setPopup({
      region,
      utcOffset,
      localTime: `${localHour.toString().padStart(2, '0')}:${localMin}:${localSec}`,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 80,
    })
  }

  return (
    <div className="relative flex items-center justify-center select-none">
      
      {/* Canvas Three.js */}
      <div
        ref={mountRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
        style={{ cursor: isDragging ? 'crosshair' : 'grab' }}
        
      />

      {/* PIN ASTRONAUTE — fixe en bas à droite, draggable */}
      {!popup && (
        <div
          className="absolute bottom-14 right-4 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing z-20"
          onMouseDown={handlePinMouseDown}
          title="Glisse-moi sur le globe !"
        >
          <div className="text-2xl select-none">👨‍🚀</div>
          <span className="text-[8px] text-purple-300 tracking-wider">GLISSER</span>
        </div>
      )}

      {/* PIN en cours de drag — suit la souris */}
      {isDragging && (
        <div
          className="fixed text-2xl pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: dragPos.x, top: dragPos.y }}
        >
          👨‍🚀
        </div>
      )}

      {/* Slider débris */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-500/20">
        <span className="text-[9px] text-pink-300 uppercase tracking-wider">Débris</span>
        <input
          type="range" min={0} max={300} step={10}
          value={debrisCount}
          onChange={(e) => setDebrisCount(Number(e.target.value))}
          className="w-24 accent-pink-400"
        />
        <span className="text-[9px] text-pink-300 w-6">{debrisCount}</span>
      </div>

      {/* Légende */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[9px] text-slate-400">ISS Live</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <span className="text-[9px] text-slate-400">Débris ({debrisCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px]">👨‍🚀</span>
          <span className="text-[9px] text-slate-400">Pin interactif</span>
        </div>
      </div>

      {/* Popup résultat */}
      {popup && (
        <div
          className="absolute bg-slate-900/95 border border-purple-500/40 rounded-xl px-4 py-3 backdrop-blur-sm z-10"
          style={{ left: popup.x - 80, top: popup.y }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👨‍🚀</span>
            <span className="text-[11px] font-medium text-purple-300">{popup.region}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between gap-4">
              <span className="text-[10px] text-slate-400">Heure locale</span>
              <span className="text-[10px] font-medium text-cyan-300">{popup.localTime}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[10px] text-slate-400">Fuseau</span>
              <span className="text-[10px] font-medium text-yellow-300">
                UTC{popup.utcOffset >= 0 ? '+' : ''}{popup.utcOffset}
              </span>
            </div>
          </div>
          <button
            className="mt-2 text-[9px] text-slate-500 hover:text-purple-300 transition-colors"
            onClick={() => setPopup(null)}
          >
            ✕ Retirer le pin
          </button>
        </div>
      )}
    </div>
  )
}

export default EarthGlobe