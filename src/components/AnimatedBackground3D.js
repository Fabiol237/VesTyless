'use client';
import { useEffect, useRef } from 'react';

export default function ArchitecturalBackground3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // ===== WHATSAPP BACKGROUND GRADIENT =====
    const updateGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f0f0f0');
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // ===== CHAT BUBBLES (WhatsApp style) =====
    const chatBubbles = [];
    for (let i = 0; i < 20; i++) {
      chatBubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 50 + Math.random() * 150,
        height: 25 + Math.random() * 50,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        isUser: Math.random() > 0.5,
        opacity: 0.06 + Math.random() * 0.08,
      });
    }

    // ===== DRAW CHAT BUBBLE =====
    const drawChatBubble = (bubble) => {
      ctx.globalAlpha = bubble.opacity;

      // Bubble background
      const radius = 10;
      ctx.fillStyle = bubble.isUser ? '#25D366' : '#e5e5ea';

      // Round rectangle
      ctx.beginPath();
      ctx.moveTo(bubble.x + radius, bubble.y);
      ctx.lineTo(bubble.x + bubble.width - radius, bubble.y);
      ctx.quadraticCurveTo(bubble.x + bubble.width, bubble.y, bubble.x + bubble.width, bubble.y + radius);
      ctx.lineTo(bubble.x + bubble.width, bubble.y + bubble.height - radius);
      ctx.quadraticCurveTo(bubble.x + bubble.width, bubble.y + bubble.height, bubble.x + bubble.width - radius, bubble.y + bubble.height);
      ctx.lineTo(bubble.x + radius, bubble.y + bubble.height);
      ctx.quadraticCurveTo(bubble.x, bubble.y + bubble.height, bubble.x, bubble.y + bubble.height - radius);
      ctx.lineTo(bubble.x, bubble.y + radius);
      ctx.quadraticCurveTo(bubble.x, bubble.y, bubble.x + radius, bubble.y);
      ctx.closePath();
      ctx.fill();

      // Subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Small tail
      ctx.beginPath();
      if (bubble.isUser) {
        ctx.moveTo(bubble.x + bubble.width - 5, bubble.y + bubble.height);
        ctx.lineTo(bubble.x + bubble.width + 5, bubble.y + bubble.height + 5);
        ctx.lineTo(bubble.x + bubble.width, bubble.y + bubble.height);
      } else {
        ctx.moveTo(bubble.x + 5, bubble.y + bubble.height);
        ctx.lineTo(bubble.x - 5, bubble.y + bubble.height + 5);
        ctx.lineTo(bubble.x, bubble.y + bubble.height);
      }
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
    };

    // ===== ANIMATION LOOP =====
    let animationId;
    const animate = () => {
      updateGradient();

      // Update and draw chat bubbles
      chatBubbles.forEach((bubble) => {
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // Wrap around
        if (bubble.x > canvas.width + 200) bubble.x = -200;
        if (bubble.x < -200) bubble.x = canvas.width + 200;
        if (bubble.y > canvas.height + 100) bubble.y = -100;
        if (bubble.y < -100) bubble.y = canvas.height + 100;

        drawChatBubble(bubble);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // ===== RESPONSIVE =====
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // ===== CLEANUP =====
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 top-0 left-0 w-full h-screen z-0"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    />
  );
}
