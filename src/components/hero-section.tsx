"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { FlagTicker } from './flag-ticker';
import type { Country } from '@/lib/types';
import { useUser } from '@/hooks/use-user';
import Image from 'next/image';
import { ScannerModal } from './scanner-modal';


const words = [
    "High-Impact", "Powerful", "Influential", "Strong-effect", "High-performance",
    "Game-changing", "Results-driven", "Impactful", "High-value", "Effective",
    "Forceful", "Transformative", "Strategic-impact", "High-leverage", "Outcome-focused",
    "High-intensity", "Deep-impact", "High-force", "Meaningful", "Performance-boosting", "High-power"
];

const ShootingStar = ({ id }: { id: number }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const startLeft = Math.random() * 200 - 50 + '%'; 
    const delay = Math.random() * 8 + 's';
    const duration = Math.random() * 4 + 6 + 's'; 

    setStyle({
      left: startLeft,
      top: '-10%',
      animationDelay: delay,
      animationDuration: duration,
    });
  }, [id]);

  return (
    <div 
      className="absolute bg-white rounded-full opacity-0 shooting-star-line"
      style={style}
    >
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
    </div>
  );
};

const StaticStar = ({ id }: { id: number }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setStyle({
      position: 'absolute',
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      backgroundColor: 'white',
      borderRadius: '50%',
      opacity: Math.random() * 0.5 + 0.2,
    });
  }, [id]);

  return <div style={style} />;
};


interface HeroSectionProps {
  onRegionChange: (country: Country) => void;
}

const SolanaScannerIcon = () => (
    <div className="relative w-6 h-6">
        <Image src="https://cryptologos.cc/logos/solana-sol-logo.svg?v=040" alt="Solana" width={24} height={24} className="absolute inset-0" />
    </div>
);

const InteractiveBadge = ({ children }: { children: React.ReactNode }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(200px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = {
    maskImage,
    WebkitMaskImage: maskImage,
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="group relative inline-block border border-border bg-card/50 py-1.5 px-4 rounded-full text-xs font-semibold tracking-widest text-neutral-300 mb-6 uppercase backdrop-blur-sm"
    >
      <div className="absolute inset-0 z-10" style={style}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-primary/30 to-accent/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <span className="relative z-20">{children}</span>
    </div>
  );
};


export const HeroSection = ({ onRegionChange }: HeroSectionProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const { isLoggedIn } = useUser();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (!canvasRef.current || canvasRef.current.childElementCount > 0) return;

    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let earthGroup: THREE.Group;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      canvasRef.current.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.autoRotate = false;
      controls.minPolarAngle = Math.PI / 2;
      controls.maxPolarAngle = Math.PI / 2;


      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
      sunLight.position.set(5, 3, 5);
      scene.add(sunLight);

      earthGroup = new THREE.Group();
      scene.add(earthGroup);
      
      const loader = new THREE.TextureLoader();
      const geometry = new THREE.SphereGeometry(1.2, 64, 64);
      
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x000000,
        specular: 0x333333,
        shininess: 10,
        map: loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
        bumpMap: loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
        bumpScale: 0.05,
      });

      const earth = new THREE.Mesh(geometry, material);
      earthGroup.add(earth);

      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        if (width < 768) {
            earthGroup.position.x = 0;
            earthGroup.position.y = 0;
            earthGroup.scale.set(1, 1, 1);
        } else {
            earthGroup.position.x = 2.0;
            earthGroup.position.y = 0;
            earthGroup.scale.set(1, 1, 1);
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      const animate = () => {
        requestAnimationFrame(animate);
        if (earth) earth.rotation.y += 0.0015;
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (canvasRef.current && renderer.domElement.parentElement === canvasRef.current) {
            canvasRef.current.removeChild(renderer.domElement);
        }
      };
    } catch (error) {
      console.error("Three.js initialization error:", error);
    }
  }, []);

  return (
    <>
      <div className="relative min-h-screen flex flex-col md:justify-center overflow-hidden">
        <div className="absolute top-0 w-full z-20 h-16">
          {isLoggedIn && <FlagTicker onSelectCountry={onRegionChange} />}
        </div>
        
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 150 }).map((_, i) => (
                  <StaticStar key={`static-${i}`} id={i} />
              ))}
        </div>

        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
                  <ShootingStar key={i} id={i} />
              ))}
        </div>
        
        <div className="relative md:absolute inset-0 h-[60vh] md:h-full w-full z-10 flex items-center justify-center">
          <div ref={canvasRef} className="absolute inset-0" />
        </div>

        <div className="relative z-20 p-6 flex flex-col items-center md:items-start text-center md:text-left max-w-7xl mx-auto w-full mt-[-10vh] md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <InteractiveBadge>
                AI-Powered Web3 Content Engine
            </InteractiveBadge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 max-w-4xl"
          >
            Turn Trends Into <br />
            <span className="relative inline-block whitespace-nowrap">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[index]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, position: 'absolute' }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 text-neutral-400"
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
              <span className="opacity-0">{[...words].sort((a, b) => b.length - a.length)[0]}</span>
            </span>
            <br />
            Content. Instantly.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-lg border-l-2 border-primary pl-6 text-left mx-auto md:mx-0"
          >
            Your all-in-one engine that scans what’s trending right now and transforms it into ready-to-publish content.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center md:justify-start"
          >
            <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-lg shadow-primary/20">
              Generate Content Now
              <ArrowRight className="ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setScannerOpen(true)}
              className="h-14 px-8 text-base font-bold rounded-2xl border-transparent bg-black hover:bg-neutral-800 text-white group"
            >
              <SolanaScannerIcon />
              <span className="ml-2">Scanner</span>
            </Button>
          </motion.div>
        </div>
      </div>
      {isScannerOpen && <ScannerModal onClose={() => setScannerOpen(false)} />}
    </>
  );
};
