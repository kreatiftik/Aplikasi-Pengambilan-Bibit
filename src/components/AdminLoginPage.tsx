import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sprout, 
  ArrowLeft
} from 'lucide-react';
import { ADMIN_CREDENTIALS, setAdminAuthenticated } from '../services/storage';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToPublic,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (
        username.trim() === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        setAdminAuthenticated(true);
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau Password salah. Silakan periksa kembali kredensial Anda.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 flex flex-col justify-between text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <nav className="p-4 sm:p-6 max-w-6xl w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToPublic}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition cursor-pointer border border-white/15 backdrop-blur-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Tampilan Umum (Portal Pemohon)</span>
        </button>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-emerald-300/70 font-mono">Akses Terbatas Petugas</span>
        </div>
      </nav>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-emerald-800/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white p-7 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 mx-auto flex items-center justify-center text-emerald-300 shadow-inner mb-3">
              <Sprout className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-emerald-300 bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-700/50 mb-1">
              Portal Admin Utama
            </span>
            <h2 className="text-xl font-extrabold text-white">Login Dashboard Admin</h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              Dinas Lingkungan Hidup dan Perhubungan Kabupaten Tuban
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Username Admin</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 text-center leading-relaxed">
              Halaman ini hanya dapat diakses oleh Petugas & Admin Dinas Lingkungan Hidup dan Perhubungan Kabupaten Tuban yang memiliki otorisasi.
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/20 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi Akses...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Masuk Dashboard Admin Utama</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToPublic}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 text-center transition cursor-pointer"
              >
                Batal dan Kembali ke Portal Publik
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-emerald-200/60 border-t border-white/5">
        <p>© {new Date().getFullYear()} Dinas Lingkungan Hidup dan Perhubungan Kabupaten Tuban</p>
      </div>
    </div>
  );
};
