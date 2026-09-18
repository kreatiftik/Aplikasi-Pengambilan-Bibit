import React, { useState, useEffect } from 'react';
import {
  Trees,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  BookOpen
} from 'lucide-react';
import { BibitItem } from '../types';
import {
  getStoredBibitList,
  saveOrUpdateBibitItem,
  deleteBibitItem,
  updateBibitStock
} from '../services/storage';

interface AdminSeedlingManagementProps {
  onInventoryChanged?: () => void;
}

export const AdminSeedlingManagement: React.FC<AdminSeedlingManagementProps> = ({
  onInventoryChanged
}) => {
  const [bibitList, setBibitList] = useState<BibitItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Add / Edit Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Form Fields
  const [formNama, setFormNama] = useState('');
  const [formNamaLatin, setFormNamaLatin] = useState('');
  const [formKategori, setFormKategori] = useState<'Peneduh' | 'Buah' | 'Konservasi'>('Peneduh');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formStok, setFormStok] = useState(1000);
  const [formMaxPerorangan, setFormMaxPerorangan] = useState(5);
  const [formMaxKelompok, setFormMaxKelompok] = useState(25);
  const [formBadge, setFormBadge] = useState('Populer');

  // Quick Stock Adjust Modal / Popup
  const [quickStockItem, setQuickStockItem] = useState<BibitItem | null>(null);
  const [quickStockAmount, setQuickStockAmount] = useState<number>(0);

  // Delete Confirm Modal
  const [itemToDelete, setItemToDelete] = useState<BibitItem | null>(null);

  // Success / Alert Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = () => {
    const list = getStoredBibitList();
    setBibitList(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId('');
    setFormNama('');
    setFormNamaLatin('');
    setFormKategori('Peneduh');
    setFormDeskripsi('');
    setFormStok(1500);
    setFormMaxPerorangan(5);
    setFormMaxKelompok(25);
    setFormBadge('Varietas Baru');
    setShowItemModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: BibitItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormNama(item.nama);
    setFormNamaLatin(item.namaLatin || '');
    setFormKategori(item.kategori);
    setFormDeskripsi(item.deskripsi || '');
    setFormStok(item.stokTersedia);
    setFormMaxPerorangan(item.maxPerorangan || 5);
    setFormMaxKelompok(item.maxKelompok || 25);
    setFormBadge(item.badge || 'Tersedia');
    setShowItemModal(true);
  };

  // Submit Add/Edit Form
  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      showToast('Nama bibit tanaman wajib diisi', 'error');
      return;
    }

    const id = isEditing && editingId ? editingId : formNama.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${Date.now().toString().slice(-4)}`;

    const newItem: BibitItem = {
      id,
      nama: formNama.trim(),
      namaLatin: formNamaLatin.trim() || undefined,
      kategori: formKategori,
      deskripsi: formDeskripsi.trim() || 'Bibit tanaman berkualitas dari Persemaian DLHP Tuban.',
      stokTersedia: Number(formStok) || 0,
      maxPerorangan: Number(formMaxPerorangan) || 5,
      maxKelompok: Number(formMaxKelompok) || 25,
      badge: formBadge.trim() || undefined,
    };

    saveOrUpdateBibitItem(newItem);
    loadData();
    setShowItemModal(false);
    showToast(isEditing ? `Data bibit "${newItem.nama}" berhasil diperbarui!` : `Jenis bibit baru "${newItem.nama}" berhasil ditambahkan!`);
    if (onInventoryChanged) onInventoryChanged();
  };

  // Quick Stock Increase/Decrease
  const handleQuickAdjust = (id: string, delta: number) => {
    const updated = updateBibitStock(id, delta);
    if (updated) {
      loadData();
      showToast(`Stok ${updated.nama} berhasil disesuaikan menjadi ${updated.stokTersedia.toLocaleString('id-ID')} bibit.`);
      if (onInventoryChanged) onInventoryChanged();
    }
  };

  // Delete Confirm
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteBibitItem(itemToDelete.id);
    loadData();
    showToast(`Jenis bibit "${itemToDelete.nama}" telah dihapus.`);
    setItemToDelete(null);
    if (onInventoryChanged) onInventoryChanged();
  };

  // Filtered List
  const filteredBibit = bibitList.filter((b) => {
    const matchSearch =
      b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.namaLatin && b.namaLatin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.deskripsi && b.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCat = filterCategory === 'ALL' || b.kategori === filterCategory;
    return matchSearch && matchCat;
  });

  const totalStokKeseluruhan = bibitList.reduce((acc, curr) => acc + (curr.stokTersedia || 0), 0);
  const totalJenisTanaman = bibitList.length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg transition animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-800 text-emerald-50 border border-emerald-600'
              : 'bg-red-800 text-red-50 border border-red-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/70 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                Manajemen Persemaian
              </span>
              <span className="text-xs text-slate-500">Nursery DLHP Tuban</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Pengelolaan Stok & Varietas Bibit Tanaman
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola ketersediaan bibit, tambah varietas baru, dan atur batasan kuota perorangan/kelompok
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadData}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Segarkan data stok"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Jenis Bibit Baru</span>
            </button>
          </div>
        </div>

        {/* Inventory Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Total Varietas Aktif</span>
              <span className="text-xl font-bold text-slate-900">{totalJenisTanaman} Jenis</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Trees className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Total Stok di Persemaian</span>
              <span className="text-xl font-bold text-emerald-700">{totalStokKeseluruhan.toLocaleString('id-ID')} Bibit</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Kategori Terbanyak</span>
              <span className="text-sm font-bold text-slate-800">Peneduh & Buah Produktif</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tanaman, nama latin, atau deskripsi..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 outline-none"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
            >
              <option value="ALL">Semua Kategori Tanaman</option>
              <option value="Peneduh">Kategori Peneduh / Penghijauan</option>
              <option value="Buah">Kategori Buah Produktif</option>
              <option value="Konservasi">Kategori Konservasi Air / Tanah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seedling Inventory Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBibit.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Trees className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Tidak ada bibit tanaman ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau tambah bibit baru</p>
          </div>
        ) : (
          filteredBibit.map((item) => {
            const isLowStock = item.stokTersedia < 500;
            const isOutOfStock = item.stokTersedia <= 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition shadow-xs flex flex-col justify-between overflow-hidden ${
                  isOutOfStock
                    ? 'border-red-200 bg-red-50/20'
                    : isLowStock
                    ? 'border-amber-200'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.kategori === 'Peneduh'
                          ? 'bg-teal-100 text-teal-800'
                          : item.kategori === 'Buah'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.kategori}
                    </span>

                    {item.badge && (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">{item.nama}</h3>
                  {item.namaLatin && (
                    <p className="text-xs text-slate-500 italic font-mono mt-0.5">{item.namaLatin}</p>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {item.deskripsi}
                  </p>

                  {/* Stock Details Box */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Stok Tersedia:</span>
                      <span
                        className={`font-mono text-sm font-bold ${
                          isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {item.stokTersedia.toLocaleString('id-ID')} Batang
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, (item.stokTersedia / 5000) * 100))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Maks Perorangan: <strong>{item.maxPerorangan || 5}</strong></span>
                      <span>Maks Kelompok: <strong>{item.maxKelompok || 25}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Quick Stock Controls & Action Buttons */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-3">
                  {/* Quick Adjust Buttons */}
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-500 font-medium">Ubah Stok:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item.id, -100)}
                        title="Kurangi 100 stok"
                        disabled={item.stokTersedia < 100}
                        className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
                      >
                        -100
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item.id, -10)}
                        title="Kurangi 10 stok"
                        disabled={item.stokTersedia < 10}
                        className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item.id, 50)}
                        title="Tambah 50 stok"
                        className="px-2 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold cursor-pointer"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item.id, 500)}
                        title="Tambah 500 stok"
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer shadow-xs"
                      >
                        +500
                      </button>
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Detail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Tambah / Edit Jenis Bibit */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {isEditing ? 'Edit Data & Stok Bibit Tanaman' : 'Tambah Jenis Bibit Tanaman Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Nama Tanaman / Bibit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Tabebuya Pink"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-900 focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Latin / Ilmiah:</label>
                  <input
                    type="text"
                    value={formNamaLatin}
                    onChange={(e) => setFormNamaLatin(e.target.value)}
                    placeholder="Contoh: Handroanthus heptaphyllus"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono text-slate-800 focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Kategori Tanaman <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-900 focus:bg-white focus:border-emerald-600"
                  >
                    <option value="Peneduh">Peneduh / Pelindung Jalan</option>
                    <option value="Buah">Buah Produktif Masyarakat</option>
                    <option value="Konservasi">Konservasi Hutan & Air</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Badge Label (Keunggulan):</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Contoh: Bunga Indah, Tahan Panas"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800 focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi & Keunggulan Bibit:</label>
                <textarea
                  rows={2}
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Deskripsi singkat jenis bibit, media tanam, atau kecocokan lahan..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800 focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Stok Tersedia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStok}
                    onChange={(e) => setFormStok(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold text-emerald-800 focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Maks Perorangan:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formMaxPerorangan}
                    onChange={(e) => setFormMaxPerorangan(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Maks Kelompok:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formMaxKelompok}
                    onChange={(e) => setFormMaxKelompok(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-800 focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Bibit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Jenis Bibit */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Hapus Jenis Bibit</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus jenis bibit <strong>{itemToDelete.nama}</strong> dari sistem katalog persemaian?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hapus Bibit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
