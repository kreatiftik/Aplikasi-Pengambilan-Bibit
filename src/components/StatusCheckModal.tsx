import React, { useState } from 'react';
import { X, Search, CheckCircle2, XCircle, FileText, Calendar, User, MapPin, Trees } from 'lucide-react';
import { NIKRecord } from '../types';

interface StatusCheckModalProps {
  records: NIKRecord[];
  onClose: () => void;
  onViewReceipt: (record: NIKRecord) => void;
}

export const StatusCheckModal: React.FC<StatusCheckModalProps> = ({
  records,
  onClose,
  onViewReceipt,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState<NIKRecord | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setHasSearched(true);
    const found = records.find(
      (r) =>
        r.nik === cleanQuery ||
        r.nomorRegistrasi.toLowerCase() === cleanQuery.toLowerCase()
    );
    setResult(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
              <Search className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Cek Status & Unduh Tiket NIK</h3>
              <p className="text-xs text-emerald-200">Layanan Informasi DLHP Kabupaten Tuban</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Masukkan 16 Digit NIK KTP atau Nomor Registrasi DLHP
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: 3523011204850001"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari</span>
              </button>
            </div>
          </form>

          {hasSearched && !result && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <XCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">Data Tidak Ditemukan</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                NIK atau Nomor Registrasi tersebut belum terdaftar dalam sistem penerima bantuan bibit DLHP Kabupaten Tuban.
              </p>
            </div>
          )}

          {hasSearched && result && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Data NIK Ditemukan</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded">
                  {result.batchNama.split(' - ')[0]}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pemohon:</span>
                  <strong className="text-slate-900">{result.nama}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIK:</span>
                  <span className="font-mono font-semibold">{result.nik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kecamatan:</span>
                  <span>{result.kecamatan} ({result.desa})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Bibit:</span>
                  <strong className="text-emerald-800 font-mono">{result.totalBibit} Bibit</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Registrasi:</span>
                  <span className="font-mono text-slate-800 font-bold">{result.nomorRegistrasi}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewReceipt(result);
                }}
                className="w-full mt-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Buka / Cetak Bukti Tanda Terima</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
