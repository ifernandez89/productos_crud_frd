"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Candidate URLs to support local dev, GitHub Pages (/productos_crud_frd) and custom domains
const CANDIDATE_URLS = Array.from(
  new Set([
    `${BASE_PATH}/models/jarbee/jarbee_robot.glb`,
    "/productos_crud_frd/models/jarbee/jarbee_robot.glb",
    "/models/jarbee/jarbee_robot.glb",
    "./models/jarbee/jarbee_robot.glb",
    "models/jarbee/jarbee_robot.glb",
  ].filter(Boolean))
);

let cachedGltfPromise: Promise<GLTF> | null = null;

function loadJarBeeRobotModel(): Promise<GLTF> {
  if (!cachedGltfPromise) {
    const loader = new GLTFLoader();

    cachedGltfPromise = new Promise((resolve, reject) => {
      let candidateIndex = 0;

      const tryLoad = () => {
        if (candidateIndex >= CANDIDATE_URLS.length) {
          const errMsg = `Failed to load JarBee Robot 3D model from all candidate URLs: ${CANDIDATE_URLS.join(", ")}`;
          console.error(errMsg);
          reject(new Error(errMsg));
          return;
        }

        const currentUrl = CANDIDATE_URLS[candidateIndex];
        candidateIndex++;

        loader.load(
          currentUrl,
          (gltf) => {
            console.log(`[JarBee 3D] Loaded successfully from: ${currentUrl}`);
            resolve(gltf);
          },
          undefined,
          (err) => {
            console.warn(`[JarBee 3D] Could not load from "${currentUrl}", trying next candidate...`, err);
            tryLoad();
          }
        );
      };

      tryLoad();
    });
  }
  return cachedGltfPromise;
}

export interface JarBeeCyberAvatar3DProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  isSleeping?: boolean;
  gazeX?: number; // -1 to 1
  gazeY?: number; // -1 to 1
  interactive?: boolean;
  onClick?: () => void;
  showStatusGlow?: boolean;
  pixelDimension?: number;
}

const PIXEL_SIZES: Record<string, number> = {
  sm: 36,
  md: 48,
  lg: 96,
  xl: 140,
};

export function JarBeeCyberAvatar3D({
  size = "md",
  className = "",
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  isSleeping = false,
  gazeX = 0,
  gazeY = 0,
  interactive = true,
  onClick,
  showStatusGlow = true,
  pixelDimension,
}: JarBeeCyberAvatar3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSaluting, setIsSaluting] = useState(false);

  // References for Three.js instance
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const modelRootRef = useRef<THREE.Object3D | null>(null);
  const dynamicLightRef = useRef<THREE.PointLight | null>(null);
  const saluteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gazeXRef = useRef(gazeX);
  const gazeYRef = useRef(gazeY);
  const isSleepingRef = useRef(isSleeping);

  useEffect(() => {
    gazeXRef.current = gazeX;
    gazeYRef.current = gazeY;
    isSleepingRef.current = isSleeping;
  }, [gazeX, gazeY, isSleeping]);

  const dim = pixelDimension || PIXEL_SIZES[size] || 48;

  // Handle click / salute reaction
  const handleClick = useCallback(() => {
    if (!interactive) return;

    if (onClick) onClick();

    // Trigger dynamic take_off_and_land animation
    const saluteAction = actionsRef.current["take_off_and_land"];
    const hoverAction = actionsRef.current["hover"];

    if (saluteAction && hoverAction) {
      setIsSaluting(true);
      if (saluteTimeoutRef.current) clearTimeout(saluteTimeoutRef.current);

      saluteAction.reset();
      saluteAction.timeScale = 1.35;
      saluteAction.setLoop(THREE.LoopOnce, 1);
      saluteAction.clampWhenFinished = false;
      saluteAction.play();

      if (currentActionRef.current && currentActionRef.current !== saluteAction) {
        currentActionRef.current.crossFadeTo(saluteAction, 0.25, true);
      }
      currentActionRef.current = saluteAction;

      // Switch back to hover when clip ends (~3.5 seconds)
      saluteTimeoutRef.current = setTimeout(() => {
        setIsSaluting(false);
        if (hoverAction) {
          hoverAction.reset();
          hoverAction.play();
          saluteAction.crossFadeTo(hoverAction, 0.4, true);
          currentActionRef.current = hoverAction;
        }
      }, 3400);
    }
  }, [interactive, onClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let reqId: number | null = null;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup - Positioned slightly elevated front view
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 20);
    camera.position.set(0, 0.32, 1.82);
    camera.lookAt(0, 0.05, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(dim, dim);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting setup tailored for the Gunmetal + Amber + Cyan wings
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Key warm light (highlights amber chassis plates)
    const keyLight = new THREE.DirectionalLight(0xffeed6, 3.0);
    keyLight.position.set(2.2, 3.0, 2.5);
    scene.add(keyLight);

    // Fill cyan light (highlights solar hex wings and carbon legs)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.9);
    fillLight.position.set(-2.5, 1.8, 1.5);
    scene.add(fillLight);

    // Rim light (electric cyan from rear)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.4);
    rimLight.position.set(0, 2.2, -2.8);
    scene.add(rimLight);

    // Dynamic HUD visor glow light (emissive point light)
    const dynamicLight = new THREE.PointLight(0x00f0ff, 1.8, 4.0);
    dynamicLight.position.set(0, 0.18, 0.65);
    scene.add(dynamicLight);
    dynamicLightRef.current = dynamicLight;

    // 5. Load 3D model
    const clock = new THREE.Clock();

    loadJarBeeRobotModel()
      .then((gltf) => {
        if (isDisposed) return;

        // Clone using SkeletonUtils to ensure bones and skin weights are independent
        const model = SkeletonUtils.clone(gltf.scene);
        modelRootRef.current = model;

        // Ensure materials have correct roughness, metalness and double-sided wings
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              // Ensure transparent solar wings render crisply
              if (mat.transparent || (mat.name && mat.name.toLowerCase().includes("wing"))) {
                mat.transparent = true;
                mat.side = THREE.DoubleSide;
                mat.depthWrite = true;
              }
            }
          }
        });

        // Set initial orientation (head facing front)
        model.position.set(0, 0, 0);
        scene.add(model);

        // 6. Animation mixer
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        const actions: Record<string, THREE.AnimationAction> = {};
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip, model);
          actions[clip.name] = action;
        });
        actionsRef.current = actions;

        // Start default animation
        const initialClip = isSleepingRef.current ? "idle" : "hover";
        const startAction = actions[initialClip] || actions["hover"] || Object.values(actions)[0];
        if (startAction) {
          startAction.reset();
          startAction.play();
          currentActionRef.current = startAction;
        }

        setIsLoaded(true);
      })
      .catch((err) => {
        if (!isDisposed) {
          console.error("Failed to initialize JarBee 3D avatar:", err);
          setHasError(true);
        }
      });

    // 7. Render animation loop
    const render = () => {
      if (isDisposed) return;
      reqId = requestAnimationFrame(render);

      // Skip rendering if document is hidden to save GPU/CPU
      if (typeof document !== "undefined" && document.hidden) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Update animation mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Physics hover levitation & gaze tracking
      const model = modelRootRef.current;
      if (model) {
        // Natural gentle levitation floating
        if (!isSleepingRef.current) {
          const hoverWave = Math.sin(time * 3.0) * 0.022;
          model.position.y = hoverWave;
        } else {
          model.position.y = -0.04;
        }

        // Smooth gaze tracking towards user cursor
        const targetRotY = (gazeXRef.current || 0) * 0.42;
        const targetRotX = -(gazeYRef.current || 0) * 0.26;
        model.rotation.y += (targetRotY - model.rotation.y) * 0.08;
        model.rotation.x += (targetRotX - model.rotation.x) * 0.08;
      }

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(render);

    // 8. Cleanup on unmount
    return () => {
      isDisposed = true;
      if (reqId) cancelAnimationFrame(reqId);
      if (saluteTimeoutRef.current) clearTimeout(saluteTimeoutRef.current);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
      mixerRef.current = null;
      actionsRef.current = {};
      currentActionRef.current = null;
      modelRootRef.current = null;
    };
  }, [dim]);

  // Reactive state & animation synchronization
  useEffect(() => {
    if (!isLoaded || isSaluting) return;

    const actions = actionsRef.current;
    const hoverAction = actions["hover"];
    const idleAction = actions["idle"];

    if (isSleeping) {
      // Crossfade to idle sleep animation
      if (idleAction && currentActionRef.current !== idleAction) {
        idleAction.reset();
        idleAction.timeScale = 0.65;
        idleAction.play();
        if (currentActionRef.current) {
          currentActionRef.current.crossFadeTo(idleAction, 0.4, true);
        }
        currentActionRef.current = idleAction;
      }
    } else {
      // Crossfade to hover active flight
      if (hoverAction && currentActionRef.current !== hoverAction) {
        hoverAction.reset();
        hoverAction.play();
        if (currentActionRef.current) {
          currentActionRef.current.crossFadeTo(hoverAction, 0.35, true);
        }
        currentActionRef.current = hoverAction;
      }

      // Adjust hover flapping speed depending on cognitive activity
      if (hoverAction) {
        if (isSpeaking) {
          hoverAction.timeScale = 1.6; // Rapid energetic flapping
        } else if (isThinking) {
          hoverAction.timeScale = 1.35; // Processing mode
        } else if (isListening) {
          hoverAction.timeScale = 0.95; // Steady attentive pose
        } else {
          hoverAction.timeScale = 1.0;
        }
      }
    }

    // Dynamic light color and intensity matching cognitive state
    const light = dynamicLightRef.current;
    if (light) {
      if (isSleeping) {
        light.color.setHex(0x1e3a8a);
        light.intensity = 0.3;
      } else if (isListening) {
        light.color.setHex(0x0078d7);
        light.intensity = 2.8;
      } else if (isThinking) {
        light.color.setHex(0x00f0ff);
        light.intensity = 3.2;
      } else if (isSpeaking) {
        light.color.setHex(0xffb703);
        light.intensity = 3.6;
      } else {
        light.color.setHex(0x38bdf8);
        light.intensity = 1.8;
      }
    }
  }, [isLoaded, isSleeping, isSpeaking, isThinking, isListening, isSaluting]);

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none ${className} ${
        interactive ? "cursor-pointer active:scale-95 transition-transform" : ""
      }`}
      style={{ width: `${dim}px`, height: `${dim}px` }}
      title={
        isSleeping
          ? "JarBee en reposo (hacé click o mové el mouse para despertar)"
          : isListening
          ? "JarBee está escuchando..."
          : isThinking
          ? "JarBee está procesando..."
          : isSpeaking
          ? "JarBee está hablando"
          : "JarBee Cyber Drone 3D (hacé click para saludar)"
      }
    >
      {/* Background Status Glow */}
      {showStatusGlow && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 pointer-events-none ${
            isListening
              ? "bg-[#0078d7]/40 blur-md scale-125 animate-pulse"
              : isThinking
              ? "bg-[#00f0ff]/30 blur-md scale-120 animate-pulse"
              : isSpeaking
              ? "bg-[#f59e0b]/30 blur-md scale-115"
              : isSaluting
              ? "bg-[#10b981]/40 blur-lg scale-130"
              : isSleeping
              ? "bg-transparent"
              : "bg-[#0078d7]/15 blur-xs scale-105"
          }`}
        />
      )}

      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full relative z-10 transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ width: `${dim}px`, height: `${dim}px` }}
      />

      {/* Loading Skeleton / Fallback */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="h-6 w-6 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-amber-500">
          ⚠️ 3D
        </div>
      )}
    </div>
  );
}
