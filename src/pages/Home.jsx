import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Leaf, Beaker, FlaskConical, ShieldCheck, Zap, Clock, Star } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import anime from "animejs";
import { useI18n } from "../lib/i18n.jsx";
import { WavesBackground } from "../components/reactbits";

gsap.registerPlugin(useGSAP);

function PremiumIllustration() {
  const containerRef = useRef(null);
  const groupRef = useRef(null);
  const glowRef = useRef(null);

  useGSAP(() => {
    gsap.to(groupRef.current, { rotation: 2.5, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(glowRef.current, { scale: 1.08, opacity: .6, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".leaf-float", { y: -10, duration: 3, stagger: { each: .6, repeat: -1, yoyo: true }, ease: "sine.inOut" });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative flex items-center justify-center py-4">
      <div ref={glowRef} className="absolute size-72 sm:size-80 rounded-full bg-sage-400/15 blur-[70px]" />
      <div className="absolute size-56 rounded-full bg-terracotta-500/10 blur-[50px] translate-x-6 -translate-y-4" />

      <svg ref={groupRef} width="260" height="320" viewBox="0 0 240 300" className="relative drop-shadow-xl" style={{ transformOrigin: "120px 160px" }}>
        <defs>
          <linearGradient id="pjar2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7B9B7A" />
            <stop offset="0.5" stopColor="#4A7C59" />
            <stop offset="1" stopColor="#2D5A3D" />
          </linearGradient>
          <linearGradient id="pliq2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D4A373" stopOpacity=".6" />
            <stop offset="0.6" stopColor="#8BB892" stopOpacity=".7" />
            <stop offset="1" stopColor="#4A7C59" stopOpacity=".75" />
          </linearGradient>
          <filter id="pglow2">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx="120" cy="155" r="110" fill="none" stroke="rgba(139,194,145,.08)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="120" cy="155" r="118" fill="none" stroke="rgba(192,133,82,.06)" strokeWidth="1" strokeDasharray="2 12" />

        <path d="M72 95c0-8 7-15 15-15h66c8 0 15 7 15 15v85c0 12-9 22-21 22H93c-12 0-21-10-21-22V95z"
          fill="url(#pjar2)" stroke="rgba(168,212,174,.12)" strokeWidth="2" filter="url(#pglow2)" />

        <rect x="82" y="65" width="76" height="24" rx="12"
          fill="#9CB380" stroke="rgba(138,184,146,.25)" strokeWidth="2" opacity=".5" />
        <rect x="88" y="62" width="64" height="6" rx="3"
          fill="rgba(212,163,115,.25)" stroke="rgba(212,163,115,.12)" strokeWidth="1" />

        <path d="M85 135c18 8 42-5 58 3 10 5 17 12 19 18v12c0 9-7 16-16 16H94c-9 0-16-7-16-16v-30z"
          fill="url(#pliq2)" opacity=".7" />

        <path className="leaf-float" d="M118 105c-3-10 6-18 15-14 4 1 7 5 7 9 0 3-2 6-7 5-5 0-10-2-15-5"
          fill="none" stroke="#A9D4AE" strokeWidth="2" strokeLinecap="round" opacity=".3" />

        <path className="leaf-float" d="M198 80c-4-6 2-12 8-8 3 2 3 6 1 8-2 2-5 1-9 0"
          fill="none" stroke="#8BB892" strokeWidth="1.5" strokeLinecap="round" opacity=".35" />
        <path className="leaf-float" d="M42 180c3-7 9-4 8 3 0 4-4 6-6 3-1-1-3-3-2-6"
          fill="none" stroke="#D4A373" strokeWidth="1.5" strokeLinecap="round" opacity=".3" />
        <path className="leaf-float" d="M46 70c-5-2-4-8 2-7 3 0 5 3 3 6-1 1-3 1-5 1"
          fill="none" stroke="#9CB380" strokeWidth="1.5" strokeLinecap="round" opacity=".25" />

        <circle cx="100" cy="150" r="3.5" fill="#C8E6CC" opacity=".4" />
        <circle cx="130" cy="138" r="2.5" fill="#C8E6CC" opacity=".35" />
        <circle cx="115" cy="168" r="2" fill="#E8CCA0" opacity=".3" />
        <circle cx="140" cy="155" r="3" fill="#C8E6CC" opacity=".25" />

        <rect x="95" y="185" width="50" height="12" rx="6" fill="rgba(0,0,0,.08)" opacity=".4" />
        <text x="120" y="194" textAnchor="middle" fill="#C8E6CC" fontSize="8" fontFamily="system-ui" fontWeight="700" opacity=".4"></text>
      </svg>
    </div>
  );
}

function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl sm:text-3xl font-black text-sage-600">{value}</div>
      <div className="text-sage-400 text-xs mt-1 font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ProcessStep({ num, icon: Icon, title, desc, cardRef, isLast }) {
  return (
    <div ref={cardRef} className="relative flex gap-5">
      <div className="flex flex-col items-center shrink-0">
        <div className="grid place-items-center size-12 rounded-2xl bg-sage-50 border border-sage-100">
          <Icon className="size-5 text-sage-500" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-sage-200 to-transparent mt-2" />}
      </div>
      <div className="pb-8">
        <div className="text-terracotta-400 text-xs font-bold uppercase tracking-widest mb-1">{num}</div>
        <h3 className="text-sage-700 font-bold text-lg leading-tight">{title}</h3>
        <p className="text-sage-500 text-sm mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const processRefs = useRef([]);
  const ctaRef = useRef(null);

  const stepsData = t("home.steps");

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(heroRef.current, { y: 40, opacity: 0, duration: .8 });
      tl.from(statsRef.current, { y: 20, opacity: 0, duration: .6 }, "-=.3");
      tl.from(featuresRef.current, { y: 30, opacity: 0, duration: .7 }, "-=.2");
      gsap.from(processRefs.current, { x: -20, opacity: 0, duration: .5, stagger: .12, ease: "power2.out", delay: .8 });
    });

    mm.add("(max-width: 767px)", () => {
      gsap.from(heroRef.current, { y: 25, opacity: 0, duration: .6, ease: "power2.out" });
      gsap.from(statsRef.current, { y: 15, opacity: 0, duration: .5, ease: "power2.out", delay: .15 });
      gsap.from(featuresRef.current, { y: 20, opacity: 0, duration: .55, ease: "power2.out", delay: .3 });
      gsap.from(processRefs.current, { x: -15, opacity: 0, duration: .45, stagger: .1, ease: "power2.out", delay: .5 });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="space-y-20 sm:space-y-28">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-[3rem] bg-brand-200 border border-brand-300">
        <WavesBackground
          lineColor="rgba(92,156,100,0.08)"
          waveSpeedX={0.012}
          waveSpeedY={0.004}
          waveAmpX={28}
          waveAmpY={16}
          yGap={44}
        />

        <div ref={heroRef} className="relative z-10 grid items-center gap-8 lg:grid-cols-2 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          {/* LEFT */}
          <div className="space-y-7 order-2 lg:order-1">
            <div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-sage-800 leading-[1.06] tracking-tight">
                {t("home.title1")}
                <br />
                <span className="bg-gradient-to-r from-sage-500 via-leaf-500 to-terracotta-400 bg-clip-text text-transparent">
                  {t("home.title2")}
                </span>
              </h1>

              <p className="text-sage-500 text-base sm:text-lg leading-relaxed max-w-xl mt-4 font-medium">
                {t("home.desc")}
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link ref={ctaRef} to="/pesanan"
                className="btn-gold !px-8 !py-4 !text-base !rounded-2xl inline-flex items-center gap-2.5 group"
                onMouseEnter={() => anime({ targets: ctaRef.current, scale: [1, 1.03], duration: 500, easing: "easeOutElastic(1, .4)" })}
              >
                {t("home.cta")}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT - Illustration */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <PremiumIllustration />
          </div>
        </div>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <div ref={featuresRef} className="grid gap-8 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Takaran Presisi", desc: "AI menghitung dosis tepat berdasarkan keluhan" },
          { icon: Zap, title: "Proses Cepat", desc: "Dari pesan ke jamu jadi dalam hitungan menit" },
          { icon: Clock, title: "24 Jam Siap", desc: "Robot selalu stand-by, pesan kapan saja" },
        ].map((f, i) => (
          <div key={i} className="group text-center space-y-3">
            <div className="mx-auto grid place-items-center size-14 rounded-2xl bg-sage-50 border border-sage-100 group-hover:bg-sage-100 transition-colors duration-300">
              <f.icon className="size-6 text-sage-500 group-hover:text-sage-600 transition-colors duration-300" />
            </div>
            <h3 className="text-sage-700 font-bold text-base">{f.title}</h3>
            <p className="text-sage-500 text-sm leading-relaxed max-w-xs mx-auto">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* LEFT - Steps */}
        <div className="space-y-1">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-50 border border-sage-100 mb-4">
              <Sparkles className="size-3 text-sage-500" />
              <span className="text-sage-500 text-[11px] font-bold uppercase tracking-wider">Proses</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sage-800">{t("home.howTitle")}</h2>
          </div>

          <div className="space-y-2">
            {Array.isArray(stepsData) && stepsData.map((s, i) => (
              <ProcessStep
                key={s.title}
                num={`0${i + 1}`}
                icon={[Sparkles, Leaf, Beaker][i]}
                title={s.title}
                desc={s.desc}
                isLast={i === stepsData.length - 1}
                cardRef={(el) => (processRefs.current[i] = el)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT - Highlights */}
        <div className="surface-accent p-6 sm:p-8 self-start space-y-6">
          <h3 className="font-display text-xl font-bold text-sage-700">Kenapa HERBBOT?</h3>

          <div className="space-y-5">
            {[
              { icon: FlaskConical, color: "text-terracotta-400", label: "6 Bahan Herbal Premium", desc: "Kunyit, Jahe, Temu Lawak, Asam Jawa, Gula Aren, Beras Kencur — resep turun-temurun." },
              { icon: Beaker, color: "text-sage-500", label: "AI Racik Otomatis", desc: "Kecerdasan buatan menghitung takaran ideal berdasarkan keluhan spesifik kamu." },
              { icon: Sparkles, color: "text-leaf-500", label: "Higienis & Segar", desc: "Dibuat langsung oleh robot, tanpa sentuhan tangan, selalu fresh setiap pesanan." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="grid place-items-center size-10 rounded-xl bg-sage-50 border border-sage-100 shrink-0 mt-0.5">
                  <item.icon className={`size-4 ${item.color}`} />
                </div>
                <div>
                  <div className="text-sage-700 font-bold text-sm">{item.label}</div>
                  <div className="text-sage-500 text-sm mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
