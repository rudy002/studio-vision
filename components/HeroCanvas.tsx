'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const N = isMobile ? 150 : 300;
    const RADIUS = 6;
    const MAX_DIST = 0.8;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.set(0, 0, 22);

    // Distribution de Fibonacci sur sphère unité
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const unitPoints: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      unitPoints.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }

    // Particules dorées
    const pPositions = new Float32Array(N * 3);
    unitPoints.forEach((p, i) => {
      pPositions[i * 3]     = p.x * RADIUS;
      pPositions[i * 3 + 1] = p.y * RADIUS;
      pPositions[i * 3 + 2] = p.z * RADIUS;
    });
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x8b6520,
      size: 0.08,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);

    // Lignes de connexion avec opacité proportionnelle à la distance
    const linePositions: number[] = [];
    const lineAlphas: number[] = [];

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dist = unitPoints[i].distanceTo(unitPoints[j]);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.35;
          linePositions.push(
            unitPoints[i].x * RADIUS, unitPoints[i].y * RADIUS, unitPoints[i].z * RADIUS,
            unitPoints[j].x * RADIUS, unitPoints[j].y * RADIUS, unitPoints[j].z * RADIUS,
          );
          lineAlphas.push(alpha, alpha);
        }
      }
    }

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    lGeo.setAttribute('alpha',    new THREE.BufferAttribute(new Float32Array(lineAlphas), 1));

    // Shader avec alpha par vertex
    const lMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          gl_FragColor = vec4(0.545, 0.396, 0.125, vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lGeo, lMat);

    const group = new THREE.Group();
    group.add(particles);
    group.add(lines);
    group.position.x = 3;
    scene.add(group);

    // --- Drones ---
    type DroneInstance = { group: THREE.Group; propellers: THREE.Mesh[] };

    const buildDrone = (): DroneInstance => {
      const g = new THREE.Group();
      scene.add(g);

      const bodyMat = new THREE.MeshPhongMaterial({
        color: 0x2a2a2a,
        specular: 0x666666,
        shininess: 40,
        transparent: true,
        opacity: 0.92,
      });
      const propMat = new THREE.MeshPhongMaterial({
        color: 0x8b6520,
        specular: 0xffd9a0,
        shininess: 80,
        transparent: true,
        opacity: 0.80,
      });
      const lensMat = new THREE.MeshPhongMaterial({
        color: 0x1a1410,
        specular: 0x223355,
        shininess: 60,
      });

      // Corps
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), bodyMat));

      // 4 bras en croix légèrement inclinés
      const armGeo = new THREE.BoxGeometry(0.4, 0.05, 0.05);
      const armDefs: { pos: [number,number,number]; ry: number; tilt: number }[] = [
        { pos: [ 0.45, 0,  0],    ry: 0,           tilt: -0.13 },
        { pos: [-0.45, 0,  0],    ry: 0,           tilt:  0.13 },
        { pos: [ 0,    0,  0.45], ry: Math.PI / 2, tilt: -0.13 },
        { pos: [ 0,    0, -0.45], ry: Math.PI / 2, tilt:  0.13 },
      ];
      armDefs.forEach(({ pos, ry, tilt }) => {
        const arm = new THREE.Mesh(armGeo, bodyMat);
        arm.position.set(...pos);
        arm.rotation.y = ry;
        arm.rotation.z = tilt;
        g.add(arm);
      });

      // 4 hélices — rotation.x = π/2 pour les mettre à plat
      const propGeo = new THREE.TorusGeometry(0.18, 0.025, 4, 20);
      const propDefs: [number,number,number][] = [
        [ 0.65, 0,  0],
        [-0.65, 0,  0],
        [ 0,    0,  0.65],
        [ 0,    0, -0.65],
      ];
      const propellers: THREE.Mesh[] = [];
      propDefs.forEach((pos) => {
        const prop = new THREE.Mesh(propGeo, propMat);
        prop.position.set(...pos);
        prop.rotation.x = Math.PI / 2;
        g.add(prop);
        propellers.push(prop);
      });

      // Pieds d'atterrissage — 4 coins du corps
      const legGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8);
      const legCorners: [number,number,number][] = [
        [-0.22, -0.135, -0.22],
        [ 0.22, -0.135, -0.22],
        [-0.22, -0.135,  0.22],
        [ 0.22, -0.135,  0.22],
      ];
      legCorners.forEach((pos) => {
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(...pos);
        g.add(leg);
      });

      // Caméra : sphère + cylindre objectif
      const camSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), lensMat);
      camSphere.position.set(0, -0.14, 0.06);
      g.add(camSphere);

      const lensGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12);
      const lensObj = new THREE.Mesh(lensGeo, lensMat);
      lensObj.position.set(0, -0.14, 0.14);
      lensObj.rotation.x = Math.PI / 2;
      g.add(lensObj);

      // LED bleue
      const ledLight = new THREE.PointLight(0x00aaff, 0.5, 12);
      ledLight.position.set(0, -0.2, 0);
      g.add(ledLight);

      return { group: g, propellers };
    };

    const drone1 = buildDrone();
    const drone2 = buildDrone();

    const ORBIT_R1 = 9;
    const INCL1    =  Math.PI / 6;  //  30°
    const ORBIT_R2 = 10;
    const INCL2    = -Math.PI / 4;  // -45°
    const BANK     = -Math.PI / 12; // -15° d'inclinaison en virage
    const worldYAxis   = new THREE.Vector3(0, 1, 0);
    const sphereCenter = new THREE.Vector3(3, 0, 0);

    // Parallax souris — décalage cible avec lerp
    let targetMX = 0, targetMY = 0;
    let smoothMX = 0, smoothMY = 0;
    let onMouseMove: ((e: MouseEvent) => void) | null = null;

    if (!isMobile) {
      onMouseMove = (e: MouseEvent) => {
        targetMX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMY = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);
    }

    let t = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.003;

      smoothMX += (targetMX - smoothMX) * 0.04;
      smoothMY += (targetMY - smoothMY) * 0.04;

      group.rotation.y = t * 0.07 + smoothMX * 0.35;
      group.rotation.x = t * 0.025 + smoothMY * 0.22;

      // Drone 1 — orbite 30°, r=9, vitesse t*0.3
      const a1 = t * 0.3;
      drone1.group.position.set(
        3 + ORBIT_R1 * Math.cos(a1),
        ORBIT_R1 * Math.sin(a1) * Math.sin(INCL1) + Math.sin(t * 2) * 0.3,
        ORBIT_R1 * Math.sin(a1) * Math.cos(INCL1),
      );
      drone1.group.lookAt(sphereCenter);
      drone1.group.rotateZ(BANK);

      // Drone 2 — orbite -45°, r=10, vitesse t*0.2
      const a2 = t * 0.2 + Math.PI;
      drone2.group.position.set(
        3 + ORBIT_R2 * Math.cos(a2),
        ORBIT_R2 * Math.sin(a2) * Math.sin(INCL2) + Math.sin(t * 2 + 1) * 0.3,
        ORBIT_R2 * Math.sin(a2) * Math.cos(INCL2),
      );
      drone2.group.lookAt(sphereCenter);
      drone2.group.rotateZ(BANK);

      // Hélices — rotation rapide autour de l'axe Y monde
      [...drone1.propellers, ...drone2.propellers].forEach((prop, i) => {
        prop.rotateOnWorldAxis(worldYAxis, i % 2 === 0 ? 0.18 : -0.18);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (onMouseMove) window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
