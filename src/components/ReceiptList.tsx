import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import ReceiptModal from './ReceiptModal';
import toast from 'react-hot-toast';

interface Receipt {
  id: number;
  telegram_user_id: string;
  telegram_username: string;
  first_name: string;
  last_name: string;
  receipt_date: string;
  receipt_no: string;
  total_amount: number;
  kdv_10_amount: number;
  top_kdv_amount: number;
  net_amount: number;
  created_at: string;
  updated_at: string;
}

const ReceiptList: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    user: '',
    page: 1,
    limit: 25
  });
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, [filters]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      console.log('Fetching receipts with filters:', filters);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const url = `/api/receipts?${params}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      setReceipts(data.data || []);
      setTotalReceipts(data.total || 0);
    } catch (error) {
      console.error('Fetch receipts error:', error);
      toast.error('Fişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.user) params.append('user', filters.user);

      const response = await fetch(`/api/receipts/export/excel?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fisler_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel dosyası indirildi');
    } catch (error) {
      toast.error('Excel export hatası');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu fişi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReceipts(prev => prev.filter(r => r.id !== id));
        toast.success('Fiş silindi');
      } else {
        toast.error('Fiş silinemedi');
      }
    } catch (error) {
      toast.error('Fiş silinemedi');
    }
  };

  const handleEdit = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setModalOpen(true);
  };

  const handleUpdate = async (updatedReceipt: Receipt) => {
    try {
      const response = await fetch(`/api/receipts/${updatedReceipt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReceipt)
      });

      if (response.ok) {
        setReceipts(prev => prev.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
        setModalOpen(false);
        toast.success('Fiş güncellendi');
      } else {
        toast.error('Fiş güncellenemedi');
      }
    } catch (error) {
      toast.error('Fiş güncellenemedi');
    }
  };

  const totalPages = Math.ceil(totalReceipts / filters.limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Fişler</h1>
          <p className="text-gray-400 mt-1">Tüm fişleri görüntüle ve yönet</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Excel İndir
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Kullanıcı
            </label>
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Sayfa Başına
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Tarih</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Fiş No</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Toplam</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">TOPKDV</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">KDV'siz TUTAR</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Gönderen</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    Fiş bulunamadı
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-white">
                      {formatDate(receipt.receipt_date)}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {receipt.receipt_no || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-green-400 font-semibold">
                      {formatCurrency(receipt.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-yellow-400">
                      {formatCurrency(receipt.top_kdv_amount)}
                    </td>
                    <td className="py-3 px-4 text-blue-400">
                      {formatCurrency(receipt.net_amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {receipt.telegram_username || 
                       `${receipt.first_name || ''} ${receipt.last_name || ''}`.trim() || 
                       'Anonim'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(receipt)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-gray-400">
            Toplam {totalReceipts} fişten {((filters.page - 1) * filters.limit) + 1}-
            {Math.min(filters.page * filters.limit, totalReceipts)} arası gösteriliyor
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1).toString())}
              disabled={filters.page === 1}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <span className="text-gray-400">
              {filters.page} / {totalPages}
            </span>
            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1).toString())}
              disabled={filters.page === totalPages}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        receipt={selectedReceipt}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ReceiptList;