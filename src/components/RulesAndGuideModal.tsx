import React from 'react';
import { X, ShieldAlert, CheckCircle, Trees, MapPin, Clock, FileText, AlertTriangle } from 'lucide-react';

interface RulesAndGuideModalProps {
  onClose: () => void;
}

export const RulesAndGuideModal: React.FC<RulesAndGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200 my-6">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
              <FileText className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Petunjuk Teknis & Kebijakan NIK</h3>
              <p className="text-xs text-emerald-200">Dinas Lingkungan Hidup dan Perhubungan Kabupaten Tuban</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs sm:text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Main Rule Highlight */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Aturan Validasi NIK Ganda (Satu NIK Satu Kali)</span>
            </div>
            <p className="text-xs leading-relaxed text-red-900">
              Untuk menjamin <strong>asas keadilan dan pemerataan sosial</strong> bagi seluruh masyarakat di 20 Kecamatan
              se-Kabupaten Tuban, setiap Nomor Induk Kependudukan (NIK) KTP hanya berhak menerima alokasi bantuan bibit
              tanaman gratis <strong>sebanyak 1 (satu) kali</strong>.
            </p>
            <p className="text-xs font-semibold text-red-800">
              Apabila NIK pemohon telah tercatat di Batch 1 (Musim Hujan 2024) atau Batch 2 (Tuban Asri 2025), maka sistem
              otomatis <strong>menolak</strong> dan memblokir formulir pengisian data diri pada Batch 3 (2026).
            </p>
          </div>

          {/* Syarat & Ketentuan */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Syarat & Ketentuan Pemohon:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>Warga Negara Indonesia berdomisili di Kabupaten Tuban (memiliki KTP Tuban dengan kode 3523).</li>
              <li>Perorangan berhak mengajukan maksimal 10 bibit pohon peneduh / buah-buahan.</li>
              <li>Kelompok Tani, Karang Taruna, dan Sekolah dapat mengajukan hingga maksimal 40 bibit.</li>
              <li>Menyediakan lahan tanam yang memadai dan bukan merupakan sengketa.</li>
              <li>Menandatangani komitmen kesanggupan merawat bibit hingga tumbuh besar.</li>
            </ul>
          </div>

          {/* Alur Pengambilan Bibit */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Trees className="w-4 h-4 text-emerald-600" />
              <span>Alur Pengambilan Bibit di Persemaian:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                  1
                </span>
                <strong className="block text-xs text-slate-900">Validasi NIK Online</strong>
                <span className="text-[11px] text-slate-500">Cek NIK dan isi formulir pendaftaran jika lolos verifikasi.</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                  2
                </span>
                <strong className="block text-xs text-slate-900">Dapatkan Bukti Tiket</strong>
                <span className="text-[11px] text-slate-500">Simpan atau cetak surat tanda terima yang memuat nomor registrasi.</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                  3
                </span>
                <strong className="block text-xs text-slate-900">Ambil Bibit di Nursery</strong>
                <span className="text-[11px] text-slate-500">Tunjukkan KTP dan nomor registrasi ke petugas persemaian Tuban.</span>
              </div>
            </div>
          </div>

          {/* Lokasi & Jam Operasional */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Lokasi Persemaian & Pengambilan Bibit:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Kebun Bibit Permanen DLHP Kabupaten Tuban</strong><br />
              Kompleks Hutan Kota Tuban / Kantor DLHP, Jl. Dr. Wahidin Sudirohusodo No. 44, Ronggomulyo, Tuban, Jawa Timur 62313.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 pt-1">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pelayanan Pengambilan: Senin s/d Jumat, Pukul 08.30 – 14.30 WIB</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
