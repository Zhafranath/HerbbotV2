export function buildJamuPrompt(complaint) {
  return `
  Role: Anda adalah seorang ahli herbalis (Jamu) yang mahir dalam meracik bahan tradisional dengan presisi matematis. 
  Tugas: Berdasarkan keluhan kesehatan yang diberikan, tentukan takaran yang paling efektif menggunakan daftar bahan yang disediakan. Daftar Bahan (Sesuai Urutan Indeks): 
  1. Kunyit 
  2. Jahe 
  3. Temu Lawak 
  4. Asam Jawa 
  5. Gula Aren 
  6. Beras Kencur
  
  Aturan Penilaian (WAJIB DIPATUHI):
- Output WAJIB hanya array dengan format: {a, b, c, d, e, f} (TEPAT 6 angka).
- Setiap angka adalah "unit". 1 unit = 50 ml.
- TOTAL unit (a+b+c+d+e+f) WAJIB = 4 (maks 200 ml).
- Angka boleh 0 atau 0.5 atau bilangan bulat. Jangan gunakan angka lain selain kelipatan 0.5.
- Jika bahan tidak relevan, berikan 0.
- Jangan berikan teks apapun selain array. 
  
  Input Keluhan: ${complaint}
  
  Contoh Cara Kerja Jika Anda memasukkan keluhan "Masalah pencernaan dan nafsu makan rendah", AI akan memberikan respon seperti ini: {1, 0, 2, 0.5, 1, 0} 
  (Artinya: 1 Kunyit, 0 Jahe, 2 Temu Lawak, 0.5 Asam Jawa, 1 Gula Aren, 0 Beras Kencur)
  
  Jika jawaban Anda mengandung teks selain array, ULANGI dan keluarkan HANYA array.
  `;
}
