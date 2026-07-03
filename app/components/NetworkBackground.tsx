"use client";

import { useEffect, useRef } from "react";

/**
 * Animated futuristic background: a canvas "constellation" network of
 * drifting nodes that connect with glowing lines (and react to the mouse),
 * layered under flowing cyan/purple light-stream curves (SVG).
 * Vanilla canvas — no library. Sizes itself to its relative parent.
 */
export default function NetworkBackground({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    // Non-null aliases so hoisted closures below keep the narrowed types
    const canvas = canvasEl;
    const ctx = context;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const CYAN = "34,211,238";
    const PURPLE = "167,139,250";
    const CONNECT = 140; // node-to-node link distance
    const MOUSE_LINK = 190;

    let width = 0;
    let height = 0;
    let raf = 0;
    let nodes: { x: number; y: number; vx: number; vy: number; r: number; c: string }[] = [];
    const mouse = { x: -9999, y: -9999 };

    function initNodes() {
      const count = Math.min(80, Math.max(24, Math.floor((width * height) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (reduced ? 0 : 0.45),
        vy: (Math.random() - 0.5) * (reduced ? 0 : 0.45),
        r: Math.random() * 1.8 + 0.8,
        c: Math.random() > 0.5 ? CYAN : PURPLE,
      }));
    }

    function resize() {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // move
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECT) {
            const alpha = (1 - dist / CONNECT) * 0.45;
            ctx.strokeStyle = `rgba(${a.c},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // mouse link
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < MOUSE_LINK) {
          const alpha = (1 - mdist / MOUSE_LINK) * 0.6;
          ctx.strokeStyle = `rgba(${CYAN},${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // glowing nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.c},0.95)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${n.c},0.9)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function loop() {
      render();
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    if (reduced) render();
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  const streams = [
    "M-20 150 C 260 60, 500 250, 780 160 S 1120 110, 1260 190",
    "M-20 210 C 260 130, 520 310, 800 220 S 1140 170, 1260 250",
    "M-20 270 C 280 200, 540 370, 820 280 S 1160 230, 1260 310",
    "M-20 330 C 300 270, 560 430, 840 340 S 1180 290, 1260 370",
    "M-20 110 C 240 40, 480 190, 760 120 S 1100 80, 1260 150",
    "M-20 390 C 300 330, 560 470, 860 400 S 1180 350, 1260 420",
  ];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1240 520"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        {streams.map((d, i) => (
          <g key={i}>
            {/* faint static wire */}
            <path d={d} stroke="url(#streamGrad)" strokeWidth="1" strokeOpacity="0.22" />
            {/* traveling light pulse */}
            <path
              d={d}
              stroke="url(#streamGrad)"
              strokeWidth="2"
              className="stream-line"
              style={{ animationDuration: `${5 + i * 0.7}s`, animationDelay: `${i * 0.6}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
