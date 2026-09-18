/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  Sprout, 
  ShieldCheck, 
  Trees, 
  Search, 
  Lock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  ArrowDown,
  Info,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  HeartHandshake,
  Check
} from 'lucide-react';
import { Header } from './components/Header';
import { NIKVerificationCard } from './components/NIKVerificationCard';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationReceiptModal } from './components/RegistrationReceiptModal';
import { RulesAndGuideModal } from './components/RulesAndGuideModal';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminDashboardView } from './components/AdminDashboardView';
import { Footer } from './components/Footer';
import { 
  getStoredBatches, 
  getStoredRecords, 
  getSystemStats, 
  isAdminAuthenticated, 
  saveRecords, 
  setAdminAuthenticated, 
  submitNewApplication, 
  verifyNIK 
} from './services/storage';
import { AppViewMode, BatchInfo, NIKRecord, VerificationResult } from './types';

// Seedling & Planting Images
import heroSeedlingImg from './assets/images/seedling_hero_nursery_1789457519425.jpg';
import seedlingPotsImg from './assets/images/seedling_pots_nursery_1789457535564.jpg';
import communityPlantingImg from './assets/images/community_tree_planting_1789457553357.jpg';

// Helper to determine view from current URL/Hash/Search
function getPathViewMode(): 'public' | 'login' | 'admin' {
  if (typeof window === 'undefined') return 'public';
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (pathname.endsWith('/login') || hash.includes('login') || search.includes('login')) {
    return isAdminAuthenticated() ? 'admin' : 'login';
  }
  if (pathname.endsWith('/admin') || hash.includes('admin') || search.includes('admin')) {
    return isAdminAuthenticated() ? 'admin' : 'login';
  }
  return 'public';
}

export default function App() {
  // Navigation View State ('public' | 'login' | 'admin')
  const [currentView, setCurrentView] = useState<'public' | 'login' | 'admin'>('public');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Application Data States
  const [records, setRecords] = useState<NIKRecord[]>([]);
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [stats, setStats] = useState({ totalRejectedAttempts: 142 });

  // Verification & Form States (Public Portal)
  const [nikInput, setNikInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isFormUnlocked, setIsFormUnlocked] = useState(false);

  // Modals & Receipts
  const [activeReceiptRecord, setActiveReceiptRecord] = useState<NIKRecord | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const formSectionRef = useRef<HTMLDivElement>(null);

  // Load data & synchronize with URL path
  useEffect(() => {
    loadData();
    const authenticated = isAdminAuthenticated();
    setIsAdminLoggedIn(authenticated);

    // Initial check from URL
    const initialView = getPathViewMode();
    setCurrentView(initialView);

    // Handle browser back/forward and hash changes
    const handleLocationChange = () => {
      const mode = getPathViewMode();
      setCurrentView(mode);
      setIsAdminLoggedIn(isAdminAuthenticated());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (view: 'public' | 'login' | 'admin') => {
    setCurrentView(view);
    const targetPath = view === 'public' ? '/' : `/${view}`;
    const targetHash = view === 'public' ? '' : `#/${view}`;

    // Update browser history if possible
    try {
      window.history.pushState({ view }, '', targetPath);
    } catch {
      window.location.hash = targetHash;
    }
  };

  const loadData = () => {
    const loadedRecords = getStoredRecords();
    const loadedBatches = getStoredBatches();
    const loadedStats = getSystemStats();
    setRecords(loadedRecords);
    setBatches(loadedBatches);
    setStats(loadedStats);
  };

  const activeBatch = batches.find((b) => b.status === 'Aktif') || {
    id: 'batch-3',
    kode: 'BATCH-2026-03',
    nama: 'Batch 3 - Tuban Bangkit Lestari 2026',
    tahun: 2026,
    periode: 'September 2026 - November 2026',
    status: 'Aktif',
    kuotaBibit: 25000,
    kuotaTersalurkan: 6420,
    tanggalMulai: '2026-09-01',
    tanggalSelesai: '2026-11-30',
    keterangan: 'Batch pendaftaran aktif saat ini untuk seluruh warga Kabupaten Tuban.',
  };

  // Perform NIK Verification
  const handleVerifyNIK = (overrideNik?: string) => {
    const targetNik = overrideNik || nikInput;
    const result = verifyNIK(targetNik);
    setVerificationResult(result);

    if (result.statusType === 'ELIGIBLE') {
      setIsFormUnlocked(true);
      // Auto-scroll to form smoothly
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } else {
      // Locked if rejected or invalid
      setIsFormUnlocked(false);
      setStats(getSystemStats());
    }
  };

  // Reset verification state
  const handleResetVerification = () => {
    setNikInput('');
    setVerificationResult(null);
    setIsFormUnlocked(false);
  };

  // Handle successful form submission
  const handleFormSubmit = (formData: Omit<NIKRecord, 'id' | 'nomorRegistrasi' | 'createdAt' | 'status'>) => {
    const res = submitNewApplication(formData);
    if (res.success && res.record) {
      loadData();
      setActiveReceiptRecord(res.record);
      // Reset form lock
      setIsFormUnlocked(false);
      setNikInput('');
      setVerificationResult(null);
    } else if (res.error) {
      alert(res.error);
    }
  };

  // Admin Login Success
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    navigateTo('admin');
  };

  // Admin Logout
  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAdminLoggedIn(false);
    navigateTo('login');
  };

  // ==========================================
  // VIEW 1: TAMPILAN LOGIN ADMIN UTAMA (/login)
  // ==========================================
  if (currentView === 'login') {
    return (
      <AdminLoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToPublic={() => navigateTo('public')}
      />
    );
  }

  // ==========================================
  // VIEW 2: TAMPILAN DASHBOARD ADMIN UTAMA (/admin)
  // ==========================================
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToPublic={() => navigateTo('public')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <AdminDashboardView
          records={records}
          batches={batches}
          totalRejectedAttempts={stats.totalRejectedAttempts}
          onRefreshData={loadData}
          onViewReceipt={(rec) => setActiveReceiptRecord(rec)}
          onSwitchToPublic={() => navigateTo('public')}
          onLogout={handleLogout}
        />

        {/* Modals in Admin */}
        {activeReceiptRecord && (
          <RegistrationReceiptModal
            record={activeReceiptRecord}
            onClose={() => setActiveReceiptRecord(null)}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: TAMPILAN UMUM (Pendaftaran Permohonan Bibit Tanaman)
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Official Government Header */}
      <Header
        activeBatch={activeBatch}
        onOpenRules={() => setShowRulesModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Modern Editorial Hero Banner with Real Nursery Image */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Program Hijau Pemkab Tuban</span>
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700">{activeBatch.nama}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Menanam Kebaikan, <br className="hidden sm:inline" />
                <span className="text-emerald-800">Wujudkan Tuban Rindang & Sejuk</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Layanan permohonan bibit tanaman gratis dari <strong>Dinas Lingkungan Hidup dan Perhubungan (DLHP) Kabupaten Tuban</strong> bagi seluruh warga di 20 Kecamatan. Setiap 1 NIK KTP berhak mengajukan bantuan bibit pohon peneduh, tanaman buah, maupun pohon konservasi.
              </p>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1 NIK 1x Bantuan</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Pemerataan adil untuk warga se-Kabupaten Tuban
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Trees className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bibit Siap Tanam</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Dirawat di Kebun Bibit Permanen Hutan Kota
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Bebas Biaya</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Tanpa pungutan apapun untuk seluruh masyarakat
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual Photo Column */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-950/10 shadow-md group">
                <img
                  src={heroSeedlingImg}
                  alt="Bibit Tanaman Unggul di Persemaian Hutan Kota DLHP Tuban"
                  className="w-full h-64 sm:h-72 object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-800/90 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Kebun Bibit Permanen Tuban
                  </span>
                  <p className="text-xs font-medium text-emerald-100 drop-shadow-xs">
                    Bibit pohon terawat siap dialokasikan untuk pekarangan & fasilitas umum
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: NIK VERIFICATION (Langkah 1) */}
        <section id="section-nik-check" className="scroll-mt-24">
          <NIKVerificationCard
            nikInput={nikInput}
            setNikInput={setNikInput}
            verificationResult={verificationResult}
            onVerify={handleVerifyNIK}
            onReset={handleResetVerification}
            isFormUnlocked={isFormUnlocked}
          />
        </section>

        {/* SECTION 2: REGISTRATION FORM (Langkah 2 - Tampil otomatis saat NIK lolos verifikasi) */}
        {isFormUnlocked && (
          <section id="section-registration" ref={formSectionRef} className="scroll-mt-24">
            <RegistrationForm
              isUnlocked={isFormUnlocked}
              verifiedNik={nikInput}
              activeBatch={activeBatch}
              onSubmit={handleFormSubmit}
            />
          </section>
        )}

        {/* SECTION 3: GALERI & PANDUAN PENGAMBILAN BIBIT */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Informasi Pelayanan
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Alur & Ketentuan Pengambilan di Persemaian
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer underline underline-offset-2"
            >
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>Lihat Syarat & Ketentuan Lengkap</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 with Nursery Pots Photo */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col sm:flex-row">
              <div className="sm:w-2/5 h-44 sm:h-auto relative overflow-hidden flex-shrink-0">
                <img
                  src={seedlingPotsImg}
                  alt="Bibit dalam polybag siap salur"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lokasi Persemaian DLHP Tuban</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Kebun Bibit Hutan Kota Tuban
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Jl. Dr. Wahidin Sudirohusodo No. 44, Ronggomulyo, Tuban. Bawa bukti pendaftaran nomor registrasi dan KTP asli saat pengambilan.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Senin – Jumat, Pukul 08.30 – 14.30 WIB</span>
                </div>
              </div>
            </div>

            {/* Card 2 with Community Planting Photo */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col sm:flex-row">
              <div className="sm:w-2/5 h-44 sm:h-auto relative overflow-hidden flex-shrink-0">
                <img
                  src={communityPlantingImg}
                  alt="Aksi penanaman pohon warga Tuban"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Komitmen Perawatan Bersama</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Tanam, Rawat, dan Lindungi
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Setiap pohon yang ditanam berkontribusi menurunkan suhu mikro, menyerap karbon, dan menambah ruang hijau asri bagi generasi Tuban mendatang.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 font-medium">
                  ✓ Tersedia varietas Peneduh, Buah & Konservasi
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with subtle /login link */}
      <Footer onNavigateToLogin={() => navigateTo('login')} />

      {/* MODALS */}
      {/* 1. Registration Receipt Modal (When user successfully submits) */}
      {activeReceiptRecord && (
        <RegistrationReceiptModal
          record={activeReceiptRecord}
          onClose={() => setActiveReceiptRecord(null)}
        />
      )}

      {/* 2. Rules and Terms Modal */}
      {showRulesModal && (
        <RulesAndGuideModal onClose={() => setShowRulesModal(false)} />
      )}
    </div>
  );
}
