import React, { createContext, useContext, useState, useCallback } from "react";

const translations = {
  id: {
    nav: { home: "Beranda", order: "Pesan Jamu", tagline: "JAMU PINTAR • OTOMATIS" },
    home: {
      badge: "Didukung AI",
      title1: "Setiap Keluhan",
      title2: "Ada Racikannya",
      desc: "HERBOT meracik solusi kesehatan yang pintar & otomatis. Cukup masukkan keluhan, biarkan teknologi yang bekerja untukmu.",
      cta: "Pesan Jamu Sekarang",
      howTitle: "3 Langkah Mudah",
      howDesc: "Dari generate kode hingga jamu siap diminum, semua otomatis.",
      steps: [
        { step: "Langkah 1", title: "Generate Kode", desc: "Klik generate, dapatkan kode unik di LCD robot. Cepat & mudah." },
        { step: "Langkah 2", title: "Masukkan Keluhan", desc: "Tulis keluhan kesehatanmu, AI kami akan menghitung takaran yang tepat." },
        { step: "Langkah 3", title: "Jamu Siap!", desc: "Robot otomatis meracik jamu segar sesuai takaran. Tinggal ambil!" },
      ],
    },
    pesanan: {
      title: "Pesan Jamu",
      subtitle: "Generate → Verifikasi → Keluhan → Submit → Progress",
      reset: "Reset",
      generate: { title: "Generate", desc: "Cek robot → buat kode", btn: "Generate", codeDone: "Kode Dibuat", codeHint: "Lihat layar LCD robot" },
      verify: { title: "Verifikasi", desc: "Input kode dari LCD", placeholder: "......", btn: "Verifikasi", pesan: "Pesan", ok: "Kode benar. Lanjut tulis keluhan." },
      complaint: { title: "Keluhan", desc: "Deskripsikan keluhanmu", placeholder: "Contoh: masuk angin, pegal-pegal, capek...", tip: "Singkat aja, 1 kalimat cukup.", btn: "Submit Keluhan" },
      progress: {
        status: "Status",
        steps: ["Menunggu", "Diterima", "Ambil Bahan", "Mengaduk", "Selesai"],
        title: "Proses Pembuatan",
      },
      right: {
        title: "Proses Pesanan",
        subtitle: "Ikuti langkah-langkah berikut",
        steps: [
          { label: "Generate", desc: "Klik generate untuk mendapat kode" },
          { label: "Verifikasi", desc: "Masukkan kode yang muncul di LCD" },
          { label: "Keluhan", desc: "Tulis keluhan → AI hitung takaran" },
        ],
        herbs: "6 Bahan herbal: Kunyit, Jahe, Temu Lawak, Asam Jawa, Gula Aren, Beras Kencur",
      },
      modals: {
        notReady: { title: "Robot Belum Siap", body: "Robot sedang disiapkan. Tunggu sebentar lalu coba Generate lagi.", ok: "Mengerti" },
        wrongCode: { title: "Kode Tidak Sesuai", body1: "Kode yang kamu masukkan", body2: "tidak sesuai", body3: ". Periksa kembali kode di LCD.", ok: "Coba Lagi" },
        done: { title: "Jamu Telah Selesai!", body: "Jamu kamu sudah selesai dibuat. Silakan ambil jamu di robot.", ok: "Tutup", summary: "Ringkasan Pesanan", code: "Kode", complaint: "Keluhan", dose: "Takaran per 50ml", aiDown: "AI tidak tersedia", aiBad: "Format AI tidak sesuai" },
      },
      dbError: "Gagal connect ke database. Cek Supabase table & RLS.",
      aiError: "Gagal memanggil AI. Pastikan server backend jalan.",
    },
    footer: { tagline: "FROM MADRASAH PEMBANGUNAN JAKARTA" },
  },
  en: {
    nav: { home: "Home", order: "Order Jamu", tagline: "SMART JAMU • AUTOMATED" },
    home: {
      badge: "AI Powered",
      title1: "Every Symptom",
      title2: "Has Its Remedy",
      desc: "HERBOT brews smart & automated health solutions. Just enter your symptoms, let technology work for you.",
      cta: "Order Jamu Now",
      howTitle: "3 Easy Steps",
      howDesc: "From generating a code to fresh jamu, everything is automated.",
      steps: [
        { step: "Step 1", title: "Generate Code", desc: "Click generate, get a unique code on the robot LCD. Fast & easy." },
        { step: "Step 2", title: "Enter Symptoms", desc: "Describe your health concerns, our AI calculates the right dosage." },
        { step: "Step 3", title: "Jamu Ready!", desc: "The robot automatically brews fresh jamu. Just pick it up!" },
      ],
    },
    pesanan: {
      title: "Order Jamu",
      subtitle: "Generate → Verify → Symptoms → Submit → Progress",
      reset: "Reset",
      generate: { title: "Generate", desc: "Check robot → create code", btn: "Generate", codeDone: "Code Created", codeHint: "Check the robot LCD screen" },
      verify: { title: "Verification", desc: "Enter code from LCD", placeholder: "......", btn: "Verify", pesan: "Order", ok: "Code correct. Continue with your symptoms." },
      complaint: { title: "Symptoms", desc: "Describe your symptoms", placeholder: "Example: cold, body aches, fatigue...", tip: "Keep it short, 1 sentence is enough.", btn: "Submit Symptoms" },
      progress: {
        status: "Status",
        steps: ["Waiting", "Received", "Gathering", "Mixing", "Done"],
        title: "Brewing Process",
      },
      right: {
        title: "Order Process",
        subtitle: "Follow these steps",
        steps: [
          { label: "Generate", desc: "Click generate to get a code" },
          { label: "Verification", desc: "Enter the code shown on LCD" },
          { label: "Symptoms", desc: "Write symptoms → AI calculates dosage" },
        ],
        herbs: "6 herbs: Turmeric, Ginger, Java Ginger, Tamarind, Palm Sugar, Rice & Galangal",
      },
      modals: {
        notReady: { title: "Robot Not Ready", body: "Robot is being prepared. Please wait and try Generate again.", ok: "Got it" },
        wrongCode: { title: "Wrong Code", body1: "The code you entered is", body2: "incorrect", body3: ". Please check the LCD again.", ok: "Try Again" },
        done: { title: "Jamu Is Ready!", body: "Your jamu is ready. Please pick it up from the robot.", ok: "Close", summary: "Order Summary", code: "Code", complaint: "Symptoms", dose: "Dosage per 50ml", aiDown: "AI unavailable", aiBad: "Invalid AI format" },
      },
      dbError: "Failed to connect to database. Check Supabase table & RLS.",
      aiError: "Failed to reach AI. Make sure backend server is running.",
    },
    footer: { tagline: "FROM MADRASAH PEMBANGUNAN JAKARTA" },
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("id");

  const t = useCallback(
    (path) => {
      const keys = path.split(".");
      let val = translations[lang];
      for (const k of keys) {
        if (val === undefined) return path;
        val = val[k];
      }
      return val ?? path;
    },
    [lang]
  );

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "id" ? "en" : "id"));
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
