import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BattleMonster, ElementType } from '../types/game';

interface Props {
  playerMonsters: BattleMonster[];
  enemyMonsters: BattleMonster[];
  activeTurnMonsterId: string;
  selectedTargetId: string;
  attackingMonsterId: string | null;
  hitMonsterId: string | null;
  activeVfx: { key: string; targetId: string; attackerId: string } | null;
  floatingTexts: { id: string; targetMonsterId: string; text: string; color: string; isCrit?: boolean }[];
  onSelectTarget: (id: string) => void;
}

const ELEMENT: Record<ElementType, number> = {
  fire: 0xff572e,
  earth: 0x9b7950,
  water: 0x36bde8,
  dark: 0x9c63dc,
  nature: 0x10b981,
  thunder: 0xfacc15,
};

function material(color: number, roughness = 0.55, metalness = 0.1) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addMesh(
  parent: THREE.Group,
  geometry: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1
) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Procedural 3D creature geometry: distinctive silhouettes for each of the 6 elements
function makeCreature(bm: BattleMonster) {
  const root = new THREE.Group();
  const e = bm.monster.element;
  const color = ELEMENT[e] || ELEMENT.fire;
  const skin = material(color, 0.45, 0.12);
  const dark = material(new THREE.Color(color).multiplyScalar(0.45).getHex());
  const hornColor =
    e === 'fire'
      ? 0xffd08a
      : e === 'water'
      ? 0xb8f1ff
      : e === 'thunder'
      ? 0xfef08a
      : e === 'nature'
      ? 0x86efac
      : 0xd8d2c5;
  const horn = material(hornColor, 0.35, 0.22);
  const bellyColor = new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.35).getHex();
  const belly = material(bellyColor);
  const sphere = new THREE.SphereGeometry(1, 18, 12);
  const cone = new THREE.ConeGeometry(0.22, 0.75, 7);

  // Torso and chest
  addMesh(root, sphere, skin, 0, 1.05, 0, 0.72, 0.88, 0.58);
  addMesh(root, sphere, belly, 0.38, 1.12, 0, 0.34, 0.52, 0.44);

  // Head pointing towards opponent (+X in local coordinates)
  addMesh(root, sphere, skin, 0.58, 1.88, 0, 0.48, 0.48, 0.45);
  addMesh(root, sphere, dark, 0.88, 1.72, 0, 0.38, 0.22, 0.34);

  // Emissive glowing eyes
  const eyeEmissive =
    e === 'thunder'
      ? 0x38bdf8
      : e === 'nature'
      ? 0x4ade80
      : e === 'fire'
      ? 0xffa52c
      : e === 'water'
      ? 0x67e8f9
      : 0xd8b4fe;
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: eyeEmissive,
    emissiveIntensity: 1.0,
  });
  addMesh(root, sphere, eyeMat, 0.82, 1.98, 0.34, 0.075, 0.075, 0.055);
  addMesh(root, sphere, eyeMat, 0.82, 1.98, -0.34, 0.075, 0.075, 0.055);

  // Limbs (Arms & Legs)
  for (const z of [-0.34, 0.34]) {
    addMesh(root, sphere, dark, -0.2, 0.43, z, 0.23, 0.48, 0.22);
    addMesh(root, sphere, skin, 0.15, 1.12, z * 1.65, 0.25, 0.55, 0.2).rotation.z = -0.35;
  }

  // Element-specific anatomical silhouettes
  if (e === 'fire' || e === 'dark') {
    // Horns
    for (let i = 0; i < 3; i++) {
      const sp = addMesh(root, cone, i === 1 ? horn : dark, -0.35 - i * 0.18, 1.82 + i * 0.2, 0, 0.85, 0.9, 0.85);
      sp.rotation.z = Math.PI / 2;
    }
    // Tail
    const tail = addMesh(root, cone, e === 'fire' ? horn : dark, -0.82, 0.75, 0, 0.8, 1.8, 0.8);
    tail.rotation.z = -Math.PI / 2;
    // Dragon/Bat Wings
    for (const z of [-0.48, 0.48]) {
      const wing = addMesh(root, new THREE.ConeGeometry(0.55, 1.15, 5), dark, -0.18, 1.75, z, 1, 1, 0.22);
      wing.rotation.z = Math.PI / 2.8;
    }
  } else if (e === 'earth') {
    // Heavy crystal armor & spikes
    for (let i = 0; i < 5; i++) {
      const spike = addMesh(root, cone, horn, -0.48 + i * 0.23, 1.75 + (i % 2) * 0.28, 0, 0.9, 1.15, 0.9);
      spike.rotation.z = -Math.PI / 2;
    }
    addMesh(root, sphere, dark, -0.55, 1.05, 0, 0.35, 0.72, 0.62);
  } else if (e === 'water') {
    // Fins & crest
    for (const z of [-0.3, 0.3]) {
      const fin = addMesh(root, cone, horn, -0.2, 1.55, z, 0.7, 1.5, 0.65);
      fin.rotation.z = Math.PI / 2;
    }
    const crest = addMesh(root, new THREE.TorusGeometry(0.42, 0.09, 8, 18), horn, -0.75, 0.85, 0, 1, 1, 1);
    crest.rotation.y = Math.PI / 2;
  } else if (e === 'thunder') {
    // Jagged Lightning Horns & Falcon Wings
    for (let i = 0; i < 2; i++) {
      const spike = addMesh(root, cone, horn, -0.2 + i * 0.35, 2.3, i ? 0.28 : -0.28, 0.7, 1.35, 0.7);
      spike.rotation.z = Math.PI;
    }
    for (const z of [-0.45, 0.45]) {
      const wing = addMesh(root, new THREE.BoxGeometry(0.8, 0.1, 0.3), horn, -0.15, 1.65, z, 1, 1, 1);
      wing.rotation.y = z > 0 ? 0.5 : -0.5;
    }
  } else if (e === 'nature') {
    // Ancient Forest Antlers & Leaf Crest
    for (let i = 0; i < 3; i++) {
      const leaf = addMesh(root, cone, belly, -0.45 + i * 0.32, 1.7, i % 2 ? 0.35 : -0.35, 0.85, 1.45, 0.7);
      leaf.rotation.z = Math.PI / 2;
    }
    const crown = addMesh(root, new THREE.TorusGeometry(0.35, 0.08, 6, 16), horn, 0.55, 2.25, 0, 1, 0.5, 1);
    crown.rotation.x = Math.PI / 2;
  }

  // Feet claws
  for (const z of [-0.35, 0.35]) {
    const claw = addMesh(root, cone, horn, 0.12, 0.12, z, 0.45, 0.6, 0.55);
    claw.rotation.z = -Math.PI / 2;
  }

  root.userData.body = root.children[0];
  root.userData.element = e;
  return root;
}

export const BattleArena3D: React.FC<Props> = ({
  playerMonsters,
  enemyMonsters,
  activeTurnMonsterId,
  selectedTargetId,
  attackingMonsterId,
  hitMonsterId,
  activeVfx,
  floatingTexts,
  onSelectTarget,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const objectsRef = useRef<Map<string, THREE.Group>>(new Map());
  const vfxGroupRef = useRef<THREE.Group | null>(null);
  const [ready, setReady] = useState(false);
  const all = [...playerMonsters, ...enemyMonsters];
  const latestRef = useRef({ all, activeTurnMonsterId, attackingMonsterId, hitMonsterId, activeVfx });
  latestRef.current = { all, activeTurnMonsterId, attackingMonsterId, hitMonsterId, activeVfx };

  // Trigger real 3D Three.js spell effects in the scene
  useEffect(() => {
    if (!activeVfx || !vfxGroupRef.current) return;
    const vfxGroup = vfxGroupRef.current;
    const groups = objectsRef.current;
    const targetGroup = groups.get(activeVfx.targetId);
    const attackerGroup = groups.get(activeVfx.attackerId);
    if (!targetGroup) return;

    const tx = targetGroup.position.x;
    const ty = targetGroup.position.y;
    const tz = targetGroup.position.z;

    const ax = attackerGroup ? attackerGroup.position.x : 0;
    const az = attackerGroup ? attackerGroup.position.z : 0;

    const activeObjects: THREE.Object3D[] = [];

    if (activeVfx.key === 'attack_meteor_special' || activeVfx.key.includes('fire')) {
      // 3D Blazing Meteor Spawning & Smashing Target
      const meteorGeom = new THREE.SphereGeometry(0.85, 16, 16);
      const meteorMat = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xffaa00,
        emissiveIntensity: 2.2,
      });
      const meteor = new THREE.Mesh(meteorGeom, meteorMat);
      meteor.position.set(tx - (ax > tx ? -4 : 4), 11, tz - 2);
      vfxGroup.add(meteor);
      activeObjects.push(meteor);

      // Expanding Impact Shockwave Ring
      const ringGeom = new THREE.RingGeometry(0.2, 0.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff5500,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(tx, 0.05, tz);
      vfxGroup.add(ring);
      activeObjects.push(ring);

      let p = 0;
      const anim = setInterval(() => {
        p += 0.06;
        meteor.position.x = THREE.MathUtils.lerp(meteor.position.x, tx, 0.2);
        meteor.position.y = THREE.MathUtils.lerp(meteor.position.y, ty + 0.3, 0.22);
        meteor.position.z = THREE.MathUtils.lerp(meteor.position.z, tz, 0.2);
        ring.scale.setScalar(1 + p * 12);
        ringMat.opacity = Math.max(0, 0.9 - p * 1.5);
        if (p >= 1) {
          clearInterval(anim);
          vfxGroup.remove(meteor);
          vfxGroup.remove(ring);
        }
      }, 25);
    } else if (activeVfx.key === 'attack_thunder_strike') {
      // 3D Vertical Zigzag Lightning Arc
      const points = [
        new THREE.Vector3(tx + (Math.random() - 0.5), 14, tz),
        new THREE.Vector3(tx + 0.8, 9, tz + 0.3),
        new THREE.Vector3(tx - 0.6, 5, tz - 0.2),
        new THREE.Vector3(tx, ty + 0.5, tz),
      ];
      const lightningGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lightningMat = new THREE.LineBasicMaterial({
        color: 0xfef08a,
        linewidth: 4,
      });
      const lightning = new THREE.Line(lightningGeom, lightningMat);
      vfxGroup.add(lightning);
      activeObjects.push(lightning);

      // Yellow spark particles
      const sparksGeom = new THREE.SphereGeometry(0.12, 6, 6);
      const sparksMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      for (let i = 0; i < 8; i++) {
        const spark = new THREE.Mesh(sparksGeom, sparksMat);
        spark.position.set(tx + (Math.random() - 0.5) * 1.5, ty + 1 + Math.random(), tz + (Math.random() - 0.5) * 1.5);
        vfxGroup.add(spark);
        activeObjects.push(spark);
      }

      setTimeout(() => {
        activeObjects.forEach((obj) => vfxGroup.remove(obj));
      }, 450);
    } else if (activeVfx.key === 'attack_water_surge') {
      // Expanding 3D Swirling Torus Water Wave
      const waveGeom = new THREE.TorusGeometry(1.2, 0.18, 8, 24);
      const waveMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const wave = new THREE.Mesh(waveGeom, waveMat);
      wave.rotation.x = Math.PI / 2;
      wave.position.set(tx, ty + 0.6, tz);
      vfxGroup.add(wave);
      activeObjects.push(wave);

      let p = 0;
      const anim = setInterval(() => {
        p += 0.08;
        wave.scale.setScalar(1 + p * 3.5);
        wave.rotation.z += 0.2;
        waveMat.opacity = Math.max(0, 0.85 - p);
        if (p >= 1) {
          clearInterval(anim);
          vfxGroup.remove(wave);
        }
      }, 30);
    } else if (activeVfx.key === 'attack_nature_vines') {
      // 3D Swirling Emerald Spore Particles & Rings
      const ringGeom = new THREE.TorusGeometry(1.1, 0.12, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 1.2,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(tx, ty + 1, tz);
      vfxGroup.add(ring);
      activeObjects.push(ring);

      let p = 0;
      const anim = setInterval(() => {
        p += 0.07;
        ring.rotation.x += 0.15;
        ring.rotation.y += 0.25;
        ring.position.y += 0.05;
        if (p >= 1) {
          clearInterval(anim);
          vfxGroup.remove(ring);
        }
      }, 30);
    } else {
      // Generic Concussive Energy Wave
      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
      );
      hitSphere.position.set(tx, ty + 1, tz);
      vfxGroup.add(hitSphere);
      activeObjects.push(hitSphere);
      setTimeout(() => vfxGroup.remove(hitSphere), 300);
    }

    return () => {
      activeObjects.forEach((obj) => vfxGroup.remove(obj));
    };
  }, [activeVfx]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setReady(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 18, 36);

    const camera = new THREE.PerspectiveCamera(34, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 7.8, 22);
    camera.lookAt(0, 1.3, 0);

    const vfxGroup = new THREE.Group();
    scene.add(vfxGroup);
    vfxGroupRef.current = vfxGroup;

    // Dynamic Cinematic Lighting
    scene.add(new THREE.HemisphereLight(0x93c5fd, 0x1e1b4b, 2.2));
    const key = new THREE.DirectionalLight(0xffedd5, 3.4);
    key.position.set(-6, 12, 9);
    key.castShadow = true;
    scene.add(key);

    const rim = new THREE.PointLight(0x38bdf8, 70, 26);
    rim.position.set(5, 5, -5);
    scene.add(rim);

    // Arena Floor
    const floor = new THREE.Mesh(new THREE.CircleGeometry(10.5, 64), material(0x1e293b, 0.85, 0.15));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.03;
    floor.scale.set(1.25, 0.72, 1);
    floor.receiveShadow = true;
    scene.add(floor);

    // Golden Arena Perimeter Ring
    const arenaRing = new THREE.Mesh(
      new THREE.TorusGeometry(8.2, 0.18, 12, 80),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.75,
        roughness: 0.28,
        emissive: 0x78350f,
      })
    );
    arenaRing.rotation.x = Math.PI / 2;
    arenaRing.position.y = 0.08;
    arenaRing.scale.set(1.25, 0.72, 1);
    scene.add(arenaRing);

    // Stone Pillars around Colosseum
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 4.0, 8), material(0x334155));
      pillar.position.set(Math.cos(a) * 10.2, 1.9, Math.sin(a) * 6.2);
      scene.add(pillar);
    }

    const grid = new THREE.GridHelper(18, 28, 0xb45309, 0x334155);
    grid.position.y = 0.02;
    grid.scale.set(1.2, 1, 0.7);
    scene.add(grid);

    const groups = new Map<string, THREE.Group>();
    all.forEach((bm) => {
      const g = makeCreature(bm);
      const side = bm.isAi ? 1 : -1;
      const lane = bm.position - 1;
      g.position.set(side * (3.7 + Math.abs(lane) * 0.18), 0, lane * 2.15);
      g.rotation.y = bm.isAi ? Math.PI : 0;
      g.scale.setScalar(bm.isDefeated ? 0.001 : 1);
      scene.add(g);
      groups.set(bm.monster.id, g);

      // Colored element ring on pedestal
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.88, 0.055, 8, 36),
        new THREE.MeshBasicMaterial({
          color: ELEMENT[bm.monster.element],
          transparent: true,
          opacity: 0.85,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.12;
      g.add(ring);
    });

    objectsRef.current = groups;
    setReady(true);

    let raf = 0;
    const clock = new THREE.Clock();
    const defaultCamPos = new THREE.Vector3(0, 7.8, 22);
    const defaultCamLook = new THREE.Vector3(0, 1.3, 0);
    const currentCamLook = new THREE.Vector3(0, 1.3, 0);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const latest = latestRef.current;

      // Dynamic Smooth Cinematic Camera
      let targetCamPos = defaultCamPos;
      let targetCamLook = defaultCamLook;

      if (latest.attackingMonsterId) {
        const ag = groups.get(latest.attackingMonsterId);
        if (ag) {
          targetCamPos = new THREE.Vector3(ag.position.x * 0.45, 6.4, 18.2);
          targetCamLook = new THREE.Vector3(ag.position.x * 0.25, 1.4, ag.position.z * 0.3);
        }
      }

      camera.position.lerp(targetCamPos, 0.06);
      currentCamLook.lerp(targetCamLook, 0.06);
      camera.lookAt(currentCamLook);

      groups.forEach((g, id) => {
        const bm = latest.all.find((x) => x.monster.id === id);
        if (!bm) return;

        const active = id === latest.activeTurnMonsterId;
        const attack = id === latest.attackingMonsterId;
        const hit = id === latest.hitMonsterId;
        const defeated = bm.isDefeated;
        const baseX = (bm.isAi ? 1 : -1) * (3.7 + Math.abs(bm.position - 1) * 0.18);

        // Breathing & idle motion
        g.position.y = defeated
          ? -0.48
          : Math.sin(t * 2.1 + bm.position) * 0.07 + (active ? Math.sin(t * 4) * 0.08 : 0);

        // Attack lunging towards opponent
        g.position.x =
          baseX +
          (attack ? (bm.isAi ? -1 : 1) * 1.55 * Math.sin(Math.min(1, ((t % 0.8) / 0.8) * Math.PI)) : 0) +
          (hit ? (bm.isAi ? 0.22 : -0.22) * Math.sin(t * 40) : 0);

        g.rotation.z = attack
          ? Math.sin(t * 12) * 0.14
          : hit
          ? Math.sin(t * 34) * 0.08
          : Math.sin(t * 1.4) * 0.018;

        g.scale.setScalar(defeated ? 0.72 : hit ? 1.04 : active ? 1.04 : 1);

        g.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (m.emissive) {
              m.emissive.set(hit ? 0xff2411 : active ? ELEMENT[bm.monster.element] : 0x000000);
              m.emissiveIntensity = hit ? 1.6 : active ? 0.18 : 0;
            }
          }
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!host.isConnected) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      groups.forEach((g) => {
        scene.remove(g);
        g.traverse((o) => {
          if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
      objectsRef.current.clear();
      vfxGroupRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inActiveBattleKey(playerMonsters, enemyMonsters)]);

  const floatingFor = (id: string) => floatingTexts.filter((x) => x.targetMonsterId === id);

  return (
    <div className="relative w-full h-[470px] sm:h-[540px] rounded-3xl overflow-hidden border border-amber-900/60 bg-slate-950 shadow-[inset_0_0_80px_rgba(2,6,23,.9)] select-none">
      <div ref={hostRef} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-amber-200 text-sm">
          جاري تجهيز ساحة المعركة ثلاثية الأبعاد (3D WebGL)...
        </div>
      )}

      {/* Team header tags */}
      <div className="absolute inset-x-0 top-0 flex justify-between p-3 pointer-events-none z-20">
        <span className="rounded-xl bg-blue-950/85 border border-blue-400/40 px-3 py-1 text-xs font-black text-blue-200 shadow-md">
          فريقك (Your Monsters)
        </span>
        <span className="rounded-xl bg-red-950/85 border border-red-400/40 px-3 py-1 text-xs font-black text-red-200 shadow-md">
          الخصم (AI Team)
        </span>
      </div>

      {/* Real-time monster health and targeting cards */}
      <div className="absolute inset-x-0 bottom-2 flex justify-between gap-2 px-2 items-end z-20 pointer-events-auto">
        {[playerMonsters, enemyMonsters].map((team, side) => (
          <div key={side} className={`flex flex-1 gap-1.5 ${side ? 'justify-end' : 'justify-start'}`}>
            {team.map((bm) => {
              const hp = Math.max(0, (bm.currentHp / bm.monster.maxHp) * 100);
              const isTarget = selectedTargetId === bm.monster.id;
              const isCurrentTurn = activeTurnMonsterId === bm.monster.id;

              return (
                <button
                  key={bm.monster.id}
                  onClick={() => bm.isAi && !bm.isDefeated && onSelectTarget(bm.monster.id)}
                  className={`min-w-0 w-[31%] rounded-xl border p-2 text-right backdrop-blur-md transition-all shadow-lg ${
                    isTarget
                      ? 'border-red-400 bg-red-950/90 ring-2 ring-red-500/50 scale-102'
                      : isCurrentTurn
                      ? 'border-amber-400 bg-amber-950/70 ring-1 ring-amber-400/50'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  } ${bm.isDefeated ? 'opacity-35 grayscale' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-black text-white">
                    <span className="truncate">{bm.monster.nameAr}</span>
                    <span className="text-amber-400 text-[10px]">Lv.{bm.monster.level}</span>
                  </div>

                  {/* HP Bar */}
                  <div className="h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hp > 50 ? 'bg-emerald-400' : hp > 20 ? 'bg-amber-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${hp}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-300 mt-1 font-mono font-bold">
                    <span>{bm.currentHp} HP</span>
                    <span>{bm.currentStamina} ST</span>
                  </div>

                  {/* Floating combat damage text */}
                  {floatingFor(bm.monster.id).slice(-1).map((f) => (
                    <div key={f.id} className="text-[11px] font-black text-amber-300 animate-bounce mt-0.5">
                      {f.text}
                    </div>
                  ))}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

function inActiveBattleKey(p: BattleMonster[], e: BattleMonster[]) {
  return [...p, ...e].map((x) => x.monster.id).join('|');
}
