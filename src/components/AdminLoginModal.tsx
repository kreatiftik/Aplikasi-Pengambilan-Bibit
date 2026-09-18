import React, { useState } from 'react';
import { Lock, User, ShieldCheck, X, Eye, EyeOff, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { ADMIN_CREDENTIALS, setAdminAuthenticated } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

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
        onClose();
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau Password salah. Silakan periksa kembali kredensial Anda.');
      }
    }, 400);
  };

  const handleFillDemoCredentials = () => {
    setUsername(ADMIN_CREDENTIALS.username);
    setPassword(ADMIN_CREDENTIALS.password);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                Akses Terproteksi
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Masuk Admin Utama</h3>
              <p className="text-xs text-emerald-200/80">DLHP Pemerintah Kabupaten Tuban</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Username Admin</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Credential Hint */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1 text-emerald-900">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kredensial Akun Admin Utama:</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
              >
                Isi Otomatis
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 font-mono text-[11px] bg-white/70 p-2 rounded-lg border border-emerald-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Username:</span>
                <span className="font-bold text-slate-800">admin</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Password:</span>
                <span className="font-bold text-slate-800">BibitTanaman2026</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
