import React, { useRef } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Pesanan from "./pages/Pesanan.jsx";
import Footer from "./components/Footer.jsx";
import { Leaf } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import anime from "animejs";
import { useI18n } from "./lib/i18n.jsx";

gsap.registerPlugin(useGSAP);

function TopNav() {
  const { t, lang, toggleLang } = useI18n();
  const navRef = useRef(null);
  const homeRef = useRef(null);
  const pesananRef = useRef(null);

  useGSAP(() => {
    gsap.from(navRef.current, { y: -16, opacity: 0, duration: .6, ease: "power3.out" });
  }, { scope: navRef });

  const animateLink = (ref) => {
    anime({ targets: ref.current, scale: [1, 1.04, 1], duration: 350, easing: "easeOutElastic(1, .4)" });
  };

  return (
    <div ref={navRef} className="sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass-surface rounded-[2rem] px-5 py-3.5 flex items-center justify-between gap-3">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="grid place-items-center size-10 rounded-2xl bg-sage-200 border border-sage-300 group-hover:bg-sage-300 transition-colors">
                <Leaf className="size-5 text-sage-700" />
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-sage-800 font-black tracking-tight text-lg font-display">HERBBOT</div>
                <div className="text-[10px] text-sage-500 font-semibold tracking-wide">{t("nav.tagline")}</div>
              </div>
            </NavLink>

            <div className="flex items-center gap-1.5">
              <NavLink to="/" end ref={homeRef} onMouseEnter={() => animateLink(homeRef)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive ? "bg-sage-500 text-sage-900 shadow-lg shadow-sage-500/20" : "text-sage-600 hover:bg-brand-200"
                  }`
                }
              >{t("nav.home")}</NavLink>

              <NavLink to="/pesanan" ref={pesananRef} onMouseEnter={() => animateLink(pesananRef)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive ? "bg-sage-500 text-sage-900 shadow-lg shadow-sage-500/20" : "text-sage-600 hover:bg-brand-200"
                  }`
                }
              >{t("nav.order")}</NavLink>

            <button onClick={toggleLang} className="lang-btn active ml-1" title={lang === "id" ? "English" : "Indonesia"}>
              {lang === "id" ? "EN" : "ID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageTransition({ children }) {
  const ref = useRef(null);
  const location = useLocation();
  useGSAP(() => {
    gsap.fromTo(ref.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: "power2.out" });
  }, { dependencies: [location.pathname], scope: ref });
  return <div ref={ref}>{children}</div>;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="relative flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/pesanan" element={<Pesanan />} />
            </Routes>
          </PageTransition>
        </div>
      </div>
      <Footer />
    </div>
  );
}
