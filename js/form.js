/* ==========================================================
   Bagian 2 – Form: DOM & Event Handling
   ========================================================== */

const form = document.getElementById("form-daftar");
const feedback = document.getElementById("feedback");
const daftarPeserta = document.getElementById("daftar-peserta");
const kosongPeserta = document.getElementById("kosong-peserta");
const hitungPesan = document.getElementById("hitung-pesan");

const peserta = []; // data peserta disimpan di memori

/* ---------- Aturan validasi per field ---------- */
// Setiap fungsi mengembalikan string pesan error, atau "" jika valid.
const aturan = {
  nama(v) {
    if (v.trim() === "") return "Nama wajib diisi.";
    if (v.trim().length < 3) return "Nama minimal 3 karakter.";
    if (!/^[A-Za-z\s.'-]+$/.test(v.trim())) return "Nama hanya boleh berisi huruf.";
    return "";
  },
  email(v) {
    if (v.trim() === "") return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Format email tidak valid, contoh: nama@mail.com.";
    return "";
  },
  nim(v) {
    if (v.trim() === "") return "NIM wajib diisi.";
    if (!/^\d+$/.test(v)) return "NIM hanya boleh berisi angka.";
    if (v.length !== 11) return `NIM harus 11 digit (sekarang ${v.length}).`;
    return "";
  },
  kelas(v) {
    return v === "" ? "Pilih salah satu kelas." : "";
  },
  pesan(v) {
    if (v.trim() === "") return "Harapan wajib diisi.";
    if (v.trim().length < 10) return "Tulis minimal 10 karakter.";
    return "";
  },
  setuju(checked) {
    return checked ? "" : "Centang pernyataan ini untuk melanjutkan.";
  },
};

/* ---------- Helper DOM ---------- */
function ambilNilai(nama) {
  const el = form.elements[nama];
  return el.type === "checkbox" ? el.checked : el.value;
}

/** Validasi satu field, tampilkan pesan, ubah kelas CSS. Mengembalikan true jika valid. */
function validasiField(nama) {
  const el = form.elements[nama];
  const pesanError = aturan[nama](ambilNilai(nama));
  const wadah = el.closest(".field");

  document.getElementById(`err-${nama}`).textContent = pesanError;
  wadah.classList.toggle("invalid", pesanError !== "");
  wadah.classList.toggle("valid", pesanError === "");
  el.setAttribute("aria-invalid", pesanError !== "");

  return pesanError === "";
}

function tampilkanFeedback(teks, tipe) {
  feedback.textContent = teks;
  feedback.className = `feedback ${tipe}`;
  feedback.hidden = false;
}

function renderPeserta() {
  daftarPeserta.replaceChildren();
  kosongPeserta.hidden = peserta.length > 0;

  peserta.forEach((p) => {
    const li = document.createElement("li");

    const nama = document.createElement("span");
    nama.className = "nama";
    nama.textContent = p.nama;

    const meta1 = document.createElement("span");
    meta1.className = "meta";
    meta1.textContent = `${p.nim} • Kelas ${p.kelas}`;

    const meta2 = document.createElement("span");
    meta2.className = "meta";
    meta2.textContent = p.email;

    const harapan = document.createElement("span");
    harapan.textContent = p.pesan;

    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "btn-hapus";
    hapus.textContent = "Hapus";
    hapus.dataset.id = p.id;
    hapus.setAttribute("aria-label", `Hapus peserta ${p.nama}`);

    li.append(nama, meta1, meta2, harapan, hapus);
    daftarPeserta.append(li);
  });
}

/* ---------- Event listener ---------- */

// 1) input / change: validasi langsung saat mengetik atau memilih
["nama", "email", "nim", "kelas", "pesan"].forEach((nama) => {
  const el = form.elements[nama];
  const jenisEvent = el.tagName === "SELECT" ? "change" : "input";
  el.addEventListener(jenisEvent, () => validasiField(nama));
});
form.elements.setuju.addEventListener("change", () => validasiField("setuju"));

// Batasi NIM hanya angka saat mengetik
form.elements.nim.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
});

// Penghitung karakter pada textarea
form.elements.pesan.addEventListener("input", (e) => {
  hitungPesan.textContent = `${e.target.value.length} / ${e.target.maxLength}`;
});

// 2) submit: validasi semua field lalu proses
form.addEventListener("submit", (e) => {
  e.preventDefault(); // cegah reload halaman

  const semuaValid = Object.keys(aturan).map(validasiField).every(Boolean);

  if (!semuaValid) {
    tampilkanFeedback("Form belum lengkap. Periksa kolom yang bertanda merah.", "gagal");
    const pertama = form.querySelector(".invalid input, .invalid select, .invalid textarea");
    if (pertama) pertama.focus();
    return;
  }

  const nim = form.elements.nim.value;
  if (peserta.some((p) => p.nim === nim)) {
    tampilkanFeedback(`NIM ${nim} sudah terdaftar.`, "gagal");
    return;
  }

  peserta.push({
    id: Date.now(),
    nama: form.elements.nama.value.trim(),
    email: form.elements.email.value.trim(),
    nim,
    kelas: form.elements.kelas.value,
    pesan: form.elements.pesan.value.trim(),
  });

  tampilkanFeedback(`Terima kasih, ${form.elements.nama.value.trim()}! Pendaftaran berhasil.`, "ok");
  renderPeserta();
  form.reset();
});

// 3) reset: bersihkan status validasi & counter
form.addEventListener("reset", () => {
  form.querySelectorAll(".field").forEach((f) => f.classList.remove("valid", "invalid"));
  form.querySelectorAll(".error-msg").forEach((m) => (m.textContent = ""));
  hitungPesan.textContent = "0 / 150";
});

// 4) click: hapus peserta (event delegation pada <ul>)
daftarPeserta.addEventListener("click", (e) => {
  const tombol = e.target.closest(".btn-hapus");
  if (!tombol) return;

  const index = peserta.findIndex((p) => String(p.id) === tombol.dataset.id);
  if (index !== -1) {
    const [dihapus] = peserta.splice(index, 1);
    renderPeserta();
    tampilkanFeedback(`${dihapus.nama} dihapus dari daftar.`, "ok");
  }
});
