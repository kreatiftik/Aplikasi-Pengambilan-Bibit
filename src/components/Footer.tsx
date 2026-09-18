import React from 'react';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigateToLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToLogin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Instansi */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Dinas Lingkungan Hidup dan Perhubungan</h3>
                <p className="text-[11px] text-emerald-400">Pemerintah Kabupaten Tuban • Jawa Timur</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              Program Bantuan Bibit Pohon dan Tanaman Pelindung Gratis diselenggarakan dalam rangka mewujudkan 
              Tuban Asri, Rindang, dan Berkelanjutan melalui penghijauan pekarangan, jalan lingkungan, dan kawasan konservasi air.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem Proteksi Validasi NIK Terintegrasi</span>
            </div>
          </div>

          {/* Col 2: Kontak Kantor */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Kantor & Persemaian</h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Jl. Dr. Wahidin Sudirohusodo No. 44, Ronggomulyo, Kec. Tuban, Kab. Tuban, Jawa Timur 62313</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>(0356) 321890 / Hotline WA Persemaian</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>dlhp@tubankab.go.id</span>
              </p>
            </div>
          </div>

          {/* Col 3: Layanan Publik */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Informasi Layanan</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <span className="text-slate-400">
                  Persemaian Permanen Hutan Kota Tuban
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  Standar Pelayanan Bantuan Bibit Gratis
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  Program Kampung Iklim (ProKlim) Tuban
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  Ruang Terbuka Hijau (RTH) Kabupaten Tuban
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & subtle admin link */}
        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Dinas Lingkungan Hidup dan Perhubungan Kabupaten Tuban. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Pelayanan Masyarakat Berbasis NIK
            </span>
            {onNavigateToLogin && (
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-slate-600 hover:text-slate-400 flex items-center gap-1 transition cursor-pointer"
                title="Akses Petugas (/login)"
              >
                <Lock className="w-3 h-3" />
                <span>/login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
