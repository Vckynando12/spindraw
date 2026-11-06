# 🏁 Bikini Bottom Grand Prix — Web Pengundian Tim & Hadiah

> Dokumen ini adalah **spesifikasi lengkap** untuk dikerjakan oleh Antigravity.
> Bahasa UI: **Bahasa Indonesia**. Tema: **SpongeBob versi balapan**.

---

## 1. Ringkasan

Web app dengan **2 halaman terpisah** (menu navigasi di header):

1. **Undi Tim** (`/`) — membagi peserta per kategori ke dalam beberapa tim (maks. 10 peserta/tim, kuota dibagi **seimbang**) menggunakan **1 spin wheel** berisi nama peserta. Tim diisi **berurutan**: Tim 1 sampai penuh, lalu Tim 2, dst.
2. **Undi Hadiah** (`/hadiah`) — konsep seperti **wheelofnames.com**, dengan daftar nama **sendiri** (terpisah dari Halaman 1). Sekali spin langsung memilih **10 pemenang**, ada pengaturan apakah nama terpilih dihapus atau tidak dari daftar.

Aplikasi berjalan **sepenuhnya di browser** (tanpa backend), data disimpan di `localStorage`.

---

## 2. Tech Stack

| Kebutuhan | Pilihan |
|---|---|
| Framework | Vite + React + TypeScript |
| Styling | Tailwind CSS |
| Animasi | Framer Motion + Canvas API (untuk wheel) |
| Routing | React Router |
| State | Zustand (+ middleware `persist` ke localStorage) |
| Confetti | `canvas-confetti` |
| Suara (opsional) | Howler.js / Web Audio API (bisa di-mute) |
| Export | `html-to-image` (PNG), generator CSV manual |

**Aturan acak (penting):** gunakan `crypto.getRandomValues()` untuk menentukan hasil. **Hasil ditentukan dulu secara acak, baru animasi wheel diarahkan berhenti ke hasil tersebut**, supaya adil dan bisa diuji.

---

## 3. Tema Visual: SpongeBob × Balapan

**Nama event (default, bisa diedit):** *Bikini Bottom Grand Prix*

**Palet warna**
- Kuning Spons `#FFE135` (utama)
- Biru Laut `#1CA3DE`
- Biru Tua `#0B3C5D` (background)
- Coklat Celana `#8B5A2B`
- Merah Balap `#E63946`
- Putih & hitam untuk pola **checkered flag**

**Elemen desain**
- Header dengan pola bendera kotak-kotak (checkered) dan font tebal bergaya kartun (mis. **Lilita One** / **Bangers** dari Google Fonts).
- Background laut dengan gelembung animasi + lintasan balap.
- Wheel berbentuk **ban/roda mobil balap** dengan segmen berwarna cerah; penunjuk (pointer) berbentuk **bendera finish**.
- Tombol SPIN seperti **lampu start balap** (merah → kuning → hijau, lalu wheel berputar).
- Nama tim bertema (bisa diedit), contoh: *Krusty Krab Racers, Bikini Bottom Bolts, Jellyfish Fields Turbo, Chum Bucket Speedsters, Rock Bottom Rockets, Sandy's Treedome Racers, Boating School Drifters, Flying Dutchman Ghosts*.
- Teks bertema: **"Finish! 🏁"**, **"Pit stop!"**, **"Ready to race!"**.

**Catatan aset:** SpongeBob adalah karakter berhak cipta. Gunakan **ilustrasi/emoji/SVG buatan sendiri** (spons kuning, nanas 🍍, bendera 🏁, mobil 🏎️, gelembung 🫧, kepiting 🦀). **Jangan** mengambil gambar resmi dari internet. Sediakan folder `/public/assets/` bila pengguna ingin mengganti dengan aset sendiri.

---

## 4. Halaman 1 — Undi Tim (`/`)

### 4.1 Konsep data

Peserta dibagi per **Kategori**. Contoh dari panitia:

| Kategori | Jumlah |
|---|---|
| Laki-laki usia 2 tahun | 40 peserta |
| Laki-laki usia 3 tahun | 43 peserta |
| Perempuan usia 2 tahun | 20 peserta |

Setiap kategori punya **tim sendiri**, **1 tim maksimal 10 peserta**.

### 4.2 Perhitungan jumlah tim & kuota (SEIMBANG)

```
jumlahTim = ceil(jumlahPeserta / kapasitasMaksTim)   // default kapasitas = 10
base      = floor(jumlahPeserta / jumlahTim)
sisa      = jumlahPeserta % jumlahTim
kuota tim ke-i (mulai 0) = base + 1 jika i < sisa, selain itu base
```

Contoh:
- 40 peserta → 4 tim → `10, 10, 10, 10`
- 43 peserta → 5 tim → `9, 9, 9, 8, 8`
- 20 peserta → 2 tim → `10, 10`

> Panitia belum memberi instruksi jelas, jadi **kapasitas maksimal dan jumlah tim harus bisa diubah** di Pengaturan. Jangan di-hardcode. Kuota dihitung ulang otomatis bila nilai berubah.

### 4.3 Alur penggunaan (1 wheel, pengisian berurutan)

1. **Pilih kategori** lewat tab di atas (Laki-laki 2 th, Laki-laki 3 th, Perempuan 2 th, + tombol "Tambah kategori").
2. **Input peserta**: tempel daftar nama (satu per baris) atau import CSV. Jika nama belum ada, cukup isi **jumlah peserta** dan nama otomatis menjadi "Peserta 1…N" (bisa diedit kemudian).
3. Aplikasi menghitung kuota tim (4.2) dan menampilkan **papan tim** (4.5) dengan slot kosong.
4. **Tim aktif** = tim pertama yang belum penuh (awalnya Tim 1). Tim aktif diberi sorotan (glow kuning + label "🏎️ Sedang diisi").
5. Tekan **SPIN** → **satu wheel** berisi semua peserta yang belum dapat tim → berhenti di 1 nama.
6. Nama terpilih **otomatis masuk ke tim aktif** (animasi mobil melaju dari wheel ke slot tim). Tidak ada dialog pilih tim dan tidak ada wheel kedua.
7. Setelah tim aktif **mencapai kuota**, tim itu terkunci (ditandai ✅ "Finish") dan tim aktif **otomatis pindah ke tim berikutnya**.
8. Ulangi sampai semua peserta punya tim → confetti + layar **"Finish! 🏁"** dan tombol export.

Fitur pendukung:
- **Undo** (batalkan penempatan terakhir, nama kembali ke wheel, tim aktif menyesuaikan).
- **Reset kategori** (dengan konfirmasi).
- Peserta yang sudah ditempatkan **tidak muncul lagi** di wheel.
- Tombol **Spin cepat** untuk melewati animasi panjang.
- Mode **Auto-spin** (opsional): spin berulang otomatis dengan jeda 2 detik sampai semua terbagi.
- Tombol spin dinonaktifkan selama animasi berjalan.

### 4.4 Wheel peserta

- Digambar dengan `<canvas>`, segmen berwarna bergantian (kuning, biru, merah, putih).
- Jika peserta banyak (>30), label diperkecil/dipersingkat agar terbaca; nama lengkap tampil besar saat wheel berhenti.
- Durasi putar 4–6 detik dengan easing *ease-out*, suara klik tiap melewati segmen (opsional).
- Setelah berhenti: nama tampil besar dengan animasi pop, disertai teks "Masuk ke **{Nama Tim}**!".

### 4.5 UI papan tim ala turnamen (referensi gambar 2)

Tampilan **bracket turnamen** gelap/berkelas dengan garis penghubung, diadaptasi untuk pembagian tim:

- Layout **dua sisi (kiri & kanan)**, kartu tim tersusun vertikal, dihubungkan **garis siku (elbow connector SVG)** menuju **tengah**.
- **Tengah** berisi **piala 🏆** besar dan label *"GRAND PRIX"* (menggantikan "FINAL").
- Setiap **kartu tim** menampilkan:
  - Nama tim + ikon mobil
  - Daftar slot (sesuai kuota), terisi nama atau "— kosong —"
  - Indikator kuota, misal `7 / 9`
  - Progress bar bergaya lintasan dengan mobil kecil yang maju
  - Status: *Menunggu* / *Sedang diisi* (glow) / *Finish ✅*
- Pembagian kiri-kanan: setengah tim di kiri, setengah di kanan (5 tim → 3 kiri, 2 kanan; slot sisa di tengah bawah boleh dibiarkan kosong).
- Judul di atas: nama event + nama kategori aktif.
- Responsif: di HP, bracket berubah menjadi **daftar kartu vertikal** (garis penghubung disembunyikan), tim aktif otomatis di-scroll ke tengah layar.
- Latar gelap bergradasi biru laut, garis penghubung kuning/putih.

### 4.6 Pengaturan (modal ⚙️)

- Kapasitas maksimal per tim (default **10**)
- Jumlah tim per kategori (default otomatis, bisa di-override)
- Nama tim (editable)
- Suara on/off, durasi spin, confetti on/off, auto-spin on/off

### 4.7 Hasil & Export

- **Export CSV** (kolom: Kategori, Tim, No, Nama).
- **Simpan PNG** papan tim (untuk dibagikan di grup WhatsApp panitia).
- **Cetak** (CSS print rapi, latar putih).
- Ringkasan tabel per kategori di bawah papan.

---

## 5. Halaman 2 — Undi Hadiah (`/hadiah`) — gaya wheelofnames.com

Halaman **terpisah** dengan **daftar nama sendiri** (tidak terhubung ke Halaman 1).

### 5.1 Layout (meniru wheelofnames.com)

- **Kiri/tengah:** wheel besar (ban balap) dengan pointer bendera finish. **Klik wheel atau tombol SPIN** untuk memutar.
- **Kanan:** panel dengan tab:
  - **Daftar Nama** — textarea/editor, satu nama per baris, ada counter jumlah, tombol **Acak urutan**, **Urutkan A–Z**, **Hapus semua**, **Import CSV/TXT**.
  - **Pemenang** — daftar hasil undian (riwayat), tombol **Salin**, **Export CSV**, **Hapus riwayat**.
- Wheel otomatis diperbarui real-time saat daftar nama diedit.
- Di HP: wheel di atas, panel tab di bawah.

### 5.2 Perilaku spin (10 pemenang sekali spin)

1. Atur **jumlah pemenang** (default **10**).
2. Tekan **SPIN**:
   - Sistem memilih **10 nama unik** secara acak (Fisher–Yates + `crypto.getRandomValues`) **sebelum** animasi.
   - Wheel berputar dan berhenti pada salah satu pemenang (visual). Lalu muncul **dialog hasil** berisi **10 pemenang** yang terungkap **satu per satu** (kartu balik / mobil melintas), bernomor 1–10, disertai confetti.
3. Dialog hasil punya tombol: **Tutup**, **Salin**, **Simpan PNG**.
4. Hasil otomatis masuk ke tab **Pemenang** beserta waktu dan nama hadiah.

### 5.3 Pengaturan Hadiah (modal ⚙️, mirip "Options" di wheelofnames)

| Pengaturan | Pilihan |
|---|---|
| **Setelah spin, nama terpilih…** | **Dihapus dari daftar** / **Tetap ada di daftar** *(toggle utama)* |
| Jumlah pemenang per spin | Angka (default 10) |
| Nama hadiah (opsional) | Teks, mis. "Doorprize Sepeda" |
| Durasi putar, suara, confetti | Slider / toggle |

Catatan perilaku:
- Jika **"Dihapus"**, nama pemenang dipindah ke daftar **"Sudah menang"** (bisa di-*Restore*), bukan hilang permanen.
- Jika sisa peserta **kurang dari** jumlah pemenang, tampilkan peringatan dan pilih semua yang tersisa.
- Tombol SPIN nonaktif selama animasi; wheel butuh minimal 2 nama.

---

## 6. Struktur Folder

```
src/
  main.tsx
  App.tsx
  routes/
    TeamDrawPage.tsx
    PrizeDrawPage.tsx
  components/
    SpinWheel.tsx          // canvas wheel, menerima items + hasil target (dipakai kedua halaman)
    TeamBoard.tsx          // bracket ala turnamen
    TeamCard.tsx
    BracketLines.tsx       // konektor SVG
    WinnersDialog.tsx
    WinnersPanel.tsx
    NameListEditor.tsx     // editor daftar nama ala wheelofnames
    SettingsModal.tsx
    ParticipantInput.tsx
    StartLights.tsx        // tombol spin lampu balap
    Layout.tsx             // header checkered + navigasi
  store/
    teamStore.ts
    prizeStore.ts
    settingsStore.ts
  lib/
    random.ts              // secureRandomInt, shuffle (Fisher–Yates)
    teams.ts               // hitung jumlah tim, kuota seimbang, tim aktif
    export.ts              // csv / png
  styles/
    theme.css
```

---

## 7. Tipe Data (acuan)

```ts
type Participant = { id: string; name: string };

type Team = {
  id: string;
  name: string;
  quota: number;             // hasil perhitungan seimbang
  members: Participant[];
};

type Category = {
  id: string;
  label: string;             // "Laki-laki usia 3 tahun"
  remaining: Participant[];  // yang belum dapat tim
  teams: Team[];
  history: { participantId: string; teamId: string }[]; // untuk undo
};

// Tim aktif = teams.find(t => t.members.length < t.quota)

type PrizeDraw = {
  id: string;
  prizeName?: string;
  winners: Participant[];
  drawnAt: string;           // ISO
};
```

---

## 8. Kriteria Selesai (Acceptance Criteria)

- [ ] Peserta 43 → otomatis 5 tim dengan kuota 9, 9, 9, 8, 8; tidak ada tim > 10.
- [ ] Hanya **1 wheel** di Halaman 1; hasil spin langsung masuk ke tim aktif.
- [ ] Tim diisi berurutan: Tim 1 penuh dulu, lalu otomatis pindah ke Tim 2, dst.
- [ ] Peserta yang sudah ditempatkan tidak muncul lagi di wheel.
- [ ] Papan tim tampil seperti bracket turnamen dengan piala di tengah, responsif di HP.
- [ ] Undo, reset, export CSV, export PNG berfungsi.
- [ ] Halaman Hadiah berdiri sendiri dengan daftar nama sendiri, tata letak mirip wheelofnames.com.
- [ ] Sekali spin memilih 10 pemenang unik.
- [ ] Toggle "hapus / tetap" nama terpilih bekerja dan konsisten.
- [ ] Data tetap ada setelah refresh (localStorage).
- [ ] Tema SpongeBob balapan konsisten di kedua halaman, tanpa aset berhak cipta dari internet.

---

## 9. Urutan Pengerjaan untuk Antigravity

1. Setup Vite + React + TS + Tailwind, routing, layout & tema.
2. `lib/random.ts` dan `lib/teams.ts` (+ unit test kuota untuk 40/43/20).
3. Komponen `SpinWheel` yang menerima **hasil target** dan berhenti tepat di situ.
4. Halaman Undi Tim: input peserta → wheel → penempatan berurutan ke tim aktif.
5. `TeamBoard` bergaya bracket + animasi penempatan + undo.
6. Halaman Undi Hadiah: editor daftar nama, wheel, dialog 10 pemenang, tab pemenang.
7. Pengaturan, persist localStorage, export CSV/PNG/print.
8. Polish: suara, confetti, responsif, aksesibilitas.
