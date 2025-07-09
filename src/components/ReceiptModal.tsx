import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, FileText, DollarSign } from 'lucide-react';

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

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
  onUpdate: (receipt: Receipt) => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt, onUpdate }) => {
  const [formData, setFormData] = useState({
    receipt_date: '',
    receipt_no: '',
    total_amount: 0,
    kdv_10_amount: 0,
    top_kdv_amount: 0,
    net_amount: 0
  });

  useEffect(() => {
    if (receipt) {
      setFormData({
        receipt_date: receipt.receipt_date || '',
        receipt_no: receipt.receipt_no || '',
        total_amount: receipt.total_amount || 0,
        kdv_10_amount: receipt.kdv_10_amount || 0,
        top_kdv_amount: receipt.top_kdv_amount || 0,
        net_amount: receipt.net_amount || 0
      });
    }
  }, [receipt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (receipt) {
      onUpdate({
        ...receipt,
        ...formData
      });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate net amount when total or KDV changes
    if (field === 'total_amount' || field === 'top_kdv_amount') {
      const totalAmount = field === 'total_amount' ? Number(value) : formData.total_amount;
      const kdvAmount = field === 'top_kdv_amount' ? Number(value) : formData.top_kdv_amount;
      
      setFormData(prev => ({
        ...prev,
        net_amount: totalAmount - kdvAmount
      }));
    }
  };

  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Fiş Düzenle
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Tarih
            </label>
            <input
              type="date"
              value={formData.receipt_date}
              onChange={(e) => handleChange('receipt_date', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Fiş No
            </label>
            <input
              type="text"
              value={formData.receipt_no}
              onChange={(e) => handleChange('receipt_no', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="h-4 w-4 inline mr-2" />
              Toplam Tutar (TL)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => handleChange('total_amount', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              KDV %10 Tutar (TL)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.kdv_10_amount}
              onChange={(e) => handleChange('kdv_10_amount', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Toplam KDV (TL)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.top_kdv_amount}
              onChange={(e) => handleChange('top_kdv_amount', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Net Tutar (TL)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.net_amount}
              onChange={(e) => handleChange('net_amount', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptModal;