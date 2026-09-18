import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Layers,
  Sprout,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Eye,
  Trash2,
  Edit3,
  AlertTriangle,
  UserCheck,
  Users,
  LogOut,
  Sparkles,
  Award,
  BookOpen,
  ArrowUpRight,
  Trees,
  CheckSquare,
  Square,
  Save,
  SlidersHorizontal
} from 'lucide-react';
import { BatchInfo, NIKRecord, RejectionLog } from '../types';
import {
  exportRecordsToCSV,
  getRejectionLogs,
  resetDatabaseToDefault,
  updateRecordStatus,
  updateRecord,
  deleteRecord,
  deleteMultipleRecords,
  deleteBatch,
  saveBatches
} from '../services/storage';
import { DAFTAR_BIBIT, KECAMATAN_TUBAN } from '../data/mockData';
import { AdminSeedlingManagement } from './AdminSeedlingManagement';

interface AdminDashboardViewProps {
  records: NIKRecord[];
  batches: BatchInfo[];
  totalRejectedAttempts: number;
  onRefreshData: () => void;
  onViewReceipt: (record: NIKRecord) => void;
  onSwitchToPublic: () => void;
  onLogout: () => void;
}

type AdminTab = 'data-pemohon' | 'kelola-stok' | 'statistik' | 'kelola-batch' | 'input-riwayat' | 'log-penolakan';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  records,
  batches,
  totalRejectedAttempts,
  onRefreshData,
  onViewReceipt,
  onSwitchToPublic,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('data-pemohon');

  // Table Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('ALL');

  // Bulk Selection State
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Edit Record Modal State
  const [recordToEdit, setRecordToEdit] = useState<NIKRecord | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editNik, setEditNik] = useState('');
  const [editKontak, setEditKontak] = useState('');
  const [editKecamatan, setEditKecamatan] = useState('');
  const [editDesa, setEditDesa] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editTotalBibit, setEditTotalBibit] = useState(1);
  const [editCatatan, setEditCatatan] = useState('');
  const [editStatus, setEditStatus] = useState<NIKRecord['status']>('SIAP_DIAMBIL');

  // Manual Historical Record Form State
  const [manualNik, setManualNik] = useState('');
  const [manualNama, setManualNama] = useState('');
  const [manualKecamatan, setManualKecamatan] = useState(KECAMATAN_TUBAN[0]);
  const [manualDesa, setManualDesa] = useState('');
  const [manualKontak, setManualKontak] = useState('');
  const [manualBatchId, setManualBatchId] = useState('batch-1');
  const [manualTotalBibit, setManualTotalBibit] = useState(5);
  const [manualJenisBibit, setManualJenisBibit] = useState('Tabebuya Kuning');
  const [manualStatus, setManualStatus] = useState<NIKRecord['status']>('SUDAH_MENERIMA');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // New / Edit Batch Form State
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchInfo | null>(null);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchKode, setNewBatchKode] = useState('');
  const [newBatchYear, setNewBatchYear] = useState(2027);
  const [newBatchPeriode, setNewBatchPeriode] = useState('Maret 2027 - Mei 2027');
  const [newBatchQuota, setNewBatchQuota] = useState(25000);
  const [newBatchDesc, setNewBatchDesc] = useState('');
  const [batchToDelete, setBatchToDelete] = useState<BatchInfo | null>(null);

  // Status Change Confirmation Modal
  const [selectedRecordForStatus, setSelectedRecordForStatus] = useState<NIKRecord | null>(null);
  const [newStatusTarget, setNewStatusTarget] = useState<NIKRecord['status']>('SUDAH_MENERIMA');
  const [statusNote, setStatusNote] = useState('');

  // Delete Confirmation (Single)
  const [recordToDelete, setRecordToDelete] = useState<NIKRecord | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Rejection Logs State
  const rejectionLogs: RejectionLog[] = useMemo(() => getRejectionLogs(), [records, totalRejectedAttempts]);

  // Statistics Calculation
  const totalBibitTersalurkan = useMemo(() => {
    return records.reduce((acc, r) => acc + (r.totalBibit || 0), 0);
  }, [records]);

  const activeBatch = useMemo(() => {
    return batches.find((b) => b.status === 'Aktif') || batches[0];
  }, [batches]);

  const remainingQuota = useMemo(() => {
    if (!activeBatch) return 0;
    return Math.max(0, activeBatch.kuotaBibit - activeBatch.kuotaTersalurkan);
  }, [activeBatch]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.nik.includes(searchQuery.trim()) ||
        r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nomorRegistrasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.desa.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBatch = filterBatch === 'ALL' || r.batchId === filterBatch;
      const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
      const matchKecamatan = filterKecamatan === 'ALL' || r.kecamatan === filterKecamatan;

      return matchSearch && matchBatch && matchStatus && matchKecamatan;
    });
  }, [records, searchQuery, filterBatch, filterStatus, filterKecamatan]);

  // Grouped stats by Kecamatan
  const statsByKecamatan = useMemo(() => {
    const map: Record<string, { count: number; totalBibit: number }> = {};
    records.forEach((r) => {
      if (!map[r.kecamatan]) {
        map[r.kecamatan] = { count: 0, totalBibit: 0 };
      }
      map[r.kecamatan].count += 1;
      map[r.kecamatan].totalBibit += r.totalBibit || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].totalBibit - a[1].totalBibit);
  }, [records]);

  // Grouped stats by Seedling Type
  const statsByBibit = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      r.bibit?.forEach((b) => {
        map[b.namaBibit] = (map[b.namaBibit] || 0) + (b.jumlah || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [records]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedRecordIds.length === filteredRecords.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(filteredRecords.map((r) => r.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDelete = () => {
    if (selectedRecordIds.length === 0) return;
    deleteMultipleRecords(selectedRecordIds);
    showToast(`${selectedRecordIds.length} data pemohon berhasil dihapus.`);
    setSelectedRecordIds([]);
    setShowBulkDeleteModal(false);
    onRefreshData();
  };

  // Open Edit Modal for a Record
  const handleOpenEditRecord = (rec: NIKRecord) => {
    setRecordToEdit(rec);
    setEditNama(rec.nama);
    setEditNik(rec.nik);
    setEditKontak(rec.kontak);
    setEditKecamatan(rec.kecamatan);
    setEditDesa(rec.desa);
    setEditAlamat(rec.alamatLengkap);
    setEditTotalBibit(rec.totalBibit || 1);
    setEditCatatan(rec.catatanPetugas || '');
    setEditStatus(rec.status);
  };

  const handleSaveEditRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordToEdit) return;

    const updated = updateRecord(recordToEdit.id, {
      nama: editNama.trim(),
      nik: editNik.trim(),
      kontak: editKontak.trim(),
      kecamatan: editKecamatan,
      desa: editDesa.trim(),
      alamatLengkap: editAlamat.trim(),
      totalBibit: Number(editTotalBibit),
      catatanPetugas: editCatatan.trim() || undefined,
      status: editStatus,
    });

    if (updated) {
      showToast(`Data pemohon "${updated.nama}" berhasil diperbarui.`);
      setRecordToEdit(null);
      onRefreshData();
    }
  };

  // Handle Save Manual Historical Record
  const handleSaveManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNik = manualNik.trim();
    if (!cleanNik || cleanNik.length !== 16) {
      alert('NIK wajib 16 digit angka.');
      return;
    }

    const existing = records.find((r) => r.nik === cleanNik);
    if (existing) {
      alert(`NIK ${cleanNik} sudah terdaftar sebelumnya pada ${existing.batchNama}!`);
      return;
    }

    const selectedBatch = batches.find((b) => b.id === manualBatchId) || batches[0];
    const newRecord: NIKRecord = {
      id: `rec-manual-${Date.now()}`,
      nik: cleanNik,
      nama: manualNama.trim() || 'Warga Terdata',
      kontak: manualKontak.trim() || '08xxxxxxxxxx',
      kecamatan: manualKecamatan,
      desa: manualDesa.trim() || 'Desa Setempat',
      alamatLengkap: `Kec. ${manualKecamatan}, Kab. Tuban`,
      kategoriPemohon: 'Perorangan',
      batchId: selectedBatch.id,
      batchNama: selectedBatch.nama,
      tanggalTerdaftar: selectedBatch.tanggalMulai,
      tanggalPengambilan: selectedBatch.tanggalMulai,
      status: manualStatus,
      bibit: [
        {
          jenisId: 'manual-input',
          namaBibit: manualJenisBibit,
          kategori: 'Peneduh',
          jumlah: Number(manualTotalBibit),
        },
      ],
      totalBibit: Number(manualTotalBibit),
      lokasiTanam: `Pekarangan Rumah / Lahan Warga di ${manualKecamatan}`,
      peruntukanLahan: 'Penghijauan Lingkungan Mandiri',
      nomorRegistrasi: `DLHP-ARSIP-${selectedBatch.tahun}-${Math.floor(1000 + Math.random() * 9000)}`,
      catatanPetugas: 'Diinput oleh Admin Utama dari arsip fisik DLHP',
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    localStorage.setItem('dlhp_tuban_nik_records_v1', JSON.stringify(updated));
    onRefreshData();

    setManualSuccessMsg(
      `Berhasil! NIK ${cleanNik} (${newRecord.nama}) telah tersimpan ke ${selectedBatch.nama}. NIK ini sekarang diproteksi dan otomatis tertolak jika mencoba mendaftar di Portal Umum.`
    );
    setManualNik('');
    setManualNama('');
    setManualDesa('');
    setManualKontak('');
  };

  // Handle Update Status
  const handleConfirmStatusChange = () => {
    if (!selectedRecordForStatus) return;
    updateRecordStatus(selectedRecordForStatus.id, newStatusTarget, statusNote);
    onRefreshData();
    showToast(`Status permohonan berhasil diubah ke "${newStatusTarget}".`);
    setSelectedRecordForStatus(null);
    setStatusNote('');
  };

  // Handle Delete Record (Single)
  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    deleteRecord(recordToDelete.id);
    onRefreshData();
    showToast(`Data pemohon ${recordToDelete.nama} berhasil dihapus.`);
    setRecordToDelete(null);
  };

  // Handle Add or Edit Batch
  const handleOpenAddBatch = () => {
    setEditingBatch(null);
    setNewBatchName('');
    setNewBatchKode(`BATCH-2027-0${batches.length + 1}`);
    setNewBatchYear(2027);
    setNewBatchPeriode('Maret 2027 - Mei 2027');
    setNewBatchQuota(25000);
    setNewBatchDesc('Batch Penyaluran Bibit Tanaman Kabupaten Tuban');
    setShowAddBatchModal(true);
  };

  const handleOpenEditBatch = (batch: BatchInfo) => {
    setEditingBatch(batch);
    setNewBatchName(batch.nama);
    setNewBatchKode(batch.kode);
    setNewBatchYear(batch.tahun);
    setNewBatchPeriode(batch.periode);
    setNewBatchQuota(batch.kuotaBibit);
    setNewBatchDesc(batch.keterangan || '');
    setShowAddBatchModal(true);
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim() || !newBatchKode.trim()) return;

    if (editingBatch) {
      const updated = batches.map((b) =>
        b.id === editingBatch.id
          ? {
              ...b,
              nama: newBatchName.trim(),
              kode: newBatchKode.toUpperCase().trim(),
              tahun: Number(newBatchYear),
              periode: newBatchPeriode.trim(),
              kuotaBibit: Number(newBatchQuota),
              keterangan: newBatchDesc.trim(),
            }
          : b
      );
      saveBatches(updated);
      showToast(`Batch "${newBatchName}" berhasil diperbarui.`);
    } else {
      const newBatch: BatchInfo = {
        id: `batch-${Date.now()}`,
        kode: newBatchKode.toUpperCase().trim(),
        nama: newBatchName.trim(),
        tahun: Number(newBatchYear),
        periode: newBatchPeriode.trim(),
        status: 'Ditutup',
        kuotaBibit: Number(newBatchQuota),
        kuotaTersalurkan: 0,
        tanggalMulai: `${newBatchYear}-01-01`,
        tanggalSelesai: `${newBatchYear}-12-31`,
        keterangan: newBatchDesc.trim() || 'Batch penyaluran bibit Kabupaten Tuban',
      };
      saveBatches([...batches, newBatch]);
      showToast(`Batch baru "${newBatch.nama}" berhasil dibuat.`);
    }

    onRefreshData();
    setShowAddBatchModal(false);
    setEditingBatch(null);
  };

  const handleConfirmDeleteBatch = () => {
    if (!batchToDelete) return;
    deleteBatch(batchToDelete.id);
    showToast(`Batch "${batchToDelete.nama}" telah dihapus.`);
    setBatchToDelete(null);
    onRefreshData();
  };

  const handleSetActiveBatch = (batchId: string) => {
    const updated = batches.map((b) => ({
      ...b,
      status: b.id === batchId ? ('Aktif' as const) : b.status === 'Aktif' ? ('Selesai' as const) : b.status,
    }));
    saveBatches(updated);
    showToast('Batch aktif pendaftaran berhasil diperbarui.');
    onRefreshData();
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh database ke data awal standar DLHP Tuban?')) {
      resetDatabaseToDefault();
      onRefreshData();
      showToast('Database berhasil direset ke standar awal DLHP Tuban.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xl border animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-red-900 text-red-100 border-red-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Branding & Role Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                    Dashboard Admin Utama
                  </h1>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    Superadmin DLHP Tuban
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Pusat Pengelolaan & Pengecekan Data Penyaluran Bibit Tanaman Gratis
                </p>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                id="btn-admin-switch-public"
                onClick={onSwitchToPublic}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sprout className="w-4 h-4 text-emerald-200" />
                <span>Lihat Tampilan Umum</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-admin-export-csv"
                onClick={() => exportRecordsToCSV(records)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ekspor</span> CSV
              </button>

              <button
                id="btn-admin-logout"
                onClick={onLogout}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-1 py-2 text-xs no-scrollbar">
            <button
              onClick={() => setActiveTab('data-pemohon')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'data-pemohon'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Kelola Data Pemohon</span>
              <span className="px-1.5 py-0.2 bg-slate-900 text-emerald-300 rounded-full text-[10px] font-mono font-normal">
                {records.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('kelola-stok')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'kelola-stok'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>Kelola Stok & Jenis Bibit</span>
              <span className="px-1.5 py-0.2 bg-slate-900 text-teal-300 rounded-full text-[10px] font-mono font-normal">
                Nursery
              </span>
            </button>

            <button
              onClick={() => setActiveTab('statistik')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'statistik'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistik & Sebaran Wilayah</span>
            </button>

            <button
              onClick={() => setActiveTab('kelola-batch')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'kelola-batch'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manajemen Batch & Kuota</span>
              <span className="px-1.5 py-0.2 bg-slate-900 text-amber-300 rounded-full text-[10px] font-mono font-normal">
                {batches.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('input-riwayat')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'input-riwayat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Riwayat NIK Manual</span>
            </button>

            <button
              onClick={() => setActiveTab('log-penolakan')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'log-penolakan'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Deteksi NIK Ganda</span>
              <span className="px-1.5 py-0.2 bg-red-950 text-red-300 rounded-full text-[10px] font-mono font-normal border border-red-800/40">
                {totalRejectedAttempts}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top 4 KPI Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Pemohon Terdata
              </span>
              <div className="text-2xl font-extrabold text-slate-900">{records.length}</div>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>Penerima di 20 Kecamatan</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bibit Telah Dialokasikan
              </span>
              <div className="text-2xl font-extrabold text-emerald-700">
                {totalBibitTersalurkan.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500">Pohon Peneduh & Produktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Sprout className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Penolakan NIK Duplikasi
              </span>
              <div className="text-2xl font-extrabold text-red-600">{totalRejectedAttempts}</div>
              <p className="text-[11px] text-red-600/80 font-medium">Dicegah oleh Sistem NIK</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sisa Kuota Batch Aktif
              </span>
              <div className="text-2xl font-extrabold text-amber-600">
                {remainingQuota.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{activeBatch?.nama}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* TAB 1: KELOLA & CEK DATA PEMOHON */}
        {activeTab === 'data-pemohon' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
            {/* Table Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Database Master Pemohon Bibit</h3>
                <p className="text-xs text-slate-500">
                  Daftar seluruh penerima bantuan bibit tanaman di Kabupaten Tuban lintas batch
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {selectedRecordIds.length > 0 && (
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs animate-in fade-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus ({selectedRecordIds.length}) Terpilih</span>
                  </button>
                )}

                <button
                  onClick={onRefreshData}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Muat ulang data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan</span>
                </button>
                <button
                  onClick={() => exportRecordsToCSV(filteredRecords)}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Data ({filteredRecords.length})</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIK, Nama, No. Reg..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                />
              </div>

              {/* Batch Filter */}
              <div>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                >
                  <option value="ALL">Semua Batch Penyaluran</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                >
                  <option value="ALL">Semua Status Permohonan</option>
                  <option value="SIAP_DIAMBIL">Siap Diambil di Nursery</option>
                  <option value="SUDAH_MENERIMA">Sudah Diambil / Selesai</option>
                  <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
                  <option value="DITOLAK_NIK_GANDA">Ditolak NIK Ganda</option>
                </select>
              </div>

              {/* Kecamatan Filter */}
              <div>
                <select
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                >
                  <option value="ALL">Semua 20 Kecamatan</option>
                  {KECAMATAN_TUBAN.map((kec) => (
                    <option key={kec} value={kec}>
                      Kec. {kec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Body */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-inner bg-white">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3 py-3 text-center w-10">
                      <button
                        onClick={handleToggleSelectAll}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Pilih Semua"
                      >
                        {selectedRecordIds.length > 0 && selectedRecordIds.length === filteredRecords.length ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-3">No. Registrasi</th>
                    <th className="px-3 py-3">NIK Pemohon</th>
                    <th className="px-3 py-3">Nama & Kontak</th>
                    <th className="px-3 py-3">Domisili</th>
                    <th className="px-3 py-3">Bibit Dimohon</th>
                    <th className="px-3 py-3">Batch</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-center">Aksi Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Database className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-600">Tidak ada data yang sesuai filter</p>
                          <p className="text-[11px]">Coba ubah kata kunci pencarian atau reset filter</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const isSelected = selectedRecordIds.includes(rec.id);
                      return (
                        <tr
                          key={rec.id}
                          className={`transition ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50/80'}`}
                        >
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleToggleSelectRow(rec.id)}
                              className="cursor-pointer text-slate-400 hover:text-emerald-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-3 font-mono font-bold text-emerald-900 whitespace-nowrap">
                            {rec.nomorRegistrasi}
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-mono font-bold text-slate-900 block bg-slate-100 px-2 py-0.5 rounded text-[11px] w-fit">
                              {rec.nik}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <strong className="text-slate-900 block font-semibold">{rec.nama}</strong>
                            <span className="text-[11px] text-slate-500">{rec.kontak}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-medium text-slate-800 block">Kec. {rec.kecamatan}</span>
                            <span className="text-[11px] text-slate-500">Desa {rec.desa}</span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-bold text-emerald-800 text-xs">
                              {rec.totalBibit} Batang
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                              {rec.bibit?.map((b) => `${b.namaBibit} (${b.jumlah})`).join(', ') || `${rec.totalBibit} bibit`}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px] whitespace-nowrap block w-fit">
                              {rec.batchNama}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{rec.tanggalTerdaftar}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {rec.status === 'SUDAH_MENERIMA' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Sudah Diambil</span>
                              </span>
                            )}
                            {rec.status === 'SIAP_DIAMBIL' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>Siap Diambil</span>
                              </span>
                            )}
                            {rec.status === 'PROSES_VERIFIKASI' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Verifikasi</span>
                              </span>
                            )}
                            {rec.status === 'DITOLAK_NIK_GANDA' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* View Receipt */}
                              <button
                                onClick={() => onViewReceipt(rec)}
                                title="Lihat Surat Tanda Terima / SPB"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Record */}
                              <button
                                onClick={() => handleOpenEditRecord(rec)}
                                title="Edit Data Pemohon"
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {/* Change Status */}
                              <button
                                onClick={() => {
                                  setSelectedRecordForStatus(rec);
                                  setNewStatusTarget(rec.status);
                                  setStatusNote(rec.catatanPetugas || '');
                                }}
                                title="Ubah Status Pengambilan"
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setRecordToDelete(rec)}
                                title="Hapus Data"
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Counter */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 gap-2">
              <div>
                Menampilkan <strong>{filteredRecords.length}</strong> dari total <strong>{records.length}</strong> data pemohon
                {selectedRecordIds.length > 0 && (
                  <span className="ml-2 font-bold text-emerald-700">
                    ({selectedRecordIds.length} data terpilih)
                  </span>
                )}
              </div>
              <button
                onClick={handleResetData}
                className="text-xs text-slate-400 hover:text-red-600 transition underline cursor-pointer"
              >
                Reset Database ke Data Contoh Asli DLHP
              </button>
            </div>
          </section>
        )}

        {/* TAB 2: KELOLA STOK & JENIS BIBIT TANAMAN */}
        {activeTab === 'kelola-stok' && (
          <AdminSeedlingManagement onInventoryChanged={onRefreshData} />
        )}

        {/* TAB 3: STATISTIK & SEBARAN WILAYAH */}
        {activeTab === 'statistik' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sebaran 20 Kecamatan */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Sebaran Bantuan per Kecamatan</h3>
                    <p className="text-xs text-slate-500">Pemerataan bibit di 20 Kecamatan se-Kabupaten Tuban</p>
                  </div>
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {statsByKecamatan.map(([kec, data]) => {
                    const percentage = Math.round((data.totalBibit / (totalBibitTersalurkan || 1)) * 100);
                    return (
                      <div key={kec} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                          <span>Kec. {kec}</span>
                          <span className="font-mono text-emerald-700">
                            {data.totalBibit} bibit ({data.count} pemohon)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage * 2, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distribusi Jenis Bibit */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Distribusi Jenis Pohon & Bibit</h3>
                    <p className="text-xs text-slate-500">Varietas tanaman yang paling banyak diminati masyarakat</p>
                  </div>
                  <Sprout className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {statsByBibit.map(([nama, count]) => (
                    <div key={nama} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{nama}</strong>
                          <span className="text-[11px] text-slate-500">Pohon Penghijauan Tuban</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-emerald-700">
                        {count.toLocaleString('id-ID')} bibit
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MANAJEMEN BATCH & KUOTA */}
        {activeTab === 'kelola-batch' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Manajemen Batch & Periode Penyaluran</h3>
                <p className="text-xs text-slate-500">
                  Atur batch aktif untuk pendaftaran masyarakat di portal umum serta alokasi kuota bibit
                </p>
              </div>

              <button
                onClick={handleOpenAddBatch}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Batch Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className={`p-5 rounded-2xl border transition relative space-y-4 ${
                    batch.status === 'Aktif'
                      ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-xs font-bold">
                      {batch.kode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        batch.status === 'Aktif'
                          ? 'bg-emerald-600 text-white'
                          : batch.status === 'Selesai'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{batch.nama}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.periode}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{batch.keterangan}</p>

                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Alokasi Kuota:</span>
                      <strong className="text-slate-900">{batch.kuotaBibit.toLocaleString('id-ID')} bibit</strong>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Telah Disalurkan:</span>
                      <strong className="text-emerald-700">
                        {batch.kuotaTersalurkan.toLocaleString('id-ID')} bibit
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    {batch.status !== 'Aktif' ? (
                      <button
                        onClick={() => handleSetActiveBatch(batch.id)}
                        className="w-full py-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Jadikan Batch Aktif Pendaftaran</span>
                      </button>
                    ) : (
                      <div className="py-2 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold text-center border border-emerald-300 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Sedang Dibuka di Portal Umum</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => handleOpenEditBatch(batch)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setBatchToDelete(batch)}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: INPUT RIWAYAT NIK MANUAL */}
        {activeTab === 'input-riwayat' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900">Input Data Riwayat Penerima Bibit (Arsip NIK)</h3>
              <p className="text-xs text-slate-500">
                Gunakan form ini untuk memasukkan data NIK penerima masa lalu (misal Batch 1 2024 / Batch 2 2025). NIK
                yang disimpan di sini akan langsung terlindungi dan <strong>otomatis tertolak</strong> jika pemohon
                tersebut mencoba mendaftar kembali di Portal Umum.
              </p>
            </div>

            {manualSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Data Riwayat Berhasil Ditambahkan!</strong>
                  <p>{manualSuccessMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveManualRecord} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    NIK KTP Pemohon (16 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={manualNik}
                    onChange={(e) => setManualNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 352301xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nama Lengkap Pemohon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualNama}
                    onChange={(e) => setManualNama(e.target.value)}
                    placeholder="Nama lengkap sesuai KTP"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kecamatan Domisili di Kab. Tuban <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={manualKecamatan}
                    onChange={(e) => setManualKecamatan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
                  >
                    {KECAMATAN_TUBAN.map((k) => (
                      <option key={k} value={k}>
                        Kecamatan {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Desa / Kelurahan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualDesa}
                    onChange={(e) => setManualDesa(e.target.value)}
                    placeholder="Nama desa atau kelurahan"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Batch Penyaluran yang Diterima <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={manualBatchId}
                    onChange={(e) => setManualBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-600 font-bold"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama} ({b.periode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Jumlah Bibit Diterima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={manualTotalBibit}
                    onChange={(e) => setManualTotalBibit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Arsip NIK ke Database</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: LOG DETEKSI NIK GANDA */}
        {activeTab === 'log-penolakan' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Log Percobaan NIK Ganda (Otomatis Tertolak)</h3>
                <p className="text-xs text-slate-500">
                  Daftar NIK yang mencoba mendaftar kembali pada batch aktif namun tertolak oleh sistem
                </p>
              </div>
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-inner bg-white">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Waktu Percobaan</th>
                    <th className="px-4 py-3">NIK Terblokir</th>
                    <th className="px-4 py-3">Nama Pemegang NIK</th>
                    <th className="px-4 py-3">Riwayat Batch Asal</th>
                    <th className="px-4 py-3">Tindakan Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rejectionLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Belum ada riwayat percobaan penolakan NIK yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    rejectionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                            {log.nik}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{log.namaTerdahulu || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{log.batchTerdahulu || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Otomatis Diblokir & Form Terkunci</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Edit Data Pemohon */}
      {recordToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Data Pemohon Bibit</h3>
              <button
                type="button"
                onClick={() => setRecordToEdit(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Pemohon:</label>
                  <input
                    type="text"
                    required
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">NIK (16 Digit):</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={editNik}
                    onChange={(e) => setEditNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. HP / WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={editKontak}
                    onChange={(e) => setEditKontak(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kecamatan:</label>
                  <select
                    value={editKecamatan}
                    onChange={(e) => setEditKecamatan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900 font-semibold"
                  >
                    {KECAMATAN_TUBAN.map((k) => (
                      <option key={k} value={k}>
                        Kecamatan {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Desa / Kelurahan:</label>
                  <input
                    type="text"
                    required
                    value={editDesa}
                    onChange={(e) => setEditDesa(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Bibit:</label>
                  <input
                    type="number"
                    min={1}
                    value={editTotalBibit}
                    onChange={(e) => setEditTotalBibit(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Alamat Lengkap:</label>
                <textarea
                  rows={2}
                  value={editAlamat}
                  onChange={(e) => setEditAlamat(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status Penyerahan:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900 font-bold"
                  >
                    <option value="SIAP_DIAMBIL">Siap Diambil di Persemaian</option>
                    <option value="SUDAH_MENERIMA">Sudah Diambil / Selesai</option>
                    <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
                    <option value="DITOLAK_NIK_GANDA">Ditolak NIK Ganda</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Catatan Petugas:</label>
                  <input
                    type="text"
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    placeholder="Catatan verifikasi..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecordToEdit(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Status Permohonan */}
      {selectedRecordForStatus && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Ubah Status Penerimaan Bibit</h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>
                <span className="text-slate-500">Nama:</span>{' '}
                <strong className="text-slate-800">{selectedRecordForStatus.nama}</strong>
              </div>
              <div>
                <span className="text-slate-500">NIK:</span>{' '}
                <span className="font-mono font-bold text-slate-800">{selectedRecordForStatus.nik}</span>
              </div>
              <div>
                <span className="text-slate-500">No. Registrasi:</span>{' '}
                <span className="font-mono text-emerald-800">{selectedRecordForStatus.nomorRegistrasi}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Pilih Status Baru:</label>
              <select
                value={newStatusTarget}
                onChange={(e) => setNewStatusTarget(e.target.value as NIKRecord['status'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none"
              >
                <option value="SIAP_DIAMBIL">Siap Diambil di Persemaian</option>
                <option value="SUDAH_MENERIMA">Sudah Diambil (Selesai Serah Terima)</option>
                <option value="PROSES_VERIFIKASI">Proses Verifikasi Lapangan</option>
                <option value="DITOLAK_NIK_GANDA">Ditolak (Duplikasi NIK)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Catatan Petugas (Opsional):</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Misal: Telah diambil langsung oleh pemohon dengan menunjukkan KTP asli..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRecordForStatus(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hapus Data Record (Single) */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus Data</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pemohon <strong>{recordToDelete.nama}</strong> (NIK:{' '}
              <span className="font-mono font-bold">{recordToDelete.nik}</span>)?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Delete */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Hapus {selectedRecordIds.length} Data</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{selectedRecordIds.length} data pemohon</strong> yang dipilih secara massal? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hapus Semua Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Batch */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {editingBatch ? 'Edit Data Batch Penyaluran' : 'Buat Batch Penyaluran Baru'}
            </h3>
            <form onSubmit={handleSaveBatch} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Batch:</label>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Contoh: Batch 4 - Tuban Hijau Lestari 2027"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kode Batch:</label>
                  <input
                    type="text"
                    value={newBatchKode}
                    onChange={(e) => setNewBatchKode(e.target.value)}
                    placeholder="BATCH-2027-04"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tahun:</label>
                  <input
                    type="number"
                    value={newBatchYear}
                    onChange={(e) => setNewBatchYear(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Periode Waktu:</label>
                  <input
                    type="text"
                    value={newBatchPeriode}
                    onChange={(e) => setNewBatchPeriode(e.target.value)}
                    placeholder="Maret - Mei 2027"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Alokasi Kuota Bibit:</label>
                  <input
                    type="number"
                    value={newBatchQuota}
                    onChange={(e) => setNewBatchQuota(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Keterangan:</label>
                <textarea
                  value={newBatchDesc}
                  onChange={(e) => setNewBatchDesc(e.target.value)}
                  placeholder="Keterangan alokasi bantuan..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBatchModal(false);
                    setEditingBatch(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  {editingBatch ? 'Simpan Perubahan' : 'Simpan Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Hapus Batch */}
      {batchToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Hapus Batch</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus batch <strong>{batchToDelete.nama}</strong> ({batchToDelete.kode})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBatchToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBatch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hapus Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
