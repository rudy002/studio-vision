'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 800 : 1800;
    const count2 = isMobile ? 400 : 900;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf0ede7, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf0ede7, 0.012);

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.set(0, 0, 35);

    // Particules dorées
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 130;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xb08d57, size: 0.22, transparent: true, opacity: 0.35 });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Petites particules crème
    const geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(count2 * 3);
    for (let i = 0; i < count2; i++) {
      pos2[i * 3] = (Math.random() - 0.5) * 100;
      pos2[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos2[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    const mat2 = new THREE.PointsMaterial({ color: 0xccb89a, size: 0.13, transparent: true, opacity: 0.5 });
    const particles2 = new THREE.Points(geo2, mat2);
    scene.add(particles2);

    // Lignes architecturales
    const lineMat = new THREE.LineBasicMaterial({ color: 0xb08d57, transparent: true, opacity: 0.06 });
    for (let i = 0; i < 8; i++) {
      const y = (i - 4) * 7;
      const pts = [new THREE.Vector3(-70, y, -15), new THREE.Vector3(70, y, -15)];
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // Sphères flottantes
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const spheres: { mesh: THREE.Mesh, speed: number, offset: number }[] = [];
    const spherePositions = [[18, 8, 5], [25, -5, 2], [-22, 6, 8], [-30, -8, 3], [10, -12, 6]];
    spherePositions.forEach(([x, y, z], i) => {
      const m = new THREE.MeshBasicMaterial({ color: 0xb08d57, transparent: true, opacity: 0.07, wireframe: true });
      const s = new THREE.Mesh(sphereGeo, m);
      s.position.set(x, y, z);
      const scale = 1.5 + i * 0.6;
      s.scale.set(scale, scale, scale);
      scene.add(s);
      spheres.push({ mesh: s, speed: 0.003 + i * 0.001, offset: i * 1.2 });
    });

    // Mouse parallax (desktop seulement)
    let mx = 0, my = 0;
    let onMouseMove: ((e: MouseEvent) => void) | null = null;

    if (!isMobile) {
      onMouseMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);
    }

    let t = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.003;

      particles.rotation.y = t * 0.035 + mx * 0.04;
      particles.rotation.x = Math.sin(t * 0.4) * 0.025 + my * 0.02;
      particles2.rotation.y = -t * 0.05;

      spheres.forEach(({ mesh, speed, offset }) => {
        mesh.position.y += Math.sin(t + offset) * speed;
        mesh.rotation.x += 0.003;
        mesh.rotation.z += 0.002;
      });

      camera.position.x += (mx * 1.8 - camera.position.x) * 0.018;
      camera.position.y += (-my * 1.2 - camera.position.y) * 0.018;
      camera.lookAt(0, 0, 0);

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