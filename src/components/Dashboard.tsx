import React, { useState, useEffect } from 'react';
import { Receipt, TrendingUp, DollarSign, Calendar, Users, FileText, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

interface DashboardStats {
  summary: {
    totalReceipts: number;
    totalAmount: number;
    totalKdv: number;
    thisMonthReceipts: number;
  };
  recentReceipts: any[];
  monthlyStats: any[];
  userStats: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Stats data:', data);
      setStats(data);
    } catch (error) {
      console.error('Fetch stats error:', error);
      toast.error('İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/receipts/export/excel');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Veri yüklenemedi</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Fiş',
      value: stats.summary.totalReceipts,
      icon: Receipt,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Toplam Tutar',
      value: formatCurrency(stats.summary.totalAmount),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Toplam KDV',
      value: formatCurrency(stats.summary.totalKdv),
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      title: 'Bu Ay',
      value: stats.summary.thisMonthReceipts,
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">BARİN MUHASEBE sistemi genel bakış</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Excel İndir
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Receipts & Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Receipts */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Son Fişler
          </h3>
          <div className="space-y-3">
            {stats.recentReceipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">Fiş #{receipt.receipt_no || 'N/A'}</p>
                  <p className="text-sm text-gray-400">{receipt.telegram_username || 'Anonim'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">{formatCurrency(receipt.total_amount)}</p>
                  <p className="text-sm text-gray-400">{formatDate(receipt.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Stats */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-400" />
            Kullanıcı İstatistikleri
          </h3>
          <div className="space-y-3">
            {stats.userStats.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">
                    {user.telegram_username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonim'}
                  </p>
                  <p className="text-sm text-gray-400">{user.receipt_count} fiş</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">{formatCurrency(user.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
          Aylık İstatistikler
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Ay</th>
                <th className="text-left py-3 px-4 text-gray-300">Fiş Sayısı</th>
                <th className="text-left py-3 px-4 text-gray-300">Toplam Tutar</th>
                <th className="text-left py-3 px-4 text-gray-300">TOPKDV</th>
                <th className="text-left py-3 px-4 text-gray-300">KDV'siz TUTAR</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlyStats.map((month, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-white">{month.month}</td>
                  <td className="py-3 px-4 text-gray-300">{month.count}</td>
                  <td className="py-3 px-4 text-green-400">{formatCurrency(month.total_amount)}</td>
                  <td className="py-3 px-4 text-yellow-400">{formatCurrency(month.topKdvAmount)}</td>
                  <td className="py-3 px-4 text-gray-300">{formatCurrency(month.netAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;