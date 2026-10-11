import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const INTRO_SLOW = 1.25;

function applyDefaults(tex: THREE.CanvasTexture, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 1;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function createCheckerTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#2f3850";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#252c40";
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillRect(64, 64, 64, 64);
  ctx.strokeStyle = "#1a2030";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 64, 64);
  ctx.strokeRect(64, 0, 64, 64);
  ctx.strokeRect(0, 64, 64, 64);
  ctx.strokeRect(64, 64, 64, 64);
  return applyDefaults(new THREE.CanvasTexture(c), 15, 15);
}

function createCrateTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#a06a35";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(70,40,15,${Math.random() * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const y = Math.random() * 128;
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + Math.random() * 2 - 1);
    ctx.stroke();
  }
  ctx.strokeStyle = "#5a3818";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 120, 120);
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(8, 8); ctx.lineTo(120, 120);
  ctx.moveTo(120, 8); ctx.lineTo(8, 120);
  ctx.stroke();
  ctx.fillStyle = "#3a2510";
  for (const [x, y] of [[16, 16], [112, 16], [16, 112], [112, 112]]) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  return applyDefaults(new THREE.CanvasTexture(c));
}

function createWallTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#2d3648";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#1e2533";
  ctx.lineWidth = 2;
  for (let y = 0; y < 128; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }
  for (let x = 0; x < 128; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 128);
    ctx.stroke();
  }
  return applyDefaults(new THREE.CanvasTexture(c), 5, 2);
}

function createWoodTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d8b890";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 6; i++) {
    const y = i * 22;
    ctx.fillStyle = `rgba(160, 120, 70, ${0.15 + Math.random() * 0.2})`;
    ctx.fillRect(0, y, 128, 20);
    ctx.strokeStyle = "#a07850";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + 20);
    ctx.lineTo(128, y + 20);
    ctx.stroke();
  }
  return applyDefaults(new THREE.CanvasTexture(c), 1, 1);
}

function createRoofTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7a2e15";
  ctx.fillRect(0, 0, 128, 128);

  const rowH = 16;
  const colW = 16;
  const rows = 128 / rowH;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const offsetX = (r % 2) * (colW / 2);

    for (let x = -colW; x < 128 + colW; x += colW) {
      const px = x + offsetX;

      ctx.fillStyle = "rgba(30, 10, 5, 0.5)";
      ctx.beginPath();
      ctx.ellipse(px + colW / 2, y + rowH - 1, colW / 2, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createLinearGradient(px, y, px, y + rowH);
      grad.addColorStop(0, "#a84320");
      grad.addColorStop(0.5, "#8a3a20");
      grad.addColorStop(1, "#6a2a15");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(px + 1, y + 1);
      ctx.lineTo(px + 1, y + rowH - 2);
      ctx.quadraticCurveTo(px + colW / 2, y + rowH + 2, px + colW - 1, y + rowH - 2);
      ctx.lineTo(px + colW - 1, y + 1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(220, 120, 80, 0.35)";
      ctx.beginPath();
      ctx.moveTo(px + 2, y + 2);
      ctx.lineTo(px + colW - 2, y + 2);
      ctx.lineTo(px + colW - 2, y + 4);
      ctx.lineTo(px + 2, y + 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(40, 15, 5, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + rowH - 2);
      ctx.stroke();
    }
  }

  const img = ctx.getImageData(0, 0, 128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + noise));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + noise));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 1;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function createChimneyTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#6a6a6a";
  ctx.fillRect(0, 0, 128, 128);

  const brickH = 16;
  const brickW = 24;

  for (let r = 0; r < 128 / brickH; r++) {
    const y = r * brickH;
    const offsetX = (r % 2) * (brickW / 2);

    for (let x = -brickW; x < 128 + brickW; x += brickW) {
      const px = x + offsetX;

      const gray = 140 + Math.random() * 40;
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray + 5})`;
      ctx.fillRect(px + 1, y + 1, brickW - 2, brickH - 2);

      ctx.fillStyle = "rgba(80, 80, 80, 0.6)";
      for (let i = 0; i < 15; i++) {
        const dx = Math.random() * brickW;
        const dy = Math.random() * brickH;
        ctx.fillRect(px + dx, y + dy, 1, 1);
      }
    }
  }

  // Швы между кирпичами — тёмно-серые
  ctx.strokeStyle = "rgba(50, 50, 50, 0.9)";
  ctx.lineWidth = 2;
  for (let r = 0; r <= 128 / brickH; r++) {
    const y = r * brickH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }

  const img = ctx.getImageData(0, 0, 128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + noise));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + noise));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  tex.anisotropy = 1;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function createSmokeTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 128);

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(220, 220, 225, 1)");
  grad.addColorStop(0.4, "rgba(200, 200, 210, 0.6)");
  grad.addColorStop(0.75, "rgba(180, 180, 195, 0.2)");
  grad.addColorStop(1, "rgba(160, 160, 180, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const img = ctx.getImageData(0, 0, 128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + noise));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + noise));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function createWelcomeTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d")!;

  ctx.clearRect(0, 0, 512, 128);

  ctx.shadowColor = "rgba(255, 200, 80, 0.9)";
  ctx.shadowBlur = 20;

  ctx.font = "bold 90px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const grad = ctx.createLinearGradient(0, 20, 0, 108);
  grad.addColorStop(0, "#fff0a0");
  grad.addColorStop(0.4, "#ffd060");
  grad.addColorStop(0.6, "#e0a020");
  grad.addColorStop(1, "#a06a10");
  ctx.fillStyle = grad;

  ctx.fillText("WELCOME", 256, 64);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#3a2000";
  ctx.lineWidth = 3;
  ctx.strokeText("WELCOME", 256, 64);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

const texCache: Record<string, THREE.CanvasTexture> = {};
function getTex(name: string, factory: () => THREE.CanvasTexture): THREE.CanvasTexture {
  if (!texCache[name]) texCache[name] = factory();
  return texCache[name];
}

function Wall({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const wallTex = getTex("wall", createWallTexture);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[30, 7.5]} />
        <meshLambertMaterial map={wallTex} />
      </mesh>
      <mesh position={[0, -3.5, 0.02]}>
        <planeGeometry args={[30, 0.5]} />
        <meshLambertMaterial color="#4a566e" />
      </mesh>
      <mesh position={[0, 3.5, 0.02]}>
        <planeGeometry args={[30, 0.4]} />
        <meshLambertMaterial color="#4a566e" />
      </mesh>
      {[-8, 0, 8].map((x, i) => (
        <group key={i} position={[x, 2.2, 0.04]}>
          <mesh>
            <planeGeometry args={[1.8, 0.9]} />
            <meshBasicMaterial color="#fff8d4" />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[2.8, 1.6]} />
            <meshBasicMaterial color="#fff0b0" transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Floor() {
  const checkTex = getTex("checker", createCheckerTexture);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshLambertMaterial map={checkTex} />
    </mesh>
  );
}

function Ceiling() {
  const beams: ReactElement[] = [];
  for (let i = -2; i <= 2; i++) {
    beams.push(
      <mesh key={i} position={[i * 5, 5.85, 0]}>
        <boxGeometry args={[0.4, 0.3, 30]} />
        <meshLambertMaterial color="#3a4459" />
      </mesh>
    );
  }
  return (
    <>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshLambertMaterial color="#4a5470" side={THREE.DoubleSide} />
      </mesh>
      {beams}
    </>
  );
}

function Room() {
  return (
    <>
      <Floor />
      <Ceiling />
      <Wall position={[0, 2.25, -15]} />
      <Wall position={[0, 2.25, 15]} rotationY={Math.PI} />
      <Wall position={[-15, 2.25, 0]} rotationY={Math.PI / 2} />
      <Wall position={[15, 2.25, 0]} rotationY={-Math.PI / 2} />
    </>
  );
}

function Smoke({ x, y, z }: { x: number; y: number; z: number }) {
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const particles = 30;
  const smokeTex = getTex("smoke", createSmokeTexture);

  useFrame(() => {
    const t = performance.now() / 1000;
    for (let i = 0; i < particles; i++) {
      const sprite = refs.current[i];
      if (!sprite) continue;

      const offset = i / particles;
      const phase = (t * 0.10 + offset) % 1;

      const swayX = Math.sin(phase * Math.PI * 1.5 + t * 0.2) * 0.4 * phase;
      const swayZ = Math.cos(phase * Math.PI * 1.5 + t * 0.2) * 0.4 * phase;

      sprite.position.x = swayX;
      sprite.position.y = phase * 3.2;
      sprite.position.z = swayZ;

      const size = 0.25 + phase * 0.5;
      sprite.scale.set(size, size, 1);

      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = Math.sin(phase * Math.PI) * 0.5;
      mat.rotation = phase * 1.5 + i * 0.7;
    }
  });

  return (
    <group position={[x, y, z]}>
      {Array.from({ length: particles }).map((_, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el; }}>
          <spriteMaterial
            map={smokeTex}
            transparent
            opacity={0.5}
            depthWrite={false}
            color="#d8d8e0"
          />
        </sprite>
      ))}
    </group>
  );
}

function WelcomeSign() {
  const welcomeTex = getTex("welcome", createWelcomeTexture);

  return (
    <mesh
      position={[0, 2.09, 1.57]}
      rotation={[-Math.PI / 2 + Math.PI / 8, 0, 0]}
    >
      <planeGeometry args={[1.1, 0.28]} />
      <meshBasicMaterial
        map={welcomeTex}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function GableTriangle({ width, height, wallW, wallH }: { width: number; height: number; wallW: number; wallH: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const verts = new Float32Array([
      -width / 2, 0, 0,
       width / 2, 0, 0,
       0, height, 0,
    ]);
    const uL = 0;
    const uR = width / wallW;
    const uT = width / wallW / 2;
    const vB = 1;
    const vT = 1 + height / wallH;

    const uvs = new Float32Array([
      uL, vB,
      uR, vB,
      uT, vT,
    ]);
    g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    g.computeVertexNormals();
    return g;
  }, [width, height, wallW, wallH]);

  return <primitive object={geometry} attach="geometry" />;
}

function FrontWindow({ x }: { x: number }) {
  const trimColor = "#5a3018";
  const D = 2.4;
  const y = 1.35;

  return (
    <group>
      <mesh position={[x, y, D / 2]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#ffcc70" side={THREE.DoubleSide} />
      </mesh>

      {/* Верхний наличник */}
      <mesh position={[x, y + 0.33, D / 2]}>
        <boxGeometry args={[0.72, 0.06, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Нижний наличник */}
      <mesh position={[x, y - 0.33, D / 2]}>
        <boxGeometry args={[0.72, 0.06, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Левый */}
      <mesh position={[x - 0.33, y, D / 2]}>
        <boxGeometry args={[0.06, 0.72, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Правый */}
      <mesh position={[x + 0.33, y, D / 2]}>
        <boxGeometry args={[0.06, 0.72, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Горизонтальное перекрестие */}
      <mesh position={[x, y, D / 2]}>
        <boxGeometry args={[0.6, 0.04, 0.08]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Вертикальное перекрестие */}
      <mesh position={[x, y, D / 2]}>
        <boxGeometry args={[0.04, 0.6, 0.08]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
    </group>
  );
}

function Door({ doorRef }: { doorRef: React.RefObject<THREE.Group | null> }) {
  const trimColor = "#5a3018";
  const D = 2.4;
  const doorWidth = 0.7;
  const doorHeight = 1.4;

  return (
    <group position={[-doorWidth / 2, 0.9, D / 2 + 0.005]}>
      <group ref={doorRef}>
        <mesh position={[doorWidth / 2, 0, 0]}>
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshStandardMaterial color={trimColor} roughness={0.55} metalness={0.1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[doorWidth - 0.1, -0.05, 0.03]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial
            color="#ffd060"
            metalness={0.4}
            roughness={0.15}
            emissive="#5a3a00"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

function HouseInterior() {
  const woodColor = "#b89060";
  const darkWood = "#6a4020";

  return (
    <group>
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.36, 2.36]} />
        <meshStandardMaterial color={woodColor} roughness={0.85} />
      </mesh>

      <group position={[-0.75, 0.2, -0.5]}>
        {[[-0.22, -0.15], [0.22, -0.15], [-0.22, 0.15], [0.22, 0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.28, z]}>
            <boxGeometry args={[0.04, 0.56, 0.04]} />
            <meshStandardMaterial color={darkWood} roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[0.55, 0.06, 0.4]} />
          <meshStandardMaterial color={darkWood} roughness={0.7} />
        </mesh>
      </group>

      <group position={[-0.5, 0.2, 0.15]}>
        {[[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]}>
            <boxGeometry args={[0.04, 0.4, 0.04]} />
            <meshStandardMaterial color={darkWood} roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.34, 0.05, 0.34]} />
          <meshStandardMaterial color={darkWood} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.7, -0.15]}>
          <boxGeometry args={[0.34, 0.5, 0.04]} />
          <meshStandardMaterial color={darkWood} roughness={0.7} />
        </mesh>
      </group>

      <group position={[0.7, 0.2, -0.55]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.72, 0.2, 1.05]} />
          <meshStandardMaterial color="#4a2a15" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.66, 0.12, 0.98]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0.2]}>
          <boxGeometry args={[0.68, 0.06, 0.55]} />
          <meshStandardMaterial color="#6a3a7a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.32, -0.35]}>
          <boxGeometry args={[0.55, 0.08, 0.22]} />
          <meshStandardMaterial color="#f0e8d0" roughness={0.9} />
        </mesh>
      </group>

      <group position={[0, 2.05, 0]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.01, 0.25, 6]} />
          <meshBasicMaterial color="#1a1a20" />
        </mesh>
        <mesh position={[0, -0.17, 0]}>
          <coneGeometry args={[0.14, 0.15, 10, 1, true]} />
          <meshStandardMaterial color="#3a3a30" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshBasicMaterial color="#ffeeaa" />
        </mesh>
      </group>
    </group>
  );
}

function SideWall({ side }: { side: "left" | "right" }) {
  const woodTex = getTex("wood", createWoodTexture);
  const wallColor = "#e8c8a0";
  const trimColor = "#5a3018";
  const W = 2.4;
  const H = 2.0;
  const D = 2.4;

  const sign = side === "left" ? -1 : 1;
  const xPos = sign * (W / 2);
  const rotY = side === "left" ? Math.PI / 2 : -Math.PI / 2;

  const winW = 0.65;
  const winH = 0.55;
  const winCY = 0.1;

  const wallBottom = -H / 2;
  const wallTop = H / 2;
  const winLeft = -winW / 2;
  const winRight = winW / 2;
  const winBottom = winCY - winH / 2;
  const winTop = winCY + winH / 2;

  const mat = (
    <meshStandardMaterial map={woodTex} color={wallColor} roughness={0.65} metalness={0.05} side={THREE.DoubleSide} />
  );

  return (
    <group position={[xPos, H / 2 + 0.2, 0]} rotation={[0, rotY, 0]}>
      <mesh position={[0, (wallBottom + winBottom) / 2, 0]}>
        <planeGeometry args={[D, winBottom - wallBottom]} />
        {mat}
      </mesh>
      <mesh position={[0, (winTop + wallTop) / 2, 0]}>
        <planeGeometry args={[D, wallTop - winTop]} />
        {mat}
      </mesh>
      <mesh position={[-D / 2 + (winLeft + D / 2) / 2, winCY, 0]}>
        <planeGeometry args={[winLeft - (-D / 2), winH]} />
        {mat}
      </mesh>
      <mesh position={[(winRight + D / 2) / 2, winCY, 0]}>
        <planeGeometry args={[D / 2 - winRight, winH]} />
        {mat}
      </mesh>

      {/* Стекло по центру стены, видно с двух сторон */}
      <mesh position={[0, winCY, 0]}>
        <planeGeometry args={[winW - 0.01, winH - 0.01]} />
        <meshBasicMaterial color="#ffcc70" side={THREE.DoubleSide} />
      </mesh>

      {/* Рамы по центру — торчат в обе стороны */}
      <mesh position={[0, winCY + winH / 2 + 0.04, 0]}>
        <boxGeometry args={[winW + 0.14, 0.06, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, winCY - winH / 2 - 0.04, 0]}>
        <boxGeometry args={[winW + 0.14, 0.06, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[-winW / 2 - 0.04, winCY, 0]}>
        <boxGeometry args={[0.06, winH + 0.14, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[winW / 2 + 0.04, winCY, 0]}>
        <boxGeometry args={[0.06, winH + 0.14, 0.1]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Перекрестия по центру */}
      <mesh position={[0, winCY, 0]}>
        <boxGeometry args={[winW + 0.08, 0.04, 0.08]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, winCY, 0]}>
        <boxGeometry args={[0.04, winH + 0.08, 0.08]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
    </group>
  );
}

function WallPart({
  x,
  y,
  w,
  h,
  W,
  H,
  material,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  W: number;
  H: number;
  material: ReactElement;
}) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h);
    const uL = (x - w / 2 + W / 2) / W;
    const uR = (x + w / 2 + W / 2) / W;
    const vB = (y - h / 2 + H / 2) / H;
    const vT = (y + h / 2 + H / 2) / H;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    uv.setXY(0, uL, vT);
    uv.setXY(1, uR, vT);
    uv.setXY(2, uL, vB);
    uv.setXY(3, uR, vB);
    uv.needsUpdate = true;
    return g;
  }, [x, y, w, h, W, H]);

  return (
    <mesh position={[x, y, 0]} geometry={geo}>
      {material}
    </mesh>
  );
}

function House({ introStartRef }: { introStartRef: React.RefObject<number | null> }) {
  const woodTex = getTex("wood", createWoodTexture);
  const roofTex = getTex("roof", createRoofTexture);
  const chimneyTex = getTex("chimney", createChimneyTexture);
  const doorRef = useRef<THREE.Group>(null);
  const interiorRef = useRef<THREE.Group>(null);

  const W = 2.4;
  const H = 2.0;
  const D = 2.4;
  const ROOF_H = 1.2;
  const doorW = 0.7;
  const doorH = 1.4;
  const winW = 0.6;
  const winH = 0.6;
  const winY = 0.15;
  const winX = 0.75;

  const wallColor = "#e8c8a0";
  const trimColor = "#5a3018";

  const roofSlope = Math.sqrt((W / 2) * (W / 2) + ROOF_H * ROOF_H);
  const roofAngle = Math.atan2(W / 2, ROOF_H);

  const wallMat = (
    <meshStandardMaterial map={woodTex} color={wallColor} roughness={0.65} metalness={0.05} side={THREE.DoubleSide} />
  );

  useFrame(() => {
    if (doorRef.current && introStartRef.current != null) {
      const elapsed = (performance.now() - introStartRef.current) / 1000;
      let open = 0;
      const oStart = 3.0 * INTRO_SLOW;
      const oEnd = 4.0 * INTRO_SLOW;
      const cStart = 6.5 * INTRO_SLOW;
      const cEnd = 7.5 * INTRO_SLOW;

      if (elapsed >= oStart && elapsed < oEnd) {
        open = (elapsed - oStart) / (oEnd - oStart);
      } else if (elapsed >= oEnd && elapsed < cStart) {
        open = 1;
      } else if (elapsed >= cStart && elapsed < cEnd) {
        open = 1 - (elapsed - cStart) / (cEnd - cStart);
      } else {
        open = 0;
      }
      doorRef.current.rotation.y = open * Math.PI / 2;
    }

    if (interiorRef.current && introStartRef.current != null) {
      const elapsed = (performance.now() - introStartRef.current) / 1000;
      interiorRef.current.visible = elapsed < 9.0 * INTRO_SLOW;
    }
  });

  const wallBottom = -H / 2;
  const wallTop = H / 2;
  const doorBottom = wallBottom;
  const doorTop = doorBottom + doorH;
  const winLeftX = -winX - winW / 2;
  const winRightX = -winX + winW / 2;
  const win2LeftX = winX - winW / 2;
  const win2RightX = winX + winW / 2;
  const winBottom = winY - winH / 2;
  const winTop = winY + winH / 2;
  const doorLeftX = -doorW / 2;
  const doorRightX = doorW / 2;

  return (
    <group position={[0, -1.5, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[W + 0.4, 0.2, D + 0.4]} />
        <meshStandardMaterial color="#5a5a60" roughness={0.8} metalness={0.1} />
      </mesh>

      <mesh position={[0, H / 2 + 0.2, -D / 2]}>
        <planeGeometry args={[W, H]} />
        {wallMat}
      </mesh>

      <SideWall side="left" />
      <SideWall side="right" />

      <group position={[0, H / 2 + 0.2, D / 2]}>
        <WallPart x={(-W / 2 + winLeftX) / 2} y={0} w={winLeftX - (-W / 2)} h={H} W={W} H={H} material={wallMat} />
        <WallPart x={(winRightX + doorLeftX) / 2} y={0} w={doorLeftX - winRightX} h={H} W={W} H={H} material={wallMat} />
        <WallPart x={(doorRightX + win2LeftX) / 2} y={0} w={win2LeftX - doorRightX} h={H} W={W} H={H} material={wallMat} />
        <WallPart x={(win2RightX + W / 2) / 2} y={0} w={W / 2 - win2RightX} h={H} W={W} H={H} material={wallMat} />
        <WallPart x={winLeftX + winW / 2} y={(wallBottom + winBottom) / 2} w={winW} h={winBottom - wallBottom} W={W} H={H} material={wallMat} />
        <WallPart x={win2LeftX + winW / 2} y={(wallBottom + winBottom) / 2} w={winW} h={winBottom - wallBottom} W={W} H={H} material={wallMat} />
        <WallPart x={winLeftX + winW / 2} y={(winTop + wallTop) / 2} w={winW} h={wallTop - winTop} W={W} H={H} material={wallMat} />
        <WallPart x={win2LeftX + winW / 2} y={(winTop + wallTop) / 2} w={winW} h={wallTop - winTop} W={W} H={H} material={wallMat} />
        <WallPart x={0} y={(doorTop + wallTop) / 2} w={doorW} h={wallTop - doorTop} W={W} H={H} material={wallMat} />
      </group>

      <mesh position={[0, H + 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      <group ref={interiorRef}>
        <HouseInterior />
      </group>

      <mesh position={[0, H + 0.2, D / 2]}>
        <GableTriangle width={W} height={ROOF_H} wallW={W} wallH={H} />
        {wallMat}
      </mesh>
      <mesh position={[0, H + 0.2, -D / 2]} rotation={[0, Math.PI, 0]}>
        <GableTriangle width={W} height={ROOF_H} wallW={W} wallH={H} />
        {wallMat}
      </mesh>

      {/* Круглое окно в фронтоне — по центру стены, рама наружу/внутрь */}
      <mesh position={[0, H + 0.2 + ROOF_H * 0.45, D / 2]}>
        <circleGeometry args={[0.24, 16]} />
        <meshBasicMaterial color="#ffcc70" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, H + 0.2 + ROOF_H * 0.45, D / 2]}>
        <ringGeometry args={[0.24, 0.31, 16]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-W / 4, H + 0.2 + ROOF_H / 2, 0]} rotation={[0, 0, roofAngle]}>
        <boxGeometry args={[roofSlope + 0.1, 0.08, D + 0.3]} />
        <meshStandardMaterial map={roofTex} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[W / 4, H + 0.2 + ROOF_H / 2, 0]} rotation={[0, 0, -roofAngle]}>
        <boxGeometry args={[roofSlope + 0.1, 0.08, D + 0.3]} />
        <meshStandardMaterial map={roofTex} roughness={0.55} metalness={0.15} />
      </mesh>

      <mesh position={[0, H + 0.2 + ROOF_H, 0]}>
        <boxGeometry args={[0.2, 0.12, D + 0.35]} />
        <meshStandardMaterial color="#5a2010" roughness={0.55} metalness={0.15} />
      </mesh>

      <mesh position={[0.6, H + 0.2 + ROOF_H * 0.7, -0.3]}>
        <boxGeometry args={[0.32, 0.9, 0.32]} />
        <meshStandardMaterial map={chimneyTex} roughness={0.9} metalness={0.05} />
      </mesh>
      <Smoke x={0.6} y={H + 0.2 + ROOF_H * 0.7 + 0.5} z={-0.3} />

      <Door doorRef={doorRef} />
      <FrontWindow x={-winX} />
      <FrontWindow x={winX} />

      <pointLight position={[0, 1.2, 0]} intensity={2} distance={5} color="#ffcc70" />

      <mesh position={[0, 0.18, D / 2 + 0.35]}>
        <boxGeometry args={[1.2, 0.15, 0.6]} />
        <meshStandardMaterial color="#7a7a80" roughness={0.7} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.05, D / 2 + 0.65]}>
        <boxGeometry args={[1.2, 0.15, 0.4]} />
        <meshStandardMaterial color="#6a6a70" roughness={0.7} metalness={0.15} />
      </mesh>

      <mesh position={[0, 2.05, D / 2 + 0.35]} rotation={[Math.PI / 8, 0, 0]}>
        <boxGeometry args={[1.3, 0.06, 0.6]} />
        <meshStandardMaterial color="#6a2a15" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[-0.55, 1.55, D / 2 + 0.55]}>
        <boxGeometry args={[0.06, 1, 0.06]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0.55, 1.55, D / 2 + 0.55]}>
        <boxGeometry args={[0.06, 1, 0.06]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.15} />
      </mesh>

      <WelcomeSign />
    </group>
  );
}

type Crate = {
  pos: [number, number, number];
  size: number;
  rotY?: number;
};

const CRATES: Crate[] = [
  { pos: [4, 0, 2], size: 0.9, rotY: 0.3 },
  { pos: [-4, 0, 1], size: 1.1, rotY: -0.2 },
  { pos: [3.5, 0, -3], size: 0.8, rotY: 0.5 },
  { pos: [-3, 0, -3], size: 1.0, rotY: 0.1 },
  { pos: [5, 0, -1], size: 0.7, rotY: -0.4 },
  { pos: [-5, 0, -1], size: 0.85, rotY: 0.6 },
  { pos: [8, 0, 6], size: 1.0, rotY: 0.2 },
  { pos: [10, 0, 9], size: 0.9, rotY: -0.3 },
  { pos: [12, 0, 4], size: 0.8, rotY: 0.7 },
  { pos: [-12, 0, 3], size: 1.1, rotY: 0.4 },
  { pos: [10, 0, -10], size: 0.85, rotY: -0.5 },
  { pos: [12, 0, -6], size: 0.95, rotY: 0.3 },
  { pos: [-10, 0, -11], size: 1.0, rotY: -0.2 },
  { pos: [-12, 0, -5], size: 0.8, rotY: 0.5 },
  { pos: [7, 0, -8], size: 0.9, rotY: 0.1 },
  { pos: [13, 0, 13], size: 0.8, rotY: 0.2 },
  { pos: [-13, 0, -13], size: 0.75, rotY: -0.3 },
  { pos: [13, 0, -13], size: 0.85, rotY: 0.4 },
  { pos: [-13, 0, 13], size: 0.7, rotY: -0.2 },
  { pos: [3, 0, 8], size: 0.75, rotY: 0.5 },
  { pos: [-6, 0, 7], size: 0.85, rotY: -0.4 },
  { pos: [6, 0, 7], size: 0.7, rotY: 0.3 },
  { pos: [-7, 0, -8], size: 0.9, rotY: 0.2 },
];

function TexturedCrate({ crate }: { crate: Crate }) {
  const { pos, size, rotY = 0 } = crate;
  const crateTex = getTex("crate", createCrateTexture);

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, size / 2 - 1.5, 0]}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial map={crateTex} roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Crates() {
  return (
    <>
      {CRATES.map((crate, i) => (
        <TexturedCrate key={i} crate={crate} />
      ))}
    </>
  );
}

const INTRO_DRONE_START = 12.0 * INTRO_SLOW;
const ORBIT_PERIOD = 20;
const DRONE_PHASE_OFFSET = Math.PI - (INTRO_DRONE_START / ORBIT_PERIOD) * Math.PI * 2;

function Drone({ introStartRef }: { introStartRef: React.RefObject<number | null> }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.Mesh>(null);
  const propRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    let sinceIntro: number;
    if (introStartRef.current != null) {
      sinceIntro = (performance.now() - introStartRef.current) / 1000;
    } else {
      sinceIntro = performance.now() / 1000;
    }

    const droneAngle = (sinceIntro / ORBIT_PERIOD) * Math.PI * 2 + DRONE_PHASE_OFFSET;
    const radius = 8.5 + Math.sin(droneAngle * 2) * 2.5;
    const height = 4.25 + Math.sin(sinceIntro * 1.3) * 0.3 + Math.sin(sinceIntro * 0.7) * 0.15;

    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(droneAngle) * radius,
        height,
        Math.sin(droneAngle) * radius
      );
      groupRef.current.updateMatrixWorld();
    }

    if (innerRef.current) {
      innerRef.current.rotation.set(0, 0, 0);
      innerRef.current.lookAt(camera.position);
      innerRef.current.rotateY(Math.PI);

      const pitchSwing = Math.sin(sinceIntro * 1.8) * 0.25;
      innerRef.current.rotateX(pitchSwing);

      const rollSwing = Math.sin(sinceIntro * 1.3 + 0.5) * 0.12;
      innerRef.current.rotateZ(rollSwing);
    }

    propRefs.current.forEach((prop, i) => {
      if (prop) {
        const dir = i % 2 === 0 ? 1 : -1;
        prop.rotation.y = sinceIntro * 60 * dir + i * 1.5;
      }
    });

    if (ledRef.current) {
      const blink = Math.sin(sinceIntro * 6) > 0.5 ? 1 : 0;
      ledRef.current.visible = blink === 1;
      const mat = ledRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.5 + Math.abs(Math.sin(sinceIntro * 6)) * 0.5;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        <mesh>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.35, 0.05, 0.35]} />
          <meshStandardMaterial color="#e0e0e8" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.12, 0.15]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#1a1a20" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.16, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 10]} />
          <meshStandardMaterial color="#4ade80" metalness={0.5} roughness={0.2} />
        </mesh>

        {[
          [-0.35, -0.35],
          [0.35, -0.35],
          [-0.35, 0.35],
          [0.35, 0.35],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[-x / 2, 0, -z / 2]} rotation={[0, Math.atan2(x, z), 0]}>
              <boxGeometry args={[0.06, 0.04, Math.sqrt(x * x + z * z)]} />
              <meshStandardMaterial color="#1a1a20" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.08, 8]} />
              <meshStandardMaterial color="#3a3a42" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <circleGeometry args={[0.28, 16]} />
              <meshBasicMaterial color="#c0c8d0" transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>
            <group ref={(el) => { propRefs.current[i] = el; }} position={[0, 0.1, 0]}>
              <mesh>
                <boxGeometry args={[0.5, 0.01, 0.04]} />
                <meshStandardMaterial color="#2a2a30" metalness={0.4} roughness={0.4} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[0.5, 0.01, 0.04]} />
                <meshStandardMaterial color="#2a2a30" metalness={0.4} roughness={0.4} />
              </mesh>
            </group>
          </group>
        ))}

        <mesh ref={ledRef} position={[0, 0.12, -0.15]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshBasicMaterial color="#ff2020" transparent opacity={1} />
        </mesh>
        <mesh position={[0, 0.12, 0.15]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshBasicMaterial color="#30ff60" />
        </mesh>
      </group>
    </group>
  );
}

function CinematicCamera({
  introStartRef,
  swayEnabled,
}: {
  introStartRef: React.RefObject<number | null>;
  swayEnabled: boolean;
}) {
  const { camera, gl } = useThree();
  const swayTarget = useRef({ x: 0, y: 0 });
  const swayCurrent = useRef({ x: 0, y: 0 });
  const swayActive = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!swayEnabled) return;

    const dom = gl.domElement;
    const MAX_ANGLE = 0.12;
    let lockAxis: "x" | "y" | null = null;

    const onDown = (e: PointerEvent) => {
      swayActive.current = true;
      lockAxis = null;
      touchStart.current = { x: e.clientX, y: e.clientY };
      swayTarget.current.x = 0;
      swayTarget.current.y = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!swayActive.current) return;
      const dx = e.clientX - touchStart.current.x;
      const dy = e.clientY - touchStart.current.y;

      if (lockAxis === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        lockAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }

      if (lockAxis === null) return;

      const rect = dom.getBoundingClientRect();

      if (lockAxis === "x") {
        const nx = dx / (rect.width * 0.3);
        swayTarget.current.x = Math.max(-1, Math.min(1, nx)) * MAX_ANGLE;
        swayTarget.current.y = 0;
      } else {
        const ny = dy / (rect.height * 0.3);
        swayTarget.current.y = Math.max(-1, Math.min(1, ny)) * MAX_ANGLE;
        swayTarget.current.x = 0;
      }
    };

    const onUp = () => {
      swayActive.current = false;
      lockAxis = null;
      swayTarget.current.x = 0;
      swayTarget.current.y = 0;
    };

    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, swayEnabled]);

  useFrame(() => {
    if (introStartRef.current == null) {
      camera.position.set(8.5, 3.5, 0);
      camera.lookAt(0, 1.5, 1.5);
      return;
    }

    const elapsed = (performance.now() - introStartRef.current) / 1000;
    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    const T_A = 2.5 * INTRO_SLOW;
    const T_B = 5.0 * INTRO_SLOW;
    const T_C = 9.0 * INTRO_SLOW;
    const T_D = 12.0 * INTRO_SLOW;

    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    const targetFov = elapsed < T_B ? 27.5 : 55;
    if (perspectiveCamera.fov !== targetFov) {
      perspectiveCamera.fov = targetFov;
      perspectiveCamera.updateProjectionMatrix();
    }

    if (elapsed < T_A) {
      camera.position.set(0, -0.34, 0.3);
      camera.lookAt(0, -0.34, -2.7);
      return;
    }

    if (elapsed < T_B) {
      const t = (elapsed - T_A) / (T_B - T_A);
      const yaw = smoothstep(Math.max(0, Math.min(1, t))) * Math.PI;

      camera.position.set(0, -0.34, 0.3);

      const dx = Math.sin(yaw) * 3;
      const dz = -Math.cos(yaw) * 3;

      camera.lookAt(
        camera.position.x + dx,
        -0.34,
        camera.position.z + dz
      );
      return;
    }

    if (elapsed < T_C) {
      const t = (elapsed - T_B) / (T_C - T_B);
      const et = smoothstep(Math.max(0, Math.min(1, t)));

      const px = 0;
      const py = -0.34;
      const pz = 0.3 + et * 5.2;

      camera.position.set(px, py, pz);

      const yaw = et * Math.PI;
      const dx = Math.sin(yaw) * 3;
      const dz = Math.cos(yaw) * 3;

      camera.lookAt(px + dx, py, pz + dz);
      return;
    }

    if (elapsed < T_D) {
      const t = (elapsed - T_C) / (T_D - T_C);
      const et = smoothstep(Math.max(0, Math.min(1, t)));

      camera.position.set(
        0 + (8.5 - 0) * et,
        -0.34 + (3.5 - (-0.34)) * et,
        5.5 + (0 - 5.5) * et
      );

      const lookY = -0.34 + (1.5 - (-0.34)) * et;
      const lookZ = 2.5 + (1.5 - 2.5) * et;
      camera.lookAt(0, lookY, lookZ);
      return;
    }

    const t = (elapsed - T_D) / ORBIT_PERIOD;
    const angle = t * Math.PI * 2;
    const radius = 8.5 + Math.sin(angle * 2) * 2.5;
    const height = 3.5 + Math.sin(angle * 3) * 1.5;

    camera.position.x = Math.cos(angle) * radius;
    camera.position.z = Math.sin(angle) * radius;
    camera.position.y = height;

    const lookX = Math.sin(angle * 1) * 1.5;
    const lookZ = Math.cos(angle * 1) * 1.5;
    camera.lookAt(lookX, 1.5, lookZ);

    if (swayEnabled) {
      swayCurrent.current.x += (swayTarget.current.x - swayCurrent.current.x) * 0.08;
      swayCurrent.current.y += (swayTarget.current.y - swayCurrent.current.y) * 0.08;

      const qY = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        swayCurrent.current.x
      );
      const qX = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        swayCurrent.current.y
      );
      const q = new THREE.Quaternion().multiplyQuaternions(qY, qX);
      camera.quaternion.multiply(q);
    }
  });

  return null;
}

function FpsMeter({ textRef }: { textRef: { current: HTMLDivElement | null } }) {
  const last = useRef(performance.now());
  const frameTimes = useRef<number[]>([]);
  const prevFrame = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const ft = now - prevFrame.current;
    prevFrame.current = now;
    frameTimes.current.push(ft);
    if (frameTimes.current.length > 120) frameTimes.current.shift();

    if (now - last.current >= 500) {
      const times = frameTimes.current;
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const fps = Math.round(1000 / avg);
      const max = Math.max(...times);
      if (textRef.current) {
        textRef.current.textContent = `${fps} FPS · ${avg.toFixed(1)}ms · макс ${max.toFixed(0)}`;
      }
      last.current = now;
    }
  });

  return null;
}

function Scene() {
  const fpsRef = useRef<HTMLDivElement>(null);
  const introStartRef = useRef<number | null>(performance.now());
  const [showHud, setShowHud] = useState(false);
  const [swayEnabled, setSwayEnabled] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowHud(true), 12500 * INTRO_SLOW);
    const t2 = setTimeout(() => setSwayEnabled(true), 12200 * INTRO_SLOW);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleExit = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.close) tg.close();
  };

  return (
    <>
      <div style={{
        position: "absolute", top: 12, left: 0, right: 0,
        textAlign: "center", color: "#fff", zIndex: 10,
        fontFamily: "system-ui", fontSize: 14, fontWeight: 600,
        letterSpacing: 1, textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        pointerEvents: "none",
        opacity: showHud ? 1 : 0,
        transition: "opacity 1s ease",
      }}>
        PMH — тест FPS
      </div>

      <div
        ref={fpsRef}
        style={{
          position: "absolute", bottom: 12, right: 12,
          color: "#4ade80",
          zIndex: 10, fontFamily: "monospace", fontSize: 11,
          background: "rgba(0,0,0,0.55)", padding: "3px 8px",
          borderRadius: 4, pointerEvents: "none",
          opacity: showHud ? 1 : 0,
          transition: "opacity 1s ease",
        }}
      >
        — FPS
      </div>

      <button
        onClick={handleExit}
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          zIndex: 10,
          padding: "6px 16px",
          fontSize: 12,
          fontFamily: "system-ui",
          fontWeight: 600,
          letterSpacing: 0.5,
          color: "#fff",
          background: "rgba(0, 0, 0, 0.55)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: 8,
          cursor: "pointer",
          opacity: showHud ? 1 : 0,
          transition: "opacity 1s ease, background 0.15s ease",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
          touchAction: "manipulation",
        }}
      >
        Выход
      </button>

      <Canvas
        camera={{ position: [0, -0.34, 0.3], fov: 27.5 }}
        dpr={[0.8, 1]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <color attach="background" args={["#2a3346"]} />
        <fog attach="fog" args={["#2a3346", 22, 50]} />

        <hemisphereLight args={["#ffffff", "#5a6480", 1.3]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <directionalLight position={[-5, 4, -5]} intensity={0.6} />

        <Room />
        <Crates />
        <House introStartRef={introStartRef} />
        <Drone introStartRef={introStartRef} />
        <CinematicCamera introStartRef={introStartRef} swayEnabled={swayEnabled} />
        <FpsMeter textRef={fpsRef} />
      </Canvas>
    </>
  );
}

export default function App() {
  const [platform, setPlatform] = useState<string>("");
  const [fadeDone, setFadeDone] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
      if (tg.setHeaderColor) tg.setHeaderColor("#2a3346");
      if (tg.setBackgroundColor) tg.setBackgroundColor("#2a3346");

      const p = tg.platform || "";
      setPlatform(p);
    }

    const timer = setTimeout(() => setFadeDone(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const isDesktop =
    platform === "tdesktop" ||
    platform === "macos" ||
    platform === "web" ||
    platform === "webk";

  if (isDesktop) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "#1a2030",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "system-ui", textAlign: "center",
        padding: 24, boxSizing: "border-box",
      }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Открой на телефоне
          </div>
          <div style={{ fontSize: 14, opacity: 0.6 }}>
            Это приложение работает только в Telegram на мобильном устройстве
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0,
      width: "100vw", height: "100vh",
      background: "#2a3346",
      overflow: "hidden",
      touchAction: "none",
    }}>
      <Scene />
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "#000000",
        opacity: fadeDone ? 0 : 1,
        transition: "opacity 3.4s ease-out",
        pointerEvents: "none",
        zIndex: 50,
      }} />
    </div>
  );
}