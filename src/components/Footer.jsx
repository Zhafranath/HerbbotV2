import React, { useRef } from "react";
import { Leaf } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Footer() {
  const { t } = useI18n();
  const footerRef = useRef(null);

  useGSAP(() => {
    gsap.from(footerRef.current, { y: 16, opacity: 0, duration: .6, ease: "power2.out",
      scrollTrigger: { trigger: footerRef.current, start: "top bottom-=40", toggleActions: "play none none none" } });
  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="w-full px-4 py-6 border-t border-brand-200">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Leaf className="size-4 text-sage-500" />
            <span className="text-sm font-bold tracking-tight text-sage-600 font-display">
              HERB<span className="text-sage-500">BOT</span>
            </span>
            <span className="hidden sm:block text-brand-300">|</span>
            <p className="text-[10px] uppercase tracking-wider text-sage-500 font-semibold">{t("footer.tagline")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
