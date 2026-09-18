export interface BibitSelected {
  jenisId: string;
  namaBibit: string;
  kategori: 'Peneduh' | 'Buah' | 'Konservasi';
  jumlah: number;
}

export interface NIKRecord {
  id: string;
  nik: string;
  nama: string;
  kontak: string;
  kecamatan: string;
  desa: string;
  alamatLengkap: string;
  kategoriPemohon: 'Perorangan' | 'Kelompok Tani' | 'Sekolah' | 'Instansi / Komunitas';
  batchId: string;
  batchNama: string;
  tanggalTerdaftar: string;
  tanggalPengambilan?: string;
  status: 'SUDAH_MENERIMA' | 'PROSES_VERIFIKASI' | 'SIAP_DIAMBIL' | 'DITOLAK_NIK_GANDA';
  bibit: BibitSelected[];
  totalBibit: number;
  lokasiTanam: string;
  peruntukanLahan: string;
  nomorRegistrasi: string;
  catatanPetugas?: string;
  createdAt: string;
}

export interface BatchInfo {
  id: string;
  kode: string;
  nama: string;
  tahun: number;
  periode: string;
  status: 'Selesai' | 'Aktif' | 'Ditutup';
  kuotaBibit: number;
  kuotaTersalurkan: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string;
}

export interface BibitItem {
  id: string;
  nama: string;
  namaLatin?: string;
  kategori: 'Peneduh' | 'Buah' | 'Konservasi';
  deskripsi: string;
  stokTersedia: number;
  maxPerorangan: number;
  maxKelompok: number;
  keunggulan?: string[];
  icon?: string;
  badge?: string;
}

export interface VerificationResult {
  isRegistered: boolean;
  canApply: boolean;
  statusType: 'EMPTY' | 'INVALID_FORMAT' | 'ALREADY_RECEIVED' | 'ELIGIBLE';
  record?: NIKRecord;
  message: string;
}

export interface RejectionLog {
  id: string;
  nik: string;
  timestamp: string;
  namaTerdahulu?: string;
  batchTerdahulu?: string;
  catatan: string;
}

export type AppViewMode = 'public' | 'admin';
