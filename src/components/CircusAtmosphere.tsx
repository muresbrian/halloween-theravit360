"use client";

import { useEffect, useRef } from "react";

export default function CircusAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Verificar si el usuario prefiere movimiento reducido
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Sistema de partículas de brasas (embers) y polvo espectral
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      life: number;
      maxLife: number;
      color: string;
      glow: number;
    }

    const particleCount = width < 768 ? 40 : 85;
    const particles: Particle[] = [];

    const colors = [
      "220, 38, 38",   // Rojo sangre circo
      "185, 28, 28",   // Carmesí oscuro
      "244, 235, 208", // Crema marfil
      "232, 213, 181", // Pergamino tostado
      "255, 255, 255", // Blanco puro
    ];

    function createParticle(): Particle {
      const isCream = Math.random() > 0.6;
      const color = isCream
        ? colors[Math.floor(Math.random() * 3) + 2]
        : colors[Math.floor(Math.random() * 2)];

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.4,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        life: Math.random() * 0.5,
        maxLife: Math.random() * 0.6 + 0.4,
        color,
        glow: Math.random() * 6 + 2,
      };
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life += 0.0025;

        // Calcular opacidad con curva sinusoidal suave
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.65;

        if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > width + 10) {
          particles[i] = createParticle();
          particles[i].y = height + 10;
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, alpha)})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = p.glow;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-70"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
