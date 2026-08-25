import React, { useRef, useEffect } from "react";

export default function WavesBackground({
  lineColor = "rgba(74,124,89,0.08)",
  backgroundColor = "transparent",
  waveSpeedX = 0.015,
  waveSpeedY = 0.005,
  waveAmpX = 35,
  waveAmpY = 18,
  xGap = 14,
  yGap = 50,
  strokeWidth = 1,
  className = "",
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w, h, t = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.parentElement.clientWidth;
      h = canvas.parentElement.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      animRef.current = requestAnimationFrame(draw);
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";

      const rows = Math.floor(h / yGap) + 2;

      for (let row = 0; row < rows; row++) {
        ctx.beginPath();
        const yBase = row * yGap + (t * waveSpeedY * 60) % yGap;
        for (let x = 0; x <= w; x += 2) {
          const y =
            yBase +
            Math.sin((x / w) * waveAmpX * 0.05 + t * waveSpeedX + row * 0.5) * waveAmpY +
            Math.cos((x / w) * waveAmpX * 0.03 + row * 0.8) * waveAmpY * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [lineColor, backgroundColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, xGap, yGap, strokeWidth]);

  return <canvas ref={canvasRef} className={`absolute inset-0 ${className}`} />;
}
