import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Lock,
  Unlock,
  Info,
  Check,
  CreditCard
} from 'lucide-react';
import { VerificationResult } from '../types';

interface NIKVerificationCardProps {
  nikInput: string;
  setNikInput: (val: string) => void;
  verificationResult: VerificationResult | null;
  onVerify: (nik?: string) => void;
  onReset: () => void;
  isFormUnlocked: boolean;
}

export const NIKVerificationCard: React.FC<NIKVerificationCardProps> = ({
  nikInput,
  setNikInput,
  verificationResult,
  onVerify,
  onReset,
  isFormUnlocked,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya menerima karakter angka hingga 16 digit
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 16);
    setNikInput(cleaned);
  };

  const isCompleteLength = nikInput.length === 16;

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-stone-200 overflow-hidden transition-all duration-300">
      {/* Top Header Card */}
      <div className="bg-stone-50 border-b border-stone-200/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
            {isFormUnlocked ? (
              <Unlock className="w-5 h-5 text-emerald-200" />
            ) : (
              <CreditCard className="w-5 h-5 text-emerald-200" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                Langkah 1
              </span>
              <span className="text-xs text-slate-500 font-medium">Pemeriksaan Hak Alokasi</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Verifikasi NIK KTP Pemohon
            </h2>
          </div>
        </div>

        {/* Verification status badge */}
        <div>
          {verificationResult?.statusType === 'ALREADY_RECEIVED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              NIK Sudah Pernah Terdaftar
            </span>
          )}
          {verificationResult?.statusType === 'ELIGIBLE' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              NIK Terverifikasi (Berhak)
            </span>
          )}
          {!verificationResult && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Masukkan 16 Digit NIK KTP
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-5">
        {/* NIK Input Form */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="nik-input" className="block text-xs sm:text-sm font-bold text-slate-800">
              Nomor Induk Kependudukan (NIK KTP Tuban)
            </label>
            <span className="text-[11px] text-slate-400">Wajib 16 Digit Angka</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="nik-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={16}
              value={nikInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onVerify();
                }
              }}
              placeholder="Ketik 16 digit NIK Anda (contoh: 3523xxxxxxxxxxxx)"
              className={`w-full pl-12 pr-24 py-3.5 text-base sm:text-lg font-mono tracking-wider rounded-2xl border bg-white focus:outline-none transition ${
                verificationResult?.statusType === 'ALREADY_RECEIVED'
                  ? 'border-red-400 ring-2 ring-red-100 text-red-900 bg-red-50/20'
                  : verificationResult?.statusType === 'ELIGIBLE'
                  ? 'border-emerald-600 ring-2 ring-emerald-100 text-emerald-950 font-bold'
                  : 'border-slate-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/10 text-slate-900'
              }`}
            />
            {/* Digit counter */}
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              <span
                className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg ${
                  isCompleteLength
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {nikInput.length}/16
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Sistem memeriksa basis data penerima bibit untuk memastikan setiap warga mendapatkan hak alokasi yang adil.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            id="btn-verify-nik"
            type="button"
            onClick={() => onVerify()}
            disabled={!nikInput}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              nikInput
                ? 'bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Verifikasi NIK Sekarang</span>
          </button>

          {verificationResult && (
            <button
              id="btn-reset-verification"
              type="button"
              onClick={onReset}
              className="px-4 py-3 rounded-xl font-semibold text-xs border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti NIK Lain</span>
            </button>
          )}
        </div>

        {/* RESULT SECTION - CASE 1: REJECTED / ALREADY RECEIVED */}
        {verificationResult?.statusType === 'ALREADY_RECEIVED' && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="inline-block px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Permohonan Tidak Dapat Diproses
                </span>
                <h3 className="text-base font-bold text-red-950">
                  NIK Sudah Pernah Menerima Alokasi Bibit
                </h3>
                <p className="text-xs text-red-900 leading-relaxed">
                  Berdasarkan arsip resmi persemaian DLHP Kabupaten Tuban, NIK ini telah tercatat menerima bantuan bibit pohon pada periode sebelumnya. Demi azas pemerataan seluruh warga di 20 Kecamatan, setiap NIK hanya berhak 1 kali bantuan.
                </p>
                {verificationResult.record && (
                  <div className="mt-2.5 p-3.5 bg-white rounded-xl border border-red-200 text-xs text-slate-800 space-y-1 shadow-2xs">
                    <div className="font-semibold text-red-950">Riwayat Penyaluran Sebelumnya:</div>
                    <div className="text-slate-600">
                      • Periode Batch: <strong className="text-slate-900">{verificationResult.record.batchNama}</strong> ({verificationResult.record.tahunBatch})
                    </div>
                    <div className="text-slate-600">
                      • Status: <strong className="text-emerald-800">Bibit Sudah Diserahkan</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESULT SECTION - CASE 2: ELIGIBLE (LOLOS) */}
        {verificationResult?.statusType === 'ELIGIBLE' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
              <Check className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-md uppercase tracking-wider">
                Verifikasi Berhasil
              </span>
              <h3 className="text-base font-bold text-emerald-950">
                NIK Berhak Menerima Alokasi Bibit Pohon Gratis
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                NIK Anda terkonfirmasi memenuhi syarat dan belum pernah menerima bantuan bibit. Formulir pendaftaran di <strong>Langkah 2</strong> di bawah ini telah terbuka.
              </p>
            </div>
          </div>
        )}

        {/* RESULT SECTION - CASE 3: INVALID NIK */}
        {verificationResult?.statusType === 'INVALID' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>{verificationResult.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
