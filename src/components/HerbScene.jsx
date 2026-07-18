import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const PARTICLE_COUNT_DESKTOP = 180;
const PARTICLE_COUNT_MOBILE = 70;

export default function HerbScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(0.15, 8, 8);
    const leafGeo = new THREE.TetrahedronGeometry(0.12, 1);
    const colors = [0x10b981, 0xf97316, 0x3b82f6, 0xeab308, 0xa855f7, 0xec4899];

    const particles = [];
    const materialCache = {};

    function getMaterial(color) {
      if (!materialCache[color]) {
        materialCache[color] = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 1.2,
          roughness: 0.2,
          metalness: 0.1,
        });
      }
      return materialCache[color];
    }

    for (let i = 0; i < count; i++) {
      const geo = i % 3 === 0 ? leafGeo : geometry;
      const mat = getMaterial(colors[i % colors.length]);
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 15
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.025,
        speedZ: (Math.random() - 0.5) * 0.01,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        amplitude: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      };

      scene.add(mesh);
      particles.push(mesh);
    }

    const ambientLight = new THREE.AmbientLight(0x334455, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x10b981, 80, 60);
    pointLight.position.set(5, 10, 20);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xf97316, 60, 50);
    pointLight2.position.set(-10, -5, 15);
    scene.add(pointLight2);

    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      particles.forEach((p) => {
        p.position.x += p.userData.speedX;
        p.position.y += Math.sin(t * 0.8 + p.userData.phase) * p.userData.amplitude * 0.03;
        p.position.z += p.userData.speedZ;
        p.rotation.x += p.userData.rotSpeed;
        p.rotation.y += p.userData.rotSpeed * 0.7;

        if (Math.abs(p.position.x) > 25) p.userData.speedX *= -1;
        if (Math.abs(p.position.y) > 17) p.userData.speedY *= -1;
        if (Math.abs(p.position.z) > 8) p.userData.speedZ *= -1;
      });

      pointLight.intensity = 80 + Math.sin(t * 1.5) * 15;
      pointLight2.intensity = 60 + Math.cos(t * 1.3) * 12;
      camera.position.z = 30 + Math.sin(t * 0.3) * 1.5;

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      particles.forEach((p) => {
        p.geometry?.dispose();
      });
      Object.values(materialCache).forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
}
