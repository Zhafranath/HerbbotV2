import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Modal from "../components/Modal.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { Wand2, KeyRound, AlertTriangle, Send, RefreshCcw, MessageSquareText, Leaf, Sparkles, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { buildJamuPrompt } from "../lib/prompt.js";
import { supabase } from "../lib/supabase.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import anime from "animejs";
import { useI18n } from "../lib/i18n.jsx";
import { WavesBackground } from "../components/reactbits";

gsap.registerPlugin(useGSAP);

const TABLE_NAME = "robot_state";
const ROW_ID = 1;

function random6Digits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function mapProgressToPercent(progressText) {
  const t = (progressText || "").toLowerCase();
  if (t.includes("selesai")) return 100;
  if (t.includes("mengaduk")) return 75;
  if (t.includes("mengambil")) return 40;
  if (t.includes("keluhan")) return 10;
  if (t.includes("robot")) return 0;
  if (!t) return 0;
  return 5;
}

export default function Pesanan() {
  const { t } = useI18n();

  const [generatedCode, setGeneratedCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [step, setStep] = useState("idle");
  const [complaint, setComplaint] = useState("");
  const [dbReady, setDbReady] = useState(false);
  const [dbProgressText, setDbProgressText] = useState("");
  const [dbCodeVerified, setDbCodeVerified] = useState(false);
  const [dbAidose, setDbAidose] = useState(null);
  const [dbError, setDbError] = useState("");
  const [progress, setProgress] = useState(0);
  const [aiDose, setAiDose] = useState(null);
  const [aiRaw, setAiRaw] = useState("");
  const [aiError, setAiError] = useState("");
  const [wrongModal, setWrongModal] = useState(false);
  const [robotModal, setRobotModal] = useState(false);
  const [doneModal, setDoneModal] = useState(false);

  const mountedRef = useRef(false);
  const pollRef = useRef(null);
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const generateCardRef = useRef(null);
  const verifyCardRef = useRef(null);
  const complaintRef = useRef(null);

  const ingredientNames = ["Kunyit", "Jahe", "Temu Lawak", "Asam Jawa", "Gula Aren", "Beras Kencur"];

  const progressDetail = useMemo(() => {
    if (dbProgressText) return dbProgressText;
    if (progress >= 100) return "Selesai";
    if (progress >= 75) return "Mengaduk Jamu";
    if (progress >= 40) return "Mengambil Bahan Jamu";
    if (progress >= 10) return "Keluhan diterima";
    return "Menunggu...";
  }, [dbProgressText, progress]);

  const verified = step === "verified" || step === "composing" || step === "processing";
  const showVerify = Boolean(generatedCode) && step !== "processing";
  const progressSteps = t("pesanan.progress.steps");
  const stepsRight = t("pesanan.right.steps");

  const activeStep = step === "processing" ? 4 : step === "composing" ? 3 : verified ? 2 : generatedCode ? 1 : 0;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.from(leftPanelRef.current, { x: -24, opacity: 0, duration: .55, ease: "power3.out" });
      gsap.from(rightPanelRef.current, { x: 24, opacity: 0, duration: .55, ease: "power3.out", delay: .08 });
    });
    mm.add("(max-width: 1023px)", () => {
      gsap.from([leftPanelRef.current, rightPanelRef.current], { y: 16, opacity: 0, duration: .45, stagger: .1, ease: "power2.out" });
    });
  }, { scope: containerRef });

  useEffect(() => {
    if (step === "composing" && complaintRef.current) {
      gsap.from(complaintRef.current, { y: 12, opacity: 0, duration: .4, ease: "power2.out" });
    }
  }, [step]);

  async function fetchRow() {
    setDbError("");
    const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", ROW_ID).single();
    if (error) { console.error("Fetch error:", error); setDbError(t("pesanan.dbError")); return null; }
    return data;
  }

  async function updateRow(patch) {
    const { error } = await supabase.from(TABLE_NAME).update(patch).eq("id", ROW_ID);
    if (error) { console.error("Update error:", error); throw error; }
  }

  function stopPolling() { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } }

  function applyRowToState(row) {
    setDbReady(Boolean(row.ready));
    setDbProgressText(row.progress || "");
    setDbCodeVerified(Boolean(row.code_verified));
    setDbAidose(row.aidose ?? null);
    const pct = mapProgressToPercent(row.progress || "");
    setProgress(pct);
    if ((row.progress || "").toLowerCase().includes("selesai")) { stopPolling(); setDoneModal(true); }
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => { const row = await fetchRow(); if (!row) return; applyRowToState(row); }, 1000);
  }

  function resetAll() {
    stopPolling();
    setGeneratedCode(""); setCodeInput(""); setStep("idle"); setComplaint("");
    setProgress(0); setAiDose(null); setAiRaw(""); setAiError("");
    setDbError(""); setWrongModal(false); setRobotModal(false); setDoneModal(false);
  }

  useEffect(() => {
    mountedRef.current = true;
    (async () => { const row = await fetchRow(); if (!mountedRef.current || !row) return; applyRowToState(row); })();
    return () => { mountedRef.current = false; stopPolling(); };
  }, []);

  async function handleGenerate() {
    stopPolling();
    const row = await fetchRow(); if (!row) return;
    if (!row.ready) { setRobotModal(true); return; }
    const c = random6Digits();
    setGeneratedCode(c); setCodeInput(""); setStep("idle"); setComplaint("");
    setProgress(0); setAiDose(null); setAiRaw(""); setAiError("");
    if (generateCardRef.current) { anime({ targets: generateCardRef.current, scale: [1, .97, 1], duration: 450, easing: "easeOutElastic(1, .5)" }); }
    await updateRow({ code: c, code_verified: false, aidose: null, progress: "Menunggu verifikasi" });
    const fresh = await fetchRow(); if (fresh) applyRowToState(fresh);
  }

  async function handleVerify() {
    const input = codeInput.trim(); const ok = input && generatedCode && input === generatedCode;
    await updateRow({ code_verified: ok });
    if (ok) { setStep("verified"); const fresh = await fetchRow(); if (fresh) applyRowToState(fresh); }
    else { setWrongModal(true); anime({ targets: verifyCardRef.current, translateX: [0, -6, 6, -3, 3, 0], duration: 400, easing: "easeInOutQuad" }); const fresh = await fetchRow(); if (fresh) applyRowToState(fresh); }
  }

  function handlePesan() { setStep("composing"); }

  async function handleSubmit() {
    setStep("processing"); setProgress(10); setAiDose(null); setAiRaw(""); setAiError("");
    await updateRow({ progress: "Keluhan diterima" }); startPolling();
    const prompt = buildJamuPrompt(complaint.trim());
    try {
      const r = await fetch("/api/jamu-dose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await r.json(); setAiRaw(data.raw || "");
      if (data.dose) {
        setAiDose(data.dose);
        const row = await fetchRow();
        await updateRow({ aidose: data.dose, order: String(parseInt(row?.order || "0", 10) + 1) });
        await supabase.from("orders").insert({ order_number: parseInt(row?.order || "0", 10) + 1, code: generatedCode, complaint: complaint.trim(), aidose: data.dose });
        const fresh = await fetchRow(); if (fresh) applyRowToState(fresh);
      } else { setAiError(data.error || "FORMAT_INVALID"); }
    } catch (e) { setAiError(t("pesanan.aiError")); }
  }

  const stepLabels = ["Generate", "Verifikasi", "Keluhan", "Progress"];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* ===== HEADER + STEP INDICATOR ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-sage-800">{t("pesanan.title")}</h2>
          <p className="text-sage-500 text-sm">{t("pesanan.subtitle")}</p>
        </div>
        <button className="btn-ghost !rounded-2xl" onClick={resetAll} type="button">
          <RefreshCcw className="size-4" /><span className="hidden sm:inline text-sm">{t("pesanan.reset")}</span>
        </button>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div className="surface-warm p-5">
        <div className="flex items-center justify-between gap-2">
          {stepLabels.map((label, i) => {
            const stepIdx = i === 0 ? 1 : i === 1 ? 2 : i === 2 ? 3 : 4;
            const done = activeStep > stepIdx;
            const current = activeStep === stepIdx;
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-2.5 ${current ? "" : ""}`}>
                  <div className={`grid place-items-center size-9 rounded-xl shrink-0 transition-all duration-500 ${
                    done ? "bg-sage-500 border border-sage-500" :
                    current ? "bg-sage-500/10 border-2 border-sage-500" :
                    "bg-brand-100 border border-brand-200"
                  }`}>
                    {done ? <CheckCircle2 className="size-4 text-brand-50" /> :
                     current ? <div className="size-2 rounded-full bg-sage-500 animate-pulse-soft" /> :
                     <span className="text-xs font-bold text-brand-400">{i + 1}</span>}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:inline transition-colors ${
                    done || current ? "text-sage-700" : "text-brand-400"
                  }`}>{label}</span>
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                    done ? "bg-sage-500" : current ? "bg-gradient-to-r from-sage-500 to-brand-200" : "bg-brand-200"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {dbError ? <div className="rounded-2xl bg-rose-100/60 border border-rose-200 p-4 text-rose-600 text-sm font-medium">{dbError} F12 → Console.</div> : null}

      {/* ===== MAIN GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ===== LEFT PANEL — ACTION AREA ===== */}
        <div ref={leftPanelRef} className="space-y-5">
          {/* Step 1 & 2: Generate + Verify */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* === GENERATE === */}
            <div ref={generateCardRef}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                generatedCode ? "border-sage-200 bg-sage-50/50 shadow-soft" : "border-brand-200 bg-brand-50 shadow-soft"
              } p-5`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`grid place-items-center size-11 rounded-xl transition-all duration-300 ${
                    generatedCode ? "bg-sage-100 border border-sage-200" : "bg-brand-100 border border-brand-200"
                  }`}>
                    <Wand2 className={`size-[18px] transition-colors duration-300 ${generatedCode ? "text-sage-600" : "text-sage-400"}`} />
                  </div>
                  <div>
                    <div className="text-sage-700 font-bold text-sm">{t("pesanan.generate.title")}</div>
                    <div className="text-brand-400 text-[11px] font-medium">{t("pesanan.generate.desc")}</div>
                  </div>
                </div>
                <button className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl !font-bold" onClick={handleGenerate} type="button">
                  <Wand2 className="size-3.5" />{t("pesanan.generate.btn")}
                </button>
              </div>
              <AnimatePresence>
                {generatedCode ? (
                  <div className="mt-4 rounded-xl bg-sage-50/80 border border-sage-100 p-3 flex items-center gap-3">
                    <div className="grid place-items-center size-9 rounded-lg bg-sage-100 shrink-0">
                      <Sparkles className="size-4 text-sage-500" />
                    </div>
                    <div>
                      <div className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">{t("pesanan.generate.codeDone")}</div>
                      <div className="text-sage-600 text-[13px] font-semibold">{t("pesanan.generate.codeHint")}</div>
                    </div>
                  </div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* === VERIFY === */}
            <div ref={verifyCardRef}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                verified ? "border-sage-200 bg-sage-50/50 shadow-soft" : "border-brand-200 bg-brand-50 shadow-soft"
              } p-5`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`grid place-items-center size-11 rounded-xl transition-all duration-300 ${
                  verified ? "bg-terracotta-500/10 border border-terracotta-500/20" : "bg-brand-100 border border-brand-200"
                }`}>
                  <KeyRound className={`size-[18px] transition-colors duration-300 ${verified ? "text-terracotta-400" : "text-sage-400"}`} />
                </div>
                <div>
                  <div className="text-sage-700 font-bold text-sm">{t("pesanan.verify.title")}</div>
                  <div className="text-brand-400 text-[11px] font-medium">{t("pesanan.verify.desc")}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <input
                  className="input !rounded-xl text-center text-lg font-bold h-12 tracking-[.35em]"
                  inputMode="numeric" placeholder="• • • • • •"
                  value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
                  disabled={!generatedCode || step === "processing"} maxLength={6}
                />
                <div className="flex gap-2">
                  <button
                    className={`${showVerify ? "btn-primary" : "btn-ghost opacity-20 cursor-not-allowed"} !text-xs !px-5 !py-2.5 !rounded-xl !font-bold flex-1`}
                    onClick={handleVerify} type="button" disabled={!showVerify}
                  >{t("pesanan.verify.btn")}</button>
                  <AnimatePresence>
                    {verified ? (
                      <button className="btn-gold !text-xs !px-4 !py-2.5 !rounded-xl !font-bold" onClick={handlePesan} type="button">
                        {t("pesanan.verify.pesan")} <ArrowRight className="size-3.5" />
                      </button>
                    ) : null}
                  </AnimatePresence>
                </div>
                {verified && step !== "processing" ? (
                  <div className="flex items-center gap-2 text-[11px] text-sage-500 font-semibold pt-0.5">
                    <CheckCircle2 className="size-3.5 text-sage-500" />{t("pesanan.verify.ok")}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Step 3: Complaint */}
          <AnimatePresence>
            {(step === "composing" || step === "processing") ? (
              <div ref={complaintRef}
                className="rounded-2xl border border-sage-200 bg-sage-50/40 shadow-soft p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`grid place-items-center size-11 rounded-xl transition-all duration-300 ${
                    step === "processing" ? "bg-sage-100 border border-sage-200" : "bg-terracotta-500/10 border border-terracotta-500/20"
                  }`}>
                    <MessageSquareText className={`size-[18px] ${step === "processing" ? "text-sage-500" : "text-terracotta-400"}`} />
                  </div>
                  <div>
                    <div className="text-sage-700 font-bold text-sm">{t("pesanan.complaint.title")}</div>
                    <div className="text-brand-400 text-[11px] font-medium">{t("pesanan.complaint.desc")}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    className="textarea !rounded-xl !bg-brand-200 !border-brand-300 focus:!border-sage-600 min-h-[90px] max-h-[110px]"
                    placeholder={t("pesanan.complaint.placeholder")}
                    value={complaint} onChange={(e) => setComplaint(e.target.value)}
                    disabled={step === "processing"}
                  />

                  {step === "composing" ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-brand-400 font-medium">{t("pesanan.complaint.tip")}</span>
                      <button
                        className={`btn-gold !text-sm !px-6 !py-2.5 !rounded-xl !font-bold ${complaint.trim() ? "" : "opacity-30 cursor-not-allowed"}`}
                        onClick={handleSubmit} type="button" disabled={!complaint.trim()}
                      >
                        <Send className="size-3.5" />{t("pesanan.complaint.btn")}
                      </button>
                    </div>
                  ) : null}

                  {/* Step 4: Progress */}
                  {step === "processing" ? (
                    <div className="space-y-4 pt-2">
                      <div className="rounded-2xl bg-brand-50 border border-brand-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-brand-400 text-[11px] font-semibold uppercase tracking-wider">{t("pesanan.progress.status")}</span>
                          <span className="text-sage-600 font-bold text-sm px-3 py-1 rounded-lg bg-sage-50 border border-sage-100">{progressDetail}</span>
                        </div>
                        <ProgressBar value={progress} />
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {Array.isArray(progressSteps) && progressSteps.map((label, i) => {
                            const thresholds = [0, 10, 40, 75, 100];
                            const active = progress >= thresholds[i] && (i === 4 ? true : progress < thresholds[i + 1]);
                            const done = progress >= thresholds[i];
                            return (
                              <span key={label}
                                className={`text-[10px] px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-300 ${
                                  active ? "bg-sage-100 text-sage-600 border border-sage-200 shadow-sm" :
                                  done ? "text-sage-500 bg-sage-50/60" : "text-brand-400"
                                }`}
                              >{label}{i < 4 ? <span className="mx-0.5 opacity-40">→</span> : ""}</span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ===== RIGHT PANEL — TIMELINE ===== */}
        <div ref={rightPanelRef}
          className="relative overflow-hidden rounded-2xl border border-brand-200 shadow-soft self-start"
          style={{ background: "linear-gradient(160deg, #1F3824 0%, #1A2F1E 50%, #243B27 100%)" }}
        >
          <WavesBackground
            lineColor="rgba(92,156,100,0.07)"
            waveSpeedX={0.007}
            waveSpeedY={0.002}
            waveAmpX={20}
            waveAmpY={10}
            yGap={38}
          />

          <div className="relative z-10 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-sage-700">{t("pesanan.right.title")}</h3>
                <p className="text-sage-500 text-xs mt-0.5">{t("pesanan.right.subtitle")}</p>
              </div>
              <Sparkles className="size-4 text-sage-400 animate-pulse-soft" />
            </div>

            {/* Timeline */}
            <div className="relative pl-1">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-sage-200 via-sage-100 to-transparent" />

              <div className="space-y-4">
                {Array.isArray(stepsRight) && stepsRight.map((item, i) => {
                  const isActive = i === 0 ? !!generatedCode : i === 1 ? verified : (step === "composing" || step === "processing");
                  const isDone = i === 0 ? (!!generatedCode || verified || step !== "idle") : i === 1 ? (verified || step === "composing" || step === "processing") : (step === "composing" || step === "processing");
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`relative z-10 grid place-items-center size-[18px] rounded-full shrink-0 mt-0.5 transition-all duration-500 ${
                        isActive ? "bg-terracotta-500 shadow-sm shadow-terracotta-500/20" :
                        isDone ? "bg-sage-500 shadow-sm shadow-sage-500/15" :
                        "bg-brand-200"
                      }`}>
                        {isDone || isActive ? <CheckCircle2 className="size-3 text-brand-50" /> : null}
                      </div>
                      <div>
                        <div className={`text-sm font-bold transition-colors duration-300 ${
                          isActive ? "text-sage-700" : isDone ? "text-sage-600" : "text-brand-400"
                        }`}>{item.label}</div>
                        <div className="text-brand-400 text-[11px] mt-0.5 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Progress step in timeline */}
                <div className="flex items-start gap-3">
                  <div className={`relative z-10 grid place-items-center size-[18px] rounded-full shrink-0 mt-0.5 transition-all duration-500 ${
                    progress === 100 ? "bg-terracotta-500 shadow-sm shadow-terracotta-500/20" :
                    progress > 0 ? "bg-sage-500 shadow-sm shadow-sage-500/15" :
                    "bg-brand-200"
                  }`}>
                    {progress > 0 ? <CheckCircle2 className="size-3 text-brand-50" /> : null}
                  </div>
                  <div>
                    <div className={`text-sm font-bold transition-colors duration-300 ${
                      progress === 100 ? "text-sage-700" : progress > 0 ? "text-sage-600" : "text-brand-400"
                    }`}>Progress</div>
                    <div className="text-brand-400 text-[11px] mt-0.5">{progressDetail}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients footer */}
            <div className="rounded-xl bg-sage-50/70 border border-sage-100/60 p-4">
              <div className="flex items-start gap-3">
                <div className="grid place-items-center size-9 rounded-lg bg-sage-50/80 border border-sage-100 shrink-0">
                  <Leaf className="size-4 text-sage-500" />
                </div>
                <div>
                  <div className="text-sage-600 font-bold text-xs mb-1">6 Bahan Herbal Premium</div>
                  <p className="text-brand-400 text-[10px] leading-relaxed">{t("pesanan.right.herbs")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}
      <Modal open={robotModal} title={t("pesanan.modals.notReady.title")} onClose={() => setRobotModal(false)}
        footer={<div className="flex justify-end"><button className="btn-primary !rounded-xl !font-bold" onClick={() => setRobotModal(false)}>{t("pesanan.modals.notReady.ok")}</button></div>}>
        <div className="text-sage-500 text-sm leading-relaxed">{t("pesanan.modals.notReady.body")}</div></Modal>

      <Modal open={wrongModal} title={t("pesanan.modals.wrongCode.title")} onClose={() => setWrongModal(false)}
        footer={<div className="flex justify-end"><button className="btn-primary !rounded-xl !font-bold" onClick={() => setWrongModal(false)}>{t("pesanan.modals.wrongCode.ok")}</button></div>}>
        <div className="flex items-start gap-4">
          <div className="grid place-items-center size-12 rounded-2xl bg-rose-100/70 border border-rose-200 shrink-0"><AlertTriangle className="size-5 text-rose-500" /></div>
          <div className="text-sage-500 text-sm leading-relaxed">{t("pesanan.modals.wrongCode.body1")} <span className="font-bold text-rose-600">{t("pesanan.modals.wrongCode.body2")}</span>{t("pesanan.modals.wrongCode.body3")}</div>
        </div></Modal>

      <Modal open={doneModal} title={t("pesanan.modals.done.title")} onClose={() => {}}
        footer={<div className="flex justify-end"><button className="btn-gold !rounded-xl !font-bold" onClick={() => { setDoneModal(false); resetAll(); }}>{t("pesanan.modals.done.ok")}</button></div>}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center size-10 rounded-xl bg-sage-100 border border-sage-200 shrink-0 mt-0.5">
              <Sparkles className="size-4 text-sage-500" />
            </div>
            <div className="text-sage-500 text-sm leading-relaxed pt-1.5">{t("pesanan.modals.done.body")}</div>
          </div>

          <div className="rounded-2xl bg-sage-50/80 border border-sage-100 p-5 space-y-3">
            <h4 className="font-display text-base font-bold text-sage-700">{t("pesanan.modals.done.summary")}</h4>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-brand-400 text-xs w-16 shrink-0">{t("pesanan.modals.done.code")}</span>
                <span className="font-bold text-sage-600 tracking-[.15em]">{generatedCode || "—"}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand-400 text-xs w-16 shrink-0 pt-0.5">{t("pesanan.modals.done.complaint")}</span>
                <span className="text-sage-500 text-sm">{complaint || "—"}</span>
              </div>
              <div className="flex items-start gap-3 pt-1 border-t border-sage-100">
                <span className="text-brand-400 text-xs w-16 shrink-0 pt-0.5">{t("pesanan.modals.done.dose")}</span>
                <span className="font-bold text-sage-600 text-sm">
                  {aiDose ? `{${aiDose.join(", ")}}` :
                   aiError ? (aiError === "AI_UNAVAILABLE" ? t("pesanan.modals.done.aiDown") : t("pesanan.modals.done.aiBad")) :
                   dbAidose ? JSON.stringify(dbAidose) : "—"}
                </span>
              </div>
            </div>

            {aiDose ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ingredientNames.map((name, i) => (
                  <span key={name} className="px-2.5 py-1.5 rounded-lg bg-sage-50 border border-sage-100 text-sage-600 text-[11px] font-semibold">
                    {name}
                    <span className="text-terracotta-400 font-bold ml-1">{aiDose[i]}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div></Modal>
    </div>
  );
}
