import React, { useRef, useEffect } from "react";
import anime from "animejs";

export default function ProgressBar({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, value));
  const barRef = useRef(null);
  const percentRef = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!barRef.current) return;
    anime({ targets: barRef.current, width: `${clamped}%`, duration: 500, easing: "easeOutQuad" });
    const el = percentRef.current;
    if (el) {
      const obj = { val: prevValue.current };
      anime({ targets: obj, val: clamped, duration: 450, easing: "easeOutQuad", update: () => { el.textContent = Math.round(obj.val); } });
    }
    prevValue.current = clamped;
  }, [clamped]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-sage-500 font-medium">Proses Pembuatan</span>
        <div className="flex items-baseline gap-0.5">
          <span ref={percentRef} className="font-bold text-sage-600 text-lg tabular-nums">{clamped}</span>
          <span className="text-sage-400 text-sm">%</span>
        </div>
      </div>
      <div className="h-3 rounded-full bg-brand-200 border border-brand-300 overflow-hidden">
        <div ref={barRef} className="h-full rounded-full" style={{ width: "0%", background: "linear-gradient(90deg, #427048, #508557, #5C9C64)" }} />
      </div>
    </div>
  );
}
