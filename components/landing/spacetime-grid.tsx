"use client";

import { useEffect, useRef } from "react";

export function SpacetimeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    // Check if user prefers dark mode
    function getGridColor(): string {
      const isDark = document.documentElement.classList.contains("dark");
      return isDark ? "rgba(107, 146, 176, 0.08)" : "rgba(84, 119, 146, 0.12)";
    }

    function getGlowColor(): string {
      const isDark = document.documentElement.classList.contains("dark");
      return isDark ? "rgba(107, 146, 176, 0.15)" : "rgba(84, 119, 146, 0.14)";
    }

    function draw() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      const gridSpacing = 60;
      const cols = Math.ceil(w / gridSpacing) + 2;
      const rows = Math.ceil(h / gridSpacing) + 2;
      const centerX = w / 2;
      const centerY = h * 0.4; // Slightly above center for hero visual

      const gridColor = getGridColor();
      const glowColor = getGlowColor();

      const isDark = document.documentElement.classList.contains("dark");
      ctx!.lineWidth = isDark ? 0.5 : 0.8;

      // Draw horizontal lines with spacetime warp
      for (let row = 0; row <= rows; row++) {
        ctx!.beginPath();
        for (let col = 0; col <= cols * 2; col++) {
          const baseX = (col / 2) * gridSpacing - gridSpacing;
          const baseY = row * gridSpacing - gridSpacing;

          // Distance from gravitational center
          const dx = baseX - centerX;
          const dy = baseY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Gravitational lens warping — stronger near center
          const warpStrength = 18;
          const warpFalloff = Math.exp(-dist * 0.003);

          // Wave ripple propagating outward
          const ripple =
            Math.sin(dist * 0.02 - time * 1.2) * warpStrength * warpFalloff;

          // Secondary slower wave for complexity
          const ripple2 =
            Math.sin(dist * 0.015 + time * 0.6) *
            (warpStrength * 0.4) *
            warpFalloff;

          const warpedY = baseY + ripple + ripple2;

          // Slight X distortion for more organic feel
          const xWarp = Math.sin(baseY * 0.01 + time * 0.8) * 3 * warpFalloff;
          const warpedX = baseX + xWarp;

          if (col === 0) {
            ctx!.moveTo(warpedX, warpedY);
          } else {
            ctx!.lineTo(warpedX, warpedY);
          }
        }

        // Vary opacity based on row position for depth
        const rowAlpha = 1 - (row / rows) * 0.3;
        ctx!.strokeStyle = gridColor;
        ctx!.globalAlpha = rowAlpha;
        ctx!.stroke();
      }

      // Draw vertical lines with spacetime warp
      for (let col = 0; col <= cols; col++) {
        ctx!.beginPath();
        for (let row = 0; row <= rows * 2; row++) {
          const baseX = col * gridSpacing - gridSpacing;
          const baseY = (row / 2) * gridSpacing - gridSpacing;

          const dx = baseX - centerX;
          const dy = baseY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const warpStrength = 18;
          const warpFalloff = Math.exp(-dist * 0.003);

          const ripple =
            Math.sin(dist * 0.02 - time * 1.2) * warpStrength * warpFalloff;
          const ripple2 =
            Math.sin(dist * 0.015 + time * 0.6) *
            (warpStrength * 0.4) *
            warpFalloff;

          const yWarp = Math.sin(baseX * 0.01 + time * 0.8) * 3 * warpFalloff;
          const warpedX = baseX + ripple + ripple2;
          const warpedY = baseY + yWarp;

          if (row === 0) {
            ctx!.moveTo(warpedX, warpedY);
          } else {
            ctx!.lineTo(warpedX, warpedY);
          }
        }

        const colAlpha = 1 - Math.abs(col / cols - 0.5) * 0.4;
        ctx!.strokeStyle = gridColor;
        ctx!.globalAlpha = colAlpha;
        ctx!.stroke();
      }

      // Central gravitational glow pulse
      ctx!.globalAlpha = 1;
      const pulseRadius = 120 + Math.sin(time * 0.8) * 30;
      const gradient = ctx!.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        pulseRadius,
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "transparent");
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, w, h);

      time += 0.016; // ~60fps time step
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 1 }}
    />
  );
}
