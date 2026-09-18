import { BATCH_LIST, DAFTAR_BIBIT, INITIAL_NIK_RECORDS } from '../data/mockData';
import { BatchInfo, BibitItem, NIKRecord, RejectionLog, VerificationResult } from '../types';

const STORAGE_KEY_RECORDS = 'dlhp_tuban_nik_records_v1';
const STORAGE_KEY_BATCHES = 'dlhp_tuban_batches_v1';
const STORAGE_KEY_BIBIT = 'dlhp_tuban_bibit_inventory_v1';
const STORAGE_KEY_STATS = 'dlhp_tuban_stats_v1';
const STORAGE_KEY_REJECTIONS = 'dlhp_tuban_rejections_v1';
const STORAGE_KEY_AUTH = 'dlhp_tuban_admin_auth_v1';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'BibitTanaman2026',
};

export interface SystemStats {
  totalRejectedAttempts: number;
  lastCheckedAt?: string;
}

export function getStoredRecords(): NIKRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_NIK_RECORDS));
      return INITIAL_NIK_RECORDS;
    }
    return JSON.parse(data) as NIKRecord[];
  } catch (error) {
    console.error('Failed to load records from localStorage', error);
    return INITIAL_NIK_RECORDS;
  }
}

export function saveRecords(records: NIKRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save records to localStorage', error);
  }
}

export function updateRecord(id: string, updates: Partial<NIKRecord>): NIKRecord | null {
  try {
    const records = getStoredRecords();
    const idx = records.findIndex((r) => r.id === id);
    if (idx !== -1) {
      records[idx] = { ...records[idx], ...updates };
      saveRecords(records);
      return records[idx];
    }
    return null;
  } catch (e) {
    console.error('Failed to update record', e);
    return null;
  }
}

export function updateRecordStatus(recordId: string, newStatus: NIKRecord['status'], note?: string): boolean {
  try {
    const records = getStoredRecords();
    const targetIndex = records.findIndex((r) => r.id === recordId);
    if (targetIndex !== -1) {
      records[targetIndex].status = newStatus;
      if (note !== undefined) {
        records[targetIndex].catatanPetugas = note;
      }
      saveRecords(records);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to update record status', e);
    return false;
  }
}

export function deleteRecord(recordId: string): boolean {
  try {
    const records = getStoredRecords();
    const updated = records.filter((r) => r.id !== recordId);
    saveRecords(updated);
    return true;
  } catch (e) {
    console.error('Failed to delete record', e);
    return false;
  }
}

export function deleteMultipleRecords(recordIds: string[]): boolean {
  try {
    const records = getStoredRecords();
    const idSet = new Set(recordIds);
    const updated = records.filter((r) => !idSet.has(r.id));
    saveRecords(updated);
    return true;
  } catch (e) {
    console.error('Failed to delete multiple records', e);
    return false;
  }
}

// ====================================================
// BIBIT INVENTORY MANAGEMENT (STOK & JENIS BIBIT)
// ====================================================

export function getStoredBibitList(): BibitItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BIBIT);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_BIBIT, JSON.stringify(DAFTAR_BIBIT));
      return DAFTAR_BIBIT;
    }
    return JSON.parse(data) as BibitItem[];
  } catch (error) {
    console.error('Failed to load bibit inventory from localStorage', error);
    return DAFTAR_BIBIT;
  }
}

export function saveBibitList(list: BibitItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BIBIT, JSON.stringify(list));
  } catch (error) {
    console.error('Failed to save bibit inventory to localStorage', error);
  }
}

export function updateBibitStock(id: string, newStock: number): BibitItem | null {
  try {
    const list = getStoredBibitList();
    const idx = list.findIndex((b) => b.id === id);
    if (idx !== -1) {
      list[idx].stokTersedia = Math.max(0, newStock);
      saveBibitList(list);
      return list[idx];
    }
    return null;
  } catch (e) {
    console.error('Failed to update bibit stock', e);
    return null;
  }
}

export function saveOrUpdateBibitItem(item: BibitItem): boolean {
  try {
    const list = getStoredBibitList();
    const idx = list.findIndex((b) => b.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    saveBibitList(list);
    return true;
  } catch (e) {
    console.error('Failed to save/update bibit item', e);
    return false;
  }
}

export function deleteBibitItem(id: string): boolean {
  try {
    const list = getStoredBibitList();
    const updated = list.filter((b) => b.id !== id);
    saveBibitList(updated);
    return true;
  } catch (e) {
    console.error('Failed to delete bibit item', e);
    return false;
  }
}

export function getStoredBatches(): BatchInfo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BATCHES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(BATCH_LIST));
      return BATCH_LIST;
    }
    return JSON.parse(data) as BatchInfo[];
  } catch (error) {
    return BATCH_LIST;
  }
}

export function saveBatches(batches: BatchInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
  } catch (e) {
    console.error('Failed to save batches', e);
  }
}

export function deleteBatch(batchId: string): boolean {
  try {
    const batches = getStoredBatches();
    const updated = batches.filter((b) => b.id !== batchId);
    saveBatches(updated);
    return true;
  } catch (e) {
    console.error('Failed to delete batch', e);
    return false;
  }
}

export function getSystemStats(): SystemStats {
  try {
    const data = localStorage.getItem(STORAGE_KEY_STATS);
    if (!data) {
      const initial: SystemStats = { totalRejectedAttempts: 142 };
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data) as SystemStats;
  } catch (error) {
    return { totalRejectedAttempts: 142 };
  }
}

export function getRejectionLogs(): RejectionLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REJECTIONS);
    if (!data) {
      const initialLogs: RejectionLog[] = [
        {
          id: 'rej-1',
          nik: '3523011405880001',
          timestamp: '2026-09-14 14:23:10',
          namaTerdahulu: 'Ahmad Syaifuddin Zuhri',
          batchTerdahulu: 'Batch 1 - Musim Hujan 2024',
          catatan: 'Mencoba mendaftar kembali di Batch 3 (Sistem otomatis memblokir form)'
        },
        {
          id: 'rej-2',
          nik: '3523022208920003',
          timestamp: '2026-09-14 11:05:44',
          namaTerdahulu: 'Budi Santoso Wibowo',
          batchTerdahulu: 'Batch 1 - Musim Hujan 2024',
          catatan: 'Mencoba mendaftar kembali di Batch 3 (Sistem otomatis memblokir form)'
        },
        {
          id: 'rej-3',
          nik: '3523051909890002',
          timestamp: '2026-09-13 16:40:12',
          namaTerdahulu: 'Dedi Kurniawan',
          batchTerdahulu: 'Batch 2 - Tuban Asri 2025',
          catatan: 'Mencoba mendaftar kembali di Batch 3 (Sistem otomatis memblokir form)'
        }
      ];
      localStorage.setItem(STORAGE_KEY_REJECTIONS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(data) as RejectionLog[];
  } catch (e) {
    return [];
  }
}

export function logRejection(nik: string, record?: NIKRecord): void {
  try {
    const logs = getRejectionLogs();
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: RejectionLog = {
      id: `rej-${Date.now()}`,
      nik,
      timestamp: timeStr,
      namaTerdahulu: record?.nama,
      batchTerdahulu: record?.batchNama,
      catatan: `Mencoba mengajukan permohonan baru pada ${timeStr} padahal sudah terdaftar di ${record?.batchNama || 'Batch sebelumnya'}. Form otomatis terkunci.`
    };
    const updated = [newLog, ...logs.slice(0, 49)];
    localStorage.setItem(STORAGE_KEY_REJECTIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log rejection', e);
  }
}

export function incrementRejectedStats(nik?: string, record?: NIKRecord): void {
  try {
    const stats = getSystemStats();
    stats.totalRejectedAttempts += 1;
    stats.lastCheckedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    if (nik) {
      logRejection(nik, record);
    }
  } catch (error) {
    console.error('Failed to increment rejected stats', error);
  }
}

export function verifyNIK(rawNik: string): VerificationResult {
  const cleanNik = rawNik.trim().replace(/\s+/g, '');

  if (!cleanNik) {
    return {
      isRegistered: false,
      canApply: false,
      statusType: 'EMPTY',
      message: 'Silakan masukkan 16 digit NIK KTP Anda untuk memulai verifikasi.',
    };
  }

  // Cek apakah 16 digit angka
  if (!/^\d{16}$/.test(cleanNik)) {
    return {
      isRegistered: false,
      canApply: false,
      statusType: 'INVALID_FORMAT',
      message: 'Format NIK tidak valid. NIK KTP wajib terdiri dari tepat 16 digit angka (contoh: 3523xxxxxxxxxxxx).',
    };
  }

  const allRecords = getStoredRecords();
  const existing = allRecords.find((r) => r.nik === cleanNik);

  if (existing) {
    // Increment rejected counter & log rejection
    incrementRejectedStats(cleanNik, existing);
    return {
      isRegistered: true,
      canApply: false,
      statusType: 'ALREADY_RECEIVED',
      record: existing,
      message: `Pendaftaran Ditolak: NIK ${cleanNik} telah terdaftar sebagai penerima bibit pada ${existing.batchNama}. Berdasarkan regulasi DLHP Tuban, 1 NIK hanya dapat menerima bantuan 1 kali demi pemerataan bantuan bagi seluruh masyarakat.`,
    };
  }

  return {
    isRegistered: false,
    canApply: true,
    statusType: 'ELIGIBLE',
    message: `NIK ${cleanNik} memenuhi syarat! NIK Anda belum pernah terdaftar di batch sebelumnya. Silakan lanjutkan pengisian formulir data diri di bawah ini.`,
  };
}

export function submitNewApplication(newApp: Omit<NIKRecord, 'id' | 'nomorRegistrasi' | 'createdAt' | 'status'>): {
  success: boolean;
  record?: NIKRecord;
  error?: string;
} {
  const allRecords = getStoredRecords();
  
  // Double-check race condition or duplicate
  const cleanNik = newApp.nik.trim();
  const existing = allRecords.find((r) => r.nik === cleanNik);
  if (existing) {
    return {
      success: false,
      error: `NIK ${cleanNik} sudah terdaftar pada ${existing.batchNama}. Formulir tidak dapat diproses.`,
    };
  }

  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const record: NIKRecord = {
    ...newApp,
    id: `rec-${Date.now()}`,
    nomorRegistrasi: `DLHP-TBN-2026-${randomSeq}`,
    status: 'SIAP_DIAMBIL',
    tanggalTerdaftar: dateStr,
    tanggalPengambilan: 'Estimasi 3 Hari Kerja setelah pendaftaran',
    createdAt: now.toISOString(),
  };

  const updatedRecords = [record, ...allRecords];
  saveRecords(updatedRecords);

  // Update seedling inventory stocks
  try {
    const bibitList = getStoredBibitList();
    record.bibit.forEach((item) => {
      const targetBibit = bibitList.find((b) => b.id === item.jenisId);
      if (targetBibit) {
        targetBibit.stokTersedia = Math.max(0, targetBibit.stokTersedia - item.jumlah);
      }
    });
    saveBibitList(bibitList);
  } catch (e) {
    console.error('Error reducing bibit stock', e);
  }

  // Update active batch quota
  try {
    const batches = getStoredBatches();
    const activeBatch = batches.find((b) => b.id === record.batchId);
    if (activeBatch) {
      activeBatch.kuotaTersalurkan += record.totalBibit;
      saveBatches(batches);
    }
  } catch (e) {
    console.error('Error updating batch quota', e);
  }

  return {
    success: true,
    record,
  };
}

export function resetDatabaseToDefault(): void {
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_NIK_RECORDS));
  localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(BATCH_LIST));
  localStorage.setItem(STORAGE_KEY_BIBIT, JSON.stringify(DAFTAR_BIBIT));
  localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify({ totalRejectedAttempts: 142 }));
  localStorage.removeItem(STORAGE_KEY_REJECTIONS);
}

// Authentication Helpers
export function isAdminAuthenticated(): boolean {
  try {
    const auth = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!auth) return false;
    const parsed = JSON.parse(auth);
    return parsed?.isLoggedIn === true && parsed?.role === 'ADMIN_UTAMA';
  } catch (e) {
    return false;
  }
}

export function setAdminAuthenticated(isAuth: boolean): void {
  try {
    if (isAuth) {
      localStorage.setItem(
        STORAGE_KEY_AUTH,
        JSON.stringify({
          isLoggedIn: true,
          role: 'ADMIN_UTAMA',
          username: 'admin',
          nama: 'Admin Utama DLHP Tuban',
          loginAt: new Date().toISOString(),
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  } catch (e) {
    console.error('Failed to set auth status', e);
  }
}

export function exportRecordsToCSV(records: NIKRecord[]): void {
  const headers = [
    'No',
    'Nomor Registrasi',
    'NIK',
    'Nama Lengkap',
    'Kontak/WA',
    'Kecamatan',
    'Desa',
    'Kategori',
    'Batch',
    'Total Bibit',
    'Rincian Bibit',
    'Lokasi Tanam',
    'Status',
    'Tanggal Terdaftar',
  ];

  const rows = records.map((r, idx) => {
    const bibitList = r.bibit.map((b) => `${b.namaBibit} (${b.jumlah})`).join('; ');
    return [
      idx + 1,
      r.nomorRegistrasi,
      `'${r.nik}`,
      `"${r.nama.replace(/"/g, '""')}"`,
      r.kontak,
      r.kecamatan,
      r.desa,
      r.kategoriPemohon,
      `"${r.batchNama}"`,
      r.totalBibit,
      `"${bibitList}"`,
      `"${r.lokasiTanam.replace(/"/g, '""')}"`,
      r.status,
      r.tanggalTerdaftar,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DLHP_Tuban_Data_Penerima_Bibit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

