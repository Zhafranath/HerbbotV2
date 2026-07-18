import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Modal({ open, title, children, onClose, footer }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const ctx = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      ctx.current = gsap.context(() => {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: .2, ease: "power2.out" });
        gsap.fromTo(modalRef.current,
          { scale: .95, y: 12, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: .35, ease: "back.out(1.3)" }
        );
      });
    } else if (ctx.current) {
      ctx.current.revert();
    }
    return () => ctx.current?.revert();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div ref={overlayRef} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} role="dialog" aria-modal="true" className="relative w-full max-w-lg bg-brand-50 rounded-3xl shadow-elevated border border-brand-200 overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-brand-200">
          <div className="font-display text-xl font-bold text-sage-700">{title}</div>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="px-6 py-4 border-t border-brand-200 bg-brand-100/50">{footer}</div> : null}
      </div>
    </div>
  );
}
