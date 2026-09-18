import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Trees, 
  QrCode, 
  Download,
  Share2,
  Building,
  Check
} from 'lucide-react';
import { NIKRecord } from '../types';

interface RegistrationReceiptModalProps {
  record: NIKRecord;
  onClose: () => void;
}

export const RegistrationReceiptModal: React.FC<RegistrationReceiptModalProps> = ({
  record,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(record.nomorRegistrasi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center border border-emerald-400/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Bukti Pendaftaran Elektronik</h3>
              <p className="text-xs text-emerald-200">Surat Tanda Terima Pengambilan Bibit DLHP Tuban</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Body */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Pemerintah Kabupaten Tuban
            </div>
            <h2 className="text-base sm:text-lg font-extrabold uppercase text-slate-900 tracking-tight">
              Dinas Lingkungan Hidup dan Perhubungan (DLHP)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jl. Dr. Wahidin Sudirohusodo No. 44, Tuban, Jawa Timur • Telp: (0356) 321890
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full border border-emerald-300">
              TANDA TERIMA PENGAMBILAN BIBIT TANAMAN GRATIS
            </div>
          </div>

          {/* Registration Code Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Nomor Registrasi DLHP</span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-800 tracking-wider">
                {record.nomorRegistrasi}
              </div>
              <span className="text-[11px] text-slate-500">
                Tunjukkan nomor/tiket ini kepada petugas persemaian saat pengambilan bibit.
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* QR Code Mock Symbol */}
              <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1.5 flex flex-col items-center justify-center shadow-xs">
                <QrCode className="w-10 h-10 text-slate-800" />
                <span className="text-[8px] font-mono text-slate-500 uppercase">Valid</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin No'}</span>
              </button>
            </div>
          </div>

          {/* Biodata Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 text-[11px] block font-medium">Nama Pemohon (KTP)</span>
              <strong className="text-slate-900 block text-base">{record.nama}</strong>
              <span className="text-slate-600 font-mono text-xs">NIK: {record.nik}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 text-[11px] block font-medium">Domisili Tuban</span>
              <strong className="text-slate-900 block">Kec. {record.kecamatan}</strong>
              <span className="text-slate-600 text-xs">Desa {record.desa} ({record.alamatLengkap})</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 text-[11px] block font-medium">Kontak WhatsApp</span>
              <strong className="text-slate-900 block">{record.kontak}</strong>
              <span className="text-slate-500 text-[11px]">Kategori: {record.kategoriPemohon}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 text-[11px] block font-medium">Alokasi Batch</span>
              <strong className="text-slate-900 block">{record.batchNama}</strong>
              <span className="text-emerald-700 font-semibold text-[11px]">Status: Siap Diambil</span>
            </div>
          </div>

          {/* Seedlings Allocation Table */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
              <span>Daftar Bibit yang Diberikan:</span>
              <span className="font-mono text-emerald-800 font-extrabold">{record.totalBibit} Bibit Total</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">No</th>
                    <th className="px-3 py-2">Jenis Bibit Pohon</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2 text-right">Jumlah Alokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.bibit.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{item.namaBibit}</td>
                      <td className="px-3 py-2 text-slate-600">{item.kategori}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-emerald-800">
                        {item.jumlah} bibit
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pickup Instructions */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs space-y-2 text-emerald-950">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Lokasi & Petunjuk Pengambilan Bibit:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>
                <strong>Lokasi:</strong> Kebun Persemaian Permanen DLHP Kab. Tuban (Kompleks Hutan Kota / Kantor DLHP Tuban).
              </li>
              <li>
                <strong>Waktu Layanan:</strong> Hari kerja (Senin - Jumat) pukul 08.30 - 14.30 WIB.
              </li>
              <li>
                <strong>Syarat Pengambilan:</strong> Membawa KTP asli pemohon dan menunjukkan tanda terima / nomor registrasi ini.
              </li>
              <li>
                Disarankan membawa wadah/kantung ramah lingkungan atau kendaraan bak terbuka untuk membawa bibit tanaman.
              </li>
            </ul>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Tutup Jendela
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF Tiket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
