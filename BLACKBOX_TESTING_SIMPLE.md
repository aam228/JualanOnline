# Blackbox Testing Sederhana - JualanOnline

## 1. Tujuan Pengujian
Pengujian ini dilakukan untuk memastikan fitur utama aplikasi bisa dipakai dengan baik dari sisi pengguna.

## 2. Ruang Lingkup
Fitur yang dicek:
- Daftar akun dan masuk akun
- Melihat produk
- Mengelola keranjang belanja
- Proses pembayaran
- Pengiriman ringkasan checkout ke WhatsApp

## 3. Flow Proses Checkout (Sederhana)
1. Pengguna memilih produk lalu masuk ke keranjang.
2. Pengguna menekan tombol checkout.
3. Pengguna mengisi data pembeli dan alamat pengiriman.
4. Sistem mengarahkan pengguna ke halaman payment gateway.
5. Pengguna menyelesaikan pembayaran di payment gateway.
6. Setelah pembayaran berhasil, sistem menampilkan hasil checkout.
7. Sistem menyiapkan template ringkasan checkout untuk dikirim ke WhatsApp.
8. Pengguna menekan kirim ke WhatsApp.
9. Ringkasan checkout terkirim ke WhatsApp tujuan.

## 4. Cara Membaca Hasil
- Kesimpulan "Lulus" jika hasil pengujian sesuai harapan.
- Kesimpulan "Gagal" jika hasil pengujian tidak sesuai harapan.

## 5. Tabel Pengujian Blackbox

| Skenario Pengujian | Test Case | Hasil Yang Diharapkan | Hasil Pengujian | Kesimpulan |
|---|---|---|---|---|
| Aplikasi dibuka | Halaman utama bisa diakses | Halaman utama tampil normal dan bisa digunakan |  |  |
| Pengguna membuat akun baru | Isi data pendaftaran dengan benar | Akun baru berhasil dibuat |  |  |
| Pengguna daftar dengan email yang sama | Daftar ulang memakai email yang sudah terpakai | Sistem menolak pendaftaran dan memberi peringatan |  |  |
| Pengguna login dengan data benar | Masukkan email dan kata sandi yang sesuai | Pengguna berhasil masuk ke akun |  |  |
| Pengguna login dengan kata sandi salah | Masukkan email benar, kata sandi salah | Sistem menolak login dan menampilkan pesan kesalahan |  |  |
| Pengguna melihat daftar produk | Buka halaman semua produk | Daftar produk tampil lengkap |  |  |
| Pengguna membuka detail produk | Klik salah satu produk | Informasi detail produk muncul |  |  |
| Pengguna menambahkan produk ke keranjang | Klik tombol tambah ke keranjang | Produk masuk ke keranjang dengan jumlah benar |  |  |
| Pengguna melihat keranjang tanpa login | Buka keranjang saat belum masuk akun | Sistem meminta pengguna login terlebih dahulu |  |  |
| Pengguna memperbarui isi keranjang | Ubah jumlah produk di keranjang | Jumlah produk dan total belanja ikut berubah |  |  |
| Pengguna lanjut ke pembayaran dengan data lengkap | Isi data pembeli lalu lanjut bayar | Proses pembayaran bisa dilanjutkan |  |  |
| Pengguna lanjut ke pembayaran dengan data tidak lengkap | Kosongkan data penting lalu lanjut bayar | Sistem menolak dan meminta data dilengkapi |  |  |
| Pengguna diarahkan ke payment gateway | Dari checkout pilih lanjut bayar | Halaman payment gateway terbuka dengan benar |  |  |
| Pembayaran berhasil di payment gateway | Selesaikan pembayaran sampai sukses | Sistem menampilkan status checkout berhasil |  |  |
| Template checkout untuk WhatsApp dibuat | Selesaikan checkout lalu pilih kirim WhatsApp | Ringkasan pesanan otomatis terisi di template WhatsApp |  |  |
| Pengiriman hasil checkout ke WhatsApp | Tekan tombol kirim WhatsApp | Data checkout terkirim ke WhatsApp tujuan |  |  |

## 6. Template Data Hasil Checkout ke WhatsApp

Contoh template yang bisa dipakai:

Halo Admin, saya sudah checkout.

Nama: [Nama Pembeli]
Nomor Pesanan: [Nomor Pesanan]
Produk: [Nama Produk]
Jumlah: [Jumlah]
Total Bayar: [Total]
Metode Pembayaran: [Metode]
Status Pembayaran: [Berhasil/Gagal]
Alamat Pengiriman: [Alamat]

Terima kasih.

## 7. Kesimpulan Sementara (Template)
Berdasarkan pengujian blackbox yang telah dilakukan, sebanyak `...` skenario berstatus lulus dan `...` skenario berstatus gagal. Secara umum, fungsi utama aplikasi `...`.

## 8. Catatan untuk Makalah
- Pengujian blackbox menilai aplikasi dari sisi pengguna, bukan dari kode program.
- Isi kolom "Hasil Pengujian" sesuai temuan saat uji.
- Tambahkan screenshot sebagai bukti agar pembahasan lebih kuat.
