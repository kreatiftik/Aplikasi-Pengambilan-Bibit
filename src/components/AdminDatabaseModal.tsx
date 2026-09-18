import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Search, 
  Download, 
  Plus, 
  RefreshCw, 
  User, 
  Calendar, 
  Trees, 
  Filter, 
  CheckCircle2, 
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';
import { KECAMATAN_TUBAN } from '../data/mockData';
import { exportRecordsToCSV, resetDatabaseToDefault } from '../services/storage';
import { BatchInfo, NIKRecord } from '../types';

interface AdminDatabaseModalProps {
  records: NIKRecord[];
  batches: BatchInfo[];
  onClose: () => void;
  onRefreshData: () => void;
  onAddHistoricalRecord: (record: NIKRecord) => void;
  totalRejectedAttempts: number;
}

export const AdminDatabaseModal: React.FC<AdminDatabaseModalProps> = ({
  records,
  batches,
  onClose,
  onRefreshData,
  onAddHistoricalRecord,
  totalRejectedAttempts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual Add Form State (to inject previous batch recipients for testing)
  const [newNik, setNewNik] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newKecamatan, setNewKecamatan] = useState('Tuban (Kota)');
  const [newDesa, setNewDesa] = useState('Sidorejo');
  const [newBatchId, setNewBatchId] = useState('batch-1');
  const [newTotalBibit, setNewTotalBibit] = useState(10);
  const [addError, setAddError] = useState('');

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.nik.includes(searchTerm) ||
      r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nomorRegistrasi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBatch =
      selectedBatchFilter === 'ALL' || r.batchId === selectedBatchFilter;

    return matchesSearch && matchesBatch;
  });

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    const cleanNik = newNik.trim().replace(/\D/g, '');
    if (cleanNik.length !== 16) {
      setAddError('NIK harus terdiri dari 16 digit angka.');
      return;
    }

    if (records.some((r) => r.nik === cleanNik)) {
      setAddError(`NIK ${cleanNik} sudah terdaftar sebelumnya di database.`);
      return;
    }

    const batchObj = batches.find((b) => b.id === newBatchId);
    const record: NIKRecord = {
      id: `rec-manual-${Date.now()}`,
      nik: cleanNik,
      nama: newNama.trim() || 'Warga Terdata',
      kontak: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      kecamatan: newKecamatan,
      desa: newDesa,
      alamatLengkap: `Desa ${newDesa}, Kec. ${newKecamatan}`,
      kategoriPemohon: 'Perorangan',
      batchId: newBatchId,
      batchNama: batchObj ? batchObj.nama : 'Batch Sebelumnya',
      tanggalTerdaftar: '2024-11-20',
      tanggalPengambilan: '2024-11-25',
      status: 'SUDAH_MENERIMA',
      bibit: [
        { jenisId: 'tabebuya', namaBibit: 'Tabebuya Kuning', kategori: 'Peneduh', jumlah: Math.ceil(newTotalBibit / 2) },
        { jenisId: 'mangga-arumanis', namaBibit: 'Mangga Arumanis', kategori: 'Buah', jumlah: Math.floor(newTotalBibit / 2) },
      ],
      totalBibit: newTotalBibit,
      lokasiTanam: 'Pekarangan & Batas Desa',
      peruntukanLahan: 'Pekarangan',
      nomorRegistrasi: `DLHP-TBN-ARSIP-${Math.floor(100 + Math.random() * 900)}`,
      catatanPetugas: 'Ditambahkan melalui arsip data manual DLHP Tuban',
      createdAt: new Date().toISOString(),
    };

    onAddHistoricalRecord(record);
    setShowAddForm(false);
    setNewNik('');
    setNewNama('');
    alert(`Sukses! NIK ${cleanNik} berhasil ditambahkan ke ${record.batchNama}. Sekarang NIK ini otomatis ditolak jika mencoba mendaftar kembali!`);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset database ke data sampel default DLHP Tuban?')) {
      resetDatabaseToDefault();
      onRefreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                  Panel Administrator
                </span>
                <span className="text-xs text-slate-400">DLHP Kabupaten Tuban</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Database NIK Penerima Bibit Lintas Batch
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Dashboard Ribbon */}
        <div className="bg-slate-800/60 border-b border-slate-700/60 p-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[11px]">Total NIK Terdaftar</span>
              <strong className="text-lg font-mono font-bold text-white">{records.length} Warga</strong>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[11px]">Bibit Disalurkan</span>
              <strong className="text-lg font-mono font-bold text-emerald-400">
                {records.reduce((sum, r) => sum + r.totalBibit, 0).toLocaleString('id-ID')} Bibit
              </strong>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[11px]">Percobaan NIK Ganda Ditolak</span>
              <strong className="text-lg font-mono font-bold text-red-400">
                {totalRejectedAttempts} Kali
              </strong>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[11px]">Status Batch Aktif</span>
              <strong className="text-sm font-bold text-amber-400 block truncate">
                Batch 3 (2026)
              </strong>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari NIK 16 digit, Nama penerima, atau Kecamatan..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Batch Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="py-2 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none font-medium text-slate-700"
              >
                <option value="ALL">Semua Batch (1, 2, 3)</option>
                <option value="batch-1">Batch 1 (Musim Hujan 2024)</option>
                <option value="batch-2">Batch 2 (Asri 2025)</option>
                <option value="batch-3">Batch 3 (Aktif 2026)</option>
              </select>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Tutup Form' : 'Tambah NIK Riwayat'}</span>
            </button>

            <button
              type="button"
              onClick={() => exportRecordsToCSV(records)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Form Tambah NIK Manual (Simulasi Data Lampau) */}
        {showAddForm && (
          <form
            onSubmit={handleManualAddSubmit}
            className="p-4 sm:p-6 bg-emerald-50/70 border-b border-emerald-200 space-y-3 animate-in slide-in-from-top duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Tambah NIK Riwayat Penerima Lama (Untuk Uji Coba Penolakan NIK):</span>
              </h4>
              <span className="text-[11px] text-emerald-800">
                Data yang ditambahkan di sini akan langsung menyebabkan sistem menolak NIK bersangkutan.
              </span>
            </div>

            {addError && (
              <div className="p-2 text-xs bg-red-100 text-red-800 rounded-lg border border-red-200">
                {addError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIK KTP (16 Digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={newNik}
                  onChange={(e) => setNewNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="3523xxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Penerima</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Bpk. Sugiono"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
                <select
                  value={newKecamatan}
                  onChange={(e) => setNewKecamatan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  {KECAMATAN_TUBAN.map((kec) => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Penerimaan</label>
                <select
                  value={newBatchId}
                  onChange={(e) => setNewBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="batch-1">Batch 1 (Tahun 2024)</option>
                  <option value="batch-2">Batch 2 (Tahun 2025)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg cursor-pointer"
              >
                Simpan ke Database NIK
              </button>
            </div>
          </form>
        )}

        {/* Database Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-3">NIK & Pemohon</th>
                  <th className="px-3.5 py-3">Kecamatan / Domisili</th>
                  <th className="px-3.5 py-3">Batch & Tanggal</th>
                  <th className="px-3.5 py-3">Alokasi Bibit</th>
                  <th className="px-3.5 py-3">Status Validasi</th>
                  <th className="px-3.5 py-3 text-right">No. Registrasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Tidak ditemukan data NIK sesuai kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-3.5 py-3">
                        <div className="font-mono font-bold text-slate-900">{item.nik}</div>
                        <div className="text-slate-600 font-medium">{item.nama}</div>
                        <span className="text-[10px] text-slate-600">{item.kategoriPemohon}</span>
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-slate-800">Kec. {item.kecamatan}</div>
                        <div className="text-[11px] text-slate-600">Desa {item.desa}</div>
                      </td>

                      <td className="px-3.5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.batchId === 'batch-1'
                            ? 'bg-slate-100 text-slate-700'
                            : item.batchId === 'batch-2'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.batchNama.split(' - ')[0]}
                        </span>
                        <div className="text-[11px] text-slate-600 mt-0.5">{item.tanggalTerdaftar}</div>
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="font-mono font-bold text-emerald-800">{item.totalBibit} Bibit</div>
                        <div className="text-[10px] text-slate-600 line-clamp-1">
                          {item.bibit.map((b) => `${b.namaBibit} (${b.jumlah})`).join(', ')}
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        {item.status === 'SUDAH_MENERIMA' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sudah Menerima
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Batch Baru (Siap)
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-3 text-right">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {item.nomorRegistrasi}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetData}
              className="text-slate-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Database ke Standar Awal</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold cursor-pointer"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
