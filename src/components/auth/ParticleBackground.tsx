import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

interface BurstWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse & Touch tracking
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120, // Interaction radius
      active: false,
    };

    // Color palette: soft blue, violet, cyan, and glowing white
    const colors = [
      'rgba(99, 102, 241, ', // Indigo
      'rgba(59, 130, 246, ', // Blue
      'rgba(147, 51, 234, ', // Violet
      'rgba(6, 182, 212, ',  // Cyan
      'rgba(255, 255, 255, ', // White glow
    ];

    // Determine particle count (lighter on mobile for battery and smoothness)
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 45 : 100;

    const particles: Particle[] = [];
    const bursts: BurstWave[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const baseAlpha = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
      const speed = prefersReducedMotion ? 0.1 : Math.random() * 0.6 + 0.2;

      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2.2 + 1.2,
        color,
        alpha: baseAlpha,
        baseAlpha,
      });
    }

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    // Click / Tap burst reaction
    const handleClick = (e: MouseEvent) => {
      bursts.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 160,
        alpha: 0.8,
        speed: 4.5,
      });

      // Scatter nearby particles with burst force
      for (const p of particles) {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 4;
          p.vy += (dy / dist) * force * 4;
        }
      }
    };

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        bursts.push({
          x: touch.clientX,
          y: touch.clientY,
          radius: 0,
          maxRadius: 130,
          alpha: 0.7,
          speed: 4,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update click burst ripples
      for (let b = bursts.length - 1; b >= 0; b--) {
        const wave = bursts[b];
        wave.radius += wave.speed;
        wave.alpha *= 0.94;

        ctx.save();
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(167, 139, 250, ${wave.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        if (wave.radius > wave.maxRadius || wave.alpha < 0.02) {
          bursts.splice(b, 1);
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Natural smooth floating
        p.x += p.vx;
        p.y += p.vy;

        // Bounce gently at canvas boundaries
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Mouse repelling physics
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            // Push particle smoothly outward
            p.x += Math.cos(angle) * force * 3.5;
            p.y += Math.sin(angle) * force * 3.5;
            p.alpha = Math.min(1, p.baseAlpha + force * 0.4);
          } else {
            // Gradually restore natural alpha
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        // Dampen excess velocity back to drift speed
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Draw particle with subtle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(129, 140, 248, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw fine connecting lines between nearby particles
        const maxConnectDist = isMobile ? 80 : 110;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distDx = p.x - p2.x;
          const distDy = p.y - p2.y;
          const dist = Math.sqrt(distDx * distDx + distDy * distDy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(165, 180, 252, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Rich full-screen ambient gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 opacity-95"></div>
      
      {/* Decorative ambient glowing orbs in corners */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>

      {/* Canvas for interactive particle network */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />
    </div>
  );
};
