
import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, Plus, Edit2, Trash2, X, Save, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Transaction, User, Role } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { clsx } from 'clsx';

interface FinancialReportProps {
  user: User;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter States: Date Range
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Default to start of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]; // Default to today
  });

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'INCOME',
    description: '',
    amount: 0,
  });

  const isAdmin = user.role === Role.ADMIN;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const all = dataService.getTransactions();
    setTransactions(all);
  };

  useEffect(() => {
    // Filter by Date Range
    let filtered = transactions.filter(t => {
      return t.date >= startDate && t.date <= endDate;
    });

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredTransactions(filtered);
  }, [transactions, startDate, endDate]);

  const handleEdit = (t: Transaction) => {
    setFormData({
      date: t.date,
      type: t.type,
      description: t.description,
      amount: t.amount
    });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data transaksi ini?")) {
      dataService.deleteTransaction(id);
      loadData();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      alert("Mohon isi semua data yang diperlukan.");
      return;
    }

    const transaction: Transaction = {
      id: editingId || Date.now().toString(),
      date: formData.date || new Date().toISOString().split('T')[0],
      type: formData.type || 'INCOME',
      description: formData.description,
      amount: Number(formData.amount),
      pic: editingId ? (transactions.find(t => t.id === editingId)?.pic || user.name) : user.name
    };

    dataService.saveTransaction(transaction);
    loadData();
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      description: '',
      amount: 0,
    });
    setEditingId(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Calculations
  const totalIncome = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Laporan Keuangan', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' });
    const periodText = `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`;

    doc.text(periodText, 14, 30);
    doc.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

    // Summary Info
    doc.setTextColor(0);
    doc.text(`Total Pemasukan: ${formatCurrency(totalIncome)}`, 14, 45);
    doc.text(`Total Pengeluaran: ${formatCurrency(totalExpense)}`, 14, 52);
    doc.text(`Saldo Bersih: ${formatCurrency(netBalance)}`, 14, 59);

    // Table
    const tableColumn = ["Tanggal", "Tipe", "Keterangan", "Jumlah", "PIC"];
    const tableRows: any[] = [];

    filteredTransactions.forEach(t => {
      const transactionData = [
        t.date,
        t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
        t.description,
        formatCurrency(t.amount),
        t.pic
      ];
      tableRows.push(transactionData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
    });

    const fileName = `Laporan_Keuangan_${startDate}_sd_${endDate}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Laporan Keuangan</h2>
          <p className="text-sm text-gray-500">Kelola pemasukan dan pengeluaran.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>Tambah Transaksi</span>
            </button>
          )}
          <button 
            onClick={downloadPDF}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter size={18} />
          <span>Filter Tanggal:</span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">Dari</span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg pl-12 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">Sampai</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Pemasukan</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(totalIncome)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Pengeluaran</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(totalExpense)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center", netBalance >= 0 ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600")}>
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Saldo Bersih</p>
            <h3 className={clsx("text-xl font-bold", netBalance >= 0 ? "text-gray-900" : "text-orange-600")}>
              {formatCurrency(netBalance)}
            </h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium w-1/3">Keterangan</th>
                <th className="px-6 py-4 font-medium">Jumlah</th>
                <th className="px-6 py-4 font-medium">PIC</th>
                {isAdmin && <th className="px-6 py-4 font-medium text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      t.type === 'INCOME' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{t.description}</td>
                  <td className={clsx(
                    "px-6 py-4 font-mono font-medium",
                    t.type === 'INCOME' ? "text-green-600" : "text-red-600"
                  )}>
                    {t.type === 'EXPENSE' ? '-' : ''}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{t.pic}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(t)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>Tidak ada data transaksi untuk periode yang dipilih.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Transaksi' : 'Transaksi Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Tanggal</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Tipe Transaksi</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="INCOME"
                      checked={formData.type === 'INCOME'}
                      onChange={() => setFormData({...formData, type: 'INCOME'})}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="EXPENSE"
                      checked={formData.type === 'EXPENSE'}
                      onChange={() => setFormData({...formData, type: 'EXPENSE'})}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Pengeluaran</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Keterangan (Nama Transaksi)</label>
                <input 
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Contoh: Biaya Operasional, Penjualan, dll"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Jumlah (Nominal)</label>
                <input 
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Save size={18} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
