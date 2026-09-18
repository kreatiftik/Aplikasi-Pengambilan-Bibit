import React from 'react';
import { Sprout, FileText, MapPin, Sparkles, Clock } from 'lucide-react';
import { BatchInfo } from '../types';

interface HeaderProps {
  activeBatch: BatchInfo;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeBatch,
  onOpenRules,
}) => {
  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-800/60 sticky top-0 z-40 shadow-lg">
      {/* Top info bar */}
      <div className="bg-emerald-900/90 text-emerald-100 text-xs py-1.5 px-4 sm:px-6 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium tracking-wide">Portal Resmi Permohonan Bibit Tanaman Kab. Tuban</span>
            <span className="hidden md:inline text-emerald-400/60">•</span>
            <span className="hidden md:inline text-emerald-200">Persemaian Hutan Kota DLHP Tuban</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200 text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jl. Dr. Wahidin Sudirohusodo No. 44, Tuban</span>
            </span>
            <span className="hidden sm:inline text-emerald-400/40">|</span>
            <span className="hidden sm:inline flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Senin - Jumat: 08.00 - 15.00 WIB</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* Seal / Badge DLHP Tuban */}
            <div className="relative flex-shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md flex items-center justify-center border border-emerald-300/30">
              <div className="w-full h-full rounded-[14px] bg-emerald-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial from-emerald-400/20 to-transparent"></div>
                <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300 relative z-10" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 rounded-full border-2 border-emerald-950 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-slate-950 shadow">
                TB
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-emerald-300 uppercase">
                  Pemerintah Kabupaten Tuban
                </span>
                <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.2 rounded-full border border-emerald-700/50 hidden sm:inline-block">
                  Jawa Timur
                </span>
              </div>
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight">
                Dinas Lingkungan Hidup dan Perhubungan (DLHP)
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pendaftaran Bantuan Bibit Pohon Gratis Berbasis NIK</span>
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2">
            <button
              id="btn-nav-rules"
              onClick={onOpenRules}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Petunjuk & Syarat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Batch Bar */}
      <div className="bg-emerald-900/50 border-t border-emerald-800/40 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded-md uppercase tracking-wider text-[10px]">
              {activeBatch.status}
            </span>
            <span className="font-semibold text-emerald-100">{activeBatch.nama}</span>
            <span className="text-emerald-400/80 hidden sm:inline">({activeBatch.periode})</span>
          </div>

          <div className="flex items-center gap-3 text-emerald-200 text-[11px] sm:text-xs">
            <span>Kuota Tersalurkan: <strong>{activeBatch.kuotaTersalurkan.toLocaleString('id-ID')}</strong> / {activeBatch.kuotaBibit.toLocaleString('id-ID')} Bibit</span>
          </div>
        </div>
      </div>
    </header>
  );
};
