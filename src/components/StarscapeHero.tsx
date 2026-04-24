'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

const NEON = ['#00CCDD', '#EE00CC', '#8833FF', '#0099EE', '#FF2288', '#CC44AA', '#5500EE', '#00AAFF'];

interface Star {
  angle: number;
  pAngle: number;
  radius: number;
  pRadius: number;
  speed: number;
  twist: number;
  color: string;
}

function makeStar(): Star {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 0.02;
  return {
    angle,
    pAngle: angle,
    radius,
    pRadius: radius,
    speed: 0.003 + Math.random() * 0.007,
    twist: (Math.random() - 0.5) * 0.01,
    color: NEON[Math.floor(Math.random() * NEON.length)],
  };
}

export function StarscapeHero({ height = 320 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgSolid = isDark ? '#04020F' : '#FFFFFF';
  const bgFade  = isDark ? 'rgba(4, 2, 20, 0.20)' : 'rgba(255, 255, 255, 0.22)';
  const vignette = isDark
    ? 'radial-gradient(ellipse at center, transparent 30%, rgba(4,2,20,0.65) 100%)'
    : 'radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.5) 100%)';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = bgSolid;
      ctx.fillRect(0, 0, w, h);
    };
    resize();

    const NUM = 220;
    const stars: Star[] = Array.from({ length: NUM }, () => {
      const s = makeStar();
      s.radius = Math.random() * 0.9;
      s.pRadius = s.radius;
      return s;
    });

    let animId: number;

    const render = () => {
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy) * 1.15;

      ctx.fillStyle = bgFade;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.pAngle = s.angle;
        s.pRadius = s.radius;

        s.radius += s.speed * (0.4 + s.radius * 2.2);
        s.angle += s.twist;

        if (s.radius > 1.05) {
          Object.assign(s, makeStar());
          continue;
        }

        const sx = cx + Math.cos(s.angle) * s.radius * maxR;
        const sy = cy + Math.sin(s.angle) * s.radius * maxR * 0.65;
        const px = cx + Math.cos(s.pAngle) * s.pRadius * maxR;
        const py = cy + Math.sin(s.pAngle) * s.pRadius * maxR * 0.65;

        const size = 0.4 + s.radius * 2.8;
        const alpha = Math.min(1, s.radius * 2.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = size;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = size * 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]); // re-init canvas when theme changes

  return (
    <div style={{ position: 'relative', height, overflow: 'hidden', background: bgSolid }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: vignette,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        background: 'linear-gradient(to bottom, transparent, var(--bg))',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
