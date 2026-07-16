'use client';
import { useEffect, useRef } from 'react';

export default function InteractiveFluidBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to cover container
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles system for fluid simulation
    const particles = [];
    const maxParticles = 120;
    const mouse = { x: null, y: null, px: null, py: null, active: false };

    class FluidParticle {
      constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        // Add random slight dispersion
        this.vx = vx * 0.4 + (Math.random() - 0.5) * 0.5;
        this.vy = vy * 0.4 + (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 8 + 4;
        this.maxLife = Math.random() * 80 + 40;
        this.life = this.maxLife;
        // Alternate between neon green and teal gradients
        this.colorType = Math.random() > 0.4 ? 1 : 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        // Friction / drag
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.life--;
      }

      draw() {
        const ratio = this.life / this.maxLife;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // Circular gradient for glowing fluid look
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * (1 + (1 - ratio) * 2)
        );

        const alpha = ratio * 0.25;
        if (this.colorType === 1) {
          // Neon green glow
          grad.addColorStop(0, `rgba(37, 211, 102, ${alpha})`);
          grad.addColorStop(0.5, `rgba(18, 140, 126, ${alpha * 0.4})`);
          grad.addColorStop(1, 'rgba(10, 22, 40, 0)');
        } else {
          // Teal cyan glow
          grad.addColorStop(0, `rgba(18, 140, 126, ${alpha})`);
          grad.addColorStop(0.6, `rgba(37, 211, 102, ${alpha * 0.3})`);
          grad.addColorStop(1, 'rgba(10, 22, 40, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (1 + (1 - ratio) * 2), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = currentX - mouse.x;
        const dy = currentY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Only inject fluid forces if moving fast enough to prevent crowding
        if (dist > 2) {
          const numSpawn = Math.min(Math.floor(dist / 4) + 1, 4);
          for (let i = 0; i < numSpawn; i++) {
            if (particles.length < maxParticles) {
              // Interpolate spawn positions for smooth continuous lines
              const progress = i / numSpawn;
              const spawnX = mouse.x + dx * progress;
              const spawnY = mouse.y + dy * progress;
              particles.push(new FluidParticle(spawnX, spawnY, dx, dy));
            }
          }
        }
      }

      mouse.x = currentX;
      mouse.y = currentY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.active = false;
    };

    // Attach interaction events
    const parentElement = canvas.parentElement;
    if (parentElement) {
      parentElement.addEventListener('mousemove', handleMouseMove);
      parentElement.addEventListener('mouseleave', handleMouseLeave);
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ambient background slow particle drift when mouse is idle
      if (!mouse.active && Math.random() < 0.05 && particles.length < 30) {
        particles.push(
          new FluidParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 0.8
          )
        );
      }

      // Update and draw fluid elements
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (parentElement) {
        parentElement.removeEventListener('mousemove', handleMouseMove);
        parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
