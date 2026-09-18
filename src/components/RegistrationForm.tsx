import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  Trees, 
  User, 
  MapPin, 
  Phone, 
  Plus, 
  Minus, 
  AlertCircle, 
  Send, 
  Check, 
  FileText,
  Building2,
  TreePine,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { KECAMATAN_TUBAN } from '../data/mockData';
import { BatchInfo, BibitItem, BibitSelected, NIKRecord } from '../types';
import { getStoredBibitList } from '../services/storage';

interface RegistrationFormProps {
  isUnlocked: boolean;
  verifiedNik: string;
  activeBatch: BatchInfo;
  onSubmit: (formData: Omit<NIKRecord, 'id' | 'nomorRegistrasi' | 'createdAt' | 'status'>) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  isUnlocked,
  verifiedNik,
  activeBatch,
  onSubmit,
}) => {
  // Dynamic Bibit Inventory
  const [bibitCatalog, setBibitCatalog] = useState<BibitItem[]>([]);

  useEffect(() => {
    setBibitCatalog(getStoredBibitList());
  }, [isUnlocked]);

  // Form State
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [kategoriPemohon, setKategoriPemohon] = useState<'Perorangan' | 'Kelompok Tani' | 'Sekolah' | 'Instansi / Komunitas'>('Perorangan');
  const [kecamatan, setKecamatan] = useState('Semanding');
  const [desa, setDesa] = useState('');
  const [alamatLengkap, setAlamatLengkap] = useState('');
  
  // Seedling quantities: key is bibit id, value is quantity
  const [selectedBibit, setSelectedBibit] = useState<{ [id: string]: number }>({});

  // Set default initial selection once bibit catalog is loaded
  useEffect(() => {
    if (bibitCatalog.length > 0 && Object.keys(selectedBibit).length === 0) {
      const firstAvailable = bibitCatalog.find((b) => b.stokTersedia > 0) || bibitCatalog[0];
      if (firstAvailable) {
        setSelectedBibit({ [firstAvailable.id]: 2 });
      }
    }
  }, [bibitCatalog]);

  const [lokasiTanam, setLokasiTanam] = useState('Pekarangan rumah dan pagar depan');
  const [peruntukanLahan, setPeruntukanLahan] = useState('Pekarangan Pribadi / Pemukiman');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maximum allowed seedlings based on category
  const maxAllowedSeedlings = kategoriPemohon === 'Perorangan' ? 10 : 40;

  const totalSeedlingsCount: number = (Object.values(selectedBibit) as number[]).reduce(
    (acc: number, curr: number) => acc + (curr || 0),
    0
  );

  const handleBibitChange = (id: string, delta: number) => {
    const item = bibitCatalog.find((b) => b.id === id);
    if (!item) return;

    const current = selectedBibit[id] || 0;
    const nextVal = Math.max(0, current + delta);
    
    // Check individual seedling stock limit
    if (delta > 0 && nextVal > item.stokTersedia) {
      alert(`Stok untuk bibit ${item.nama} tersisa ${item.stokTersedia} bibit.`);
      return;
    }

    // Check max allowed per item
    const maxPerItem = kategoriPemohon === 'Perorangan' ? (item.maxPerorangan || 5) : (item.maxKelompok || 25);
    if (delta > 0 && nextVal > maxPerItem) {
      alert(`Batas maksimal per jenis untuk ${item.nama} adalah ${maxPerItem} bibit per pemohon.`);
      return;
    }

    // Check total limit
    const potentialTotal = totalSeedlingsCount - current + nextVal;
    if (delta > 0 && potentialTotal > maxAllowedSeedlings) {
      alert(`Batas maksimal alokasi bibit untuk kategori ${kategoriPemohon} adalah ${maxAllowedSeedlings} bibit.`);
      return;
    }

    setSelectedBibit((prev) => {
      const copy = { ...prev };
      if (nextVal === 0) {
        delete copy[id];
      } else {
        copy[id] = nextVal;
      }
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUnlocked) return;

    const errors: string[] = [];
    if (!nama.trim()) errors.push('Nama lengkap pemohon wajib diisi.');
    if (!kontak.trim()) errors.push('Nomor HP/WhatsApp aktif wajib diisi.');
    if (!kecamatan) errors.push('Pilih kecamatan domisili di Kab. Tuban.');
    if (!desa.trim()) errors.push('Nama Desa / Kelurahan wajib diisi.');
    if (!alamatLengkap.trim()) errors.push('Alamat lengkap wajib diisi.');
    if (totalSeedlingsCount <= 0) errors.push('Pilih minimal 1 jenis bibit tanaman.');
    if (!agreedTerms) errors.push('Anda wajib menyetujui komitmen pemeliharaan bibit.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setIsSubmitting(true);

    const bibitList: BibitSelected[] = Object.entries(selectedBibit)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([id, qty]) => {
        const item = bibitCatalog.find((b) => b.id === id);
        return {
          jenisId: id,
          namaBibit: item ? item.nama : id,
          kategori: item ? item.kategori : 'Peneduh',
          jumlah: qty as number,
        };
      });

    setTimeout(() => {
      onSubmit({
        nik: verifiedNik,
        nama,
        kontak,
        kecamatan,
        desa,
        alamatLengkap,
        kategoriPemohon,
        batchId: activeBatch.id,
        batchNama: activeBatch.nama,
        tanggalTerdaftar: new Date().toISOString().split('T')[0],
        bibit: bibitList,
        totalBibit: totalSeedlingsCount,
        lokasiTanam,
        peruntukanLahan,
      });
      setIsSubmitting(false);
    }, 600);
  };

  if (!isUnlocked) {
    return null;
  }

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Main Registration Form Container */}
      <div className="bg-white rounded-3xl shadow-xs border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider">
                Langkah 2
              </span>
              <span className="text-xs text-stone-400">Formulir Pengajuan Bibit DLHP Tuban</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Data Diri & Pemilihan Bibit Pohon
            </h2>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/90 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>NIK: {verifiedNik}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-8">
          {formErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-950">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Mohon lengkapi isian berikut:</span>
              </div>
              <ul className="list-disc list-inside pl-1 space-y-0.5 text-red-800">
                {formErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Data Identitas Pemohon */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-emerald-800" />
              <span>1. Identitas Pemohon</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIK KTP (Terkonfirmasi)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={verifiedNik}
                    readOnly
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-700 cursor-not-allowed"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                </div>
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  ✓ Memenuhi syarat 1 NIK 1x bantuan
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Ketik nama lengkap sesuai KTP"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={kontak}
                    onChange={(e) => setKontak(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Untuk konfirmasi dan notifikasi pengambilan bibit di persemaian
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Pemohon <span className="text-red-500">*</span>
                </label>
                <select
                  value={kategoriPemohon}
                  onChange={(e) => setKategoriPemohon(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                >
                  <option value="Perorangan">Perorangan / Rumah Tangga (Maks 10 bibit)</option>
                  <option value="Kelompok Tani">Kelompok Tani / Karang Taruna (Maks 40 bibit)</option>
                  <option value="Sekolah">Sekolah / Lembaga Pendidikan (Maks 40 bibit)</option>
                  <option value="Instansi / Komunitas">Instansi / Rumah Ibadah / Komunitas (Maks 40 bibit)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Domisili Kabupaten Tuban */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-800" />
              <span>2. Domisili di Kabupaten Tuban</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                >
                  {KECAMATAN_TUBAN.map((kec) => (
                    <option key={kec} value={kec}>
                      Kecamatan {kec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Desa / Kelurahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={desa}
                  onChange={(e) => setDesa(e.target.value)}
                  placeholder="Ketik nama desa / kelurahan"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap (Jalan, RT/RW, Dusun) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, dusun, dan patokan"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pemilihan Bibit Tanaman */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Trees className="w-4 h-4 text-emerald-800" />
                <span>3. Pemilihan Bibit Pohon & Tanaman Gratis</span>
              </h3>

              {/* Total counter badge */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600">Total Dipilih:</span>
                <span
                  className={`font-mono font-bold px-3 py-0.5 rounded-full ${
                    totalSeedlingsCount > 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {totalSeedlingsCount} / {maxAllowedSeedlings} bibit
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-4">
              Pilih jenis dan jumlah bibit pohon yang Anda butuhkan dengan tombol plus (+) atau minus (-).
            </p>

            {/* Seedlings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {bibitCatalog.map((item) => {
                const count = selectedBibit[item.id] || 0;
                const isOutOfStock = item.stokTersedia <= 0;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition flex flex-col justify-between ${
                      isOutOfStock
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : count > 0
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.kategori === 'Peneduh'
                              ? 'bg-teal-100 text-teal-900'
                              : item.kategori === 'Buah'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {item.kategori}
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          {isOutOfStock ? 'Habis' : item.badge || 'Tersedia'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.nama}</h4>
                      {item.namaLatin && (
                        <p className="text-[11px] text-slate-500 italic mb-2">{item.namaLatin}</p>
                      )}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                        {item.deskripsi}
                      </p>
                      <div className="text-[10px] font-medium text-slate-500 mb-2">
                        Stok di Kebun Bibit: <strong className={item.stokTersedia < 500 ? 'text-amber-800' : 'text-emerald-800'}>{item.stokTersedia.toLocaleString('id-ID')} bibit</strong>
                      </div>
                    </div>

                    {/* Quantity Controller */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-600">Alokasi:</span>
                      {isOutOfStock ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                          Stok Habis
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleBibitChange(item.id, -1)}
                            disabled={count <= 0}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold transition cursor-pointer ${
                              count > 0
                                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold text-slate-900 w-5 text-center">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleBibitChange(item.id, 1)}
                            disabled={totalSeedlingsCount >= maxAllowedSeedlings || count >= item.stokTersedia}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold transition cursor-pointer ${
                              totalSeedlingsCount < maxAllowedSeedlings && count < item.stokTersedia
                                ? 'border-emerald-800 bg-emerald-800 text-white hover:bg-emerald-900'
                                : 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Rencana Penanaman */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <TreePine className="w-4 h-4 text-emerald-800" />
              <span>4. Rencana Lokasi Tanam</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peruntukan Lahan <span className="text-red-500">*</span>
                </label>
                <select
                  value={peruntukanLahan}
                  onChange={(e) => setPeruntukanLahan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                >
                  <option value="Pekarangan Pribadi / Pemukiman">Pekarangan Pribadi / Pemukiman Warga</option>
                  <option value="Tepi Jalan Lingkungan / Desa">Tepi Jalan Lingkungan / Akses Desa</option>
                  <option value="Taman & Lapangan Desa">Taman & Fasilitas Olahraga Desa</option>
                  <option value="Halaman Sekolah / Madrasah">Halaman Sekolah / Madrasah / Pesantren</option>
                  <option value="Kawasan Konservasi Sumber Air / Sungai">Kawasan Konservasi Sumber Mata Air / Sungai</option>
                  <option value="Lahan Kritis / Perbukitan Kapur">Lahan Kritis / Kawasan Perbukitan Kapur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Lokasi Tanam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lokasiTanam}
                  onChange={(e) => setLokasiTanam(e.target.value)}
                  placeholder="Contoh: Ditanam di halaman rumah dan batas kebun desa"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Komitmen Pakta Integritas */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="check-terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 mt-0.5 cursor-pointer"
              />
              <label htmlFor="check-terms" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                <strong>Komitmen Pemohon & Pakta Integritas:</strong> Saya menyatakan bahwa data yang saya masukkan adalah benar sesuai KTP. Saya berkomitmen untuk menanam serta merawat bibit pohon yang diberikan oleh Dinas Lingkungan Hidup dan Perhubungan Kabupaten Tuban.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Pengambilan bibit bertempat di <strong>Kebun Bibit Hutan Kota DLHP Tuban</strong> setelah pengajuan berhasil.
            </div>

            <button
              id="btn-submit-registration"
              type="submit"
              disabled={isSubmitting || !isUnlocked || totalSeedlingsCount === 0}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition cursor-pointer ${
                isUnlocked && totalSeedlingsCount > 0 && !isSubmitting
                  ? 'bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Memproses Pendaftaran...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Formulir Permohonan Bibit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
