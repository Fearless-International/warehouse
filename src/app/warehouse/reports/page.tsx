'use client';

import { useState, useEffect } from 'react';
import { FileDown, FileSpreadsheet, Download, Calendar, Filter, Lock, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLicense } from '@/hooks/useLicense';
import Link from 'next/link';

type PeriodType = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export default function WarehouseReportsPage() {
  // 🔐 LICENSE CHECK
  const { license, hasFeature, loading: licenseLoading } = useLicense();
  
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ⏳ SHOW LOADING WHILE VERIFYING LICENSE
  if (licenseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying license...</p>
        </div>
      </div>
    );
  }

  // ✅ CHECK IF USER HAS ACCESS
  const hasReportsAccess = hasFeature('customReports');

  // 📅 DATE RANGE LOGIC
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (periodType) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          alert('Please select both start and end dates');
          return null;
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'all':
      default:
        startDate = new Date('2020-01-01');
        break;
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  // 🧾 DISPLAY PERIOD LABEL
  const getPeriodLabel = () => {
    switch (periodType) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'custom': return `${customStartDate} to ${customEndDate}`;
      case 'all': return 'All Time';
      default: return '';
    }
  };

  // 📊 GENERATE REPORT
  const generateReport = async (reportType: string, format: 'pdf' | 'excel') => {
    if (!hasReportsAccess) {
      alert('⚠️ Advanced Reporting requires Professional or Enterprise plan. Please upgrade to continue.');
      return;
    }

    const dateRange = getDateRange();
    if (!dateRange) return;

    setLoading(true);
    setActiveReport(`${reportType}-${format}`);
    
    try {
      const response = await fetch(
        `/api/reports/${reportType}?format=${format}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&period=${getPeriodLabel()}`
      );
      
      if (!response.ok) throw new Error('Failed to generate report');

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${periodType}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const result = await response.json();
        const worksheet = XLSX.utils.json_to_sheet(result.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, result.filename);
      }

      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Report error:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
      setActiveReport('');
    }
  };

  // ============================================================
  // 🧭 PAGE RENDER
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500 bg-clip-text text-transparent mb-2">
              Reports & Downloads
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and download comprehensive reports in PDF or Excel format
            </p>
          </div>

          {/* LICENSE BADGE */}
          {hasReportsAccess ? (
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Sparkles size={16} /> Professional Active
            </span>
          ) : (
            <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Lock size={16} /> Upgrade Required
            </span>
          )}
        </div>
      </div>

      {/* LOCKED STATE BANNER */}
      {!hasReportsAccess && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-500 dark:border-orange-400 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                🔒 Advanced Reporting Locked
              </h3>
              <p className="text-orange-800 dark:text-orange-200 mb-4">
                Unlock advanced reporting with custom date ranges, multiple export formats, and detailed analytics by upgrading to <strong>Professional</strong> or <strong>Enterprise</strong>.
              </p>
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                <Sparkles size={18} />
                View Plans & Upgrade
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PERIOD FILTER SECTION */}
      {hasReportsAccess && (
        <div className="backdrop-blur-xl bg-white/90 dark:bg-black/90 rounded-2xl shadow-2xl p-6 border-2 border-gray-200 dark:border-yellow-500/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Report Period</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Filter size={18} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <>
              {/* PERIOD BUTTONS */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                {(['today', 'week', 'month', 'year', 'custom', 'all'] as PeriodType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPeriodType(type)}
                    className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      periodType === type
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-yellow-500 dark:to-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type === 'today' && '📅 Today'}
                    {type === 'week' && '📊 Last 7 Days'}
                    {type === 'month' && '📆 This Month'}
                    {type === 'year' && '📈 This Year'}
                    {type === 'custom' && '🔧 Custom Range'}
                    {type === 'all' && '🌐 All Time'}
                  </button>
                ))}
              </div>

              {/* CUSTOM RANGE */}
              {periodType === 'custom' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-500 dark:border-blue-400">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-300 dark:border-blue-600">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  📊 Selected Period: <span className="text-blue-600 dark:text-blue-400">{getPeriodLabel()}</span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* GENERATING MESSAGE */}
      {loading && (
        <div className="mb-6 backdrop-blur-xl bg-blue-50/90 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Download className="animate-bounce text-blue-600 dark:text-blue-400" size={24} />
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Generating {getPeriodLabel()} report... Please wait.
            </p>
          </div>
        </div>
      )}

      {/* REPORT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'All Requests',
            desc: 'Download comprehensive report of all requests including status, dates, and delivery information.',
            gradient: 'from-blue-500 to-cyan-500',
            api: 'requests'
          },
          {
            title: 'Product Demand',
            desc: 'Analyze product demand across all branches with quantities, trends, and distributions.',
            gradient: 'from-green-500 to-teal-500',
            api: 'product-demand'
          },
          {
            title: 'Branch Performance',
            desc: 'View branch performance including total requests, approval rates, and activity trends.',
            gradient: 'from-purple-500 to-pink-500',
            api: 'branch-performance'
          }
        ].map((report) => (
          <div
            key={report.api}
            className={`backdrop-blur-xl bg-white/90 dark:bg-black/90 rounded-2xl shadow-2xl p-6 border-2 border-gray-200 dark:border-yellow-500/30 transition-all duration-300 ${
              hasReportsAccess ? 'hover:scale-105' : 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${report.gradient} rounded-2xl flex items-center justify-center shadow-xl`}
              >
                <FileDown className="text-white" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  {report.title}
                  {!hasReportsAccess && <Lock size={16} className="text-orange-600" />}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {hasReportsAccess ? getPeriodLabel() : 'Locked'}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{report.desc}</p>

            <div className="flex gap-3">
              <button
                onClick={() => generateReport(report.api, 'pdf')}
                disabled={loading || !hasReportsAccess}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
              >
                <FileDown size={16} />
                {activeReport === `${report.api}-pdf` ? 'Generating...' : 'PDF'}
              </button>
              <button
                onClick={() => generateReport(report.api, 'excel')}
                disabled={loading || !hasReportsAccess}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
              >
                <FileSpreadsheet size={16} />
                {activeReport === `${report.api}-excel` ? 'Generating...' : 'Excel'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
