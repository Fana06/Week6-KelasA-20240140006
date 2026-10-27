/* ==========================================================
   Bagian 1 – Fetch API: mengambil & menampilkan data produk
   ========================================================== */

const API_URL = "https://dummyjson.com/products";

const elLoading = document.getElementById("status-loading");
const elError = document.getElementById("status-error");
const elPesanError = document.getElementById("pesan-error");
const elDaftar = document.getElementById("daftar-produk");
const elCari = document.getElementById("cari-produk");
const elJumlah = document.getElementById("jumlah-produk");
const btnCobaLagi = document.getElementById("btn-coba-lagi");

let semuaProduk = [];

/** Format angka ke dolar, contoh: 9.99 -> $9.99 */
function formatHarga(angka) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(angka);
}

/** Membuat satu kartu produk memakai DOM (bukan innerHTML, agar aman). */
function buatKartuProduk(produk) {
  const li = document.createElement("li");
  li.className = "kartu";

  const img = document.createElement("img");
  img.src = produk.thumbnail;
  img.alt = produk.title;
  img.loading = "lazy";

  const body = document.createElement("div");
  body.className = "kartu-body";

  const kategori = document.createElement("span");
  kategori.className = "kartu-kategori";
  kategori.textContent = produk.category;

  const nama = document.createElement("h3");
  nama.className = "kartu-nama";
  nama.textContent = produk.title;

  const harga = document.createElement("p");
  harga.className = "kartu-harga";
  harga.textContent = formatHarga(produk.price);

  body.append(kategori, nama, harga);
  li.append(img, body);
  return li;
}

/** Menampilkan daftar produk ke halaman. */
function tampilkanProduk(daftar) {
  elDaftar.replaceChildren(); // kosongkan dulu

  if (daftar.length === 0) {
    const kosong = document.createElement("li");
    kosong.className = "kosong";
    kosong.textContent = "Tidak ada produk yang cocok dengan pencarian.";
    elDaftar.append(kosong);
  } else {
    const fragment = document.createDocumentFragment();
    daftar.forEach((p) => fragment.append(buatKartuProduk(p)));
    elDaftar.append(fragment);
  }

  elJumlah.textContent = `${daftar.length} dari ${semuaProduk.length} produk`;
}

/** Mengatur tampilan: "loading" | "error" | "sukses" */
function setStatus(status, pesan = "") {
  elLoading.hidden = status !== "loading";
  elError.hidden = status !== "error";
  if (status === "error") elPesanError.textContent = pesan;
  elCari.disabled = status !== "sukses";
}

/** Mengambil data dari API dengan Fetch API (async/await). */
async function ambilProduk() {
  setStatus("loading");
  elDaftar.replaceChildren();
  elJumlah.textContent = "";

  try {
    const response = await fetch(API_URL);

    // fetch tidak melempar error untuk status 4xx/5xx, jadi dicek manual
    if (!response.ok) {
      throw new Error(`Server mengembalikan status ${response.status}`);
    }

    const data = await response.json();
    semuaProduk = data.products; // DummyJSON membungkus array di properti "products"

    setStatus("sukses");
    tampilkanProduk(semuaProduk);
  } catch (error) {
    console.error(error);
    setStatus("error", `Data produk gagal dimuat. ${error.message}. Periksa koneksi internet lalu coba lagi.`);
  }
}

/* ---------- Event handling ---------- */

// Filter produk saat pengguna mengetik
elCari.addEventListener("input", () => {
  const kata = elCari.value.trim().toLowerCase();
  const hasil = semuaProduk.filter((p) => p.title.toLowerCase().includes(kata));
  tampilkanProduk(hasil);
});

btnCobaLagi.addEventListener("click", ambilProduk);

// Jalankan saat halaman siap
document.addEventListener("DOMContentLoaded", ambilProduk);
