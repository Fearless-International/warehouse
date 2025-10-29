'use client';

import { useEffect, useState } from 'react';
import { useLicense } from '@/hooks/useLicense';
import UpgradePrompt from '@/components/UpgradePrompt';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ProductDemandAnalytics from '@/components/ProductDemandAnalytics';
import { Sparkles } from 'lucide-react';

export default function WarehouseAnalyticsPage() {
  const { hasFeature, loading, license } = useLicense();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && hasFeature('advancedAnalytics')) {
      // Fetch analytics data from API
      fetchAnalyticsData();
    }
  }, [loading, hasFeature]);

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch('/api/analytics/warehouse');
      const data = await res.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Check license
  if (!hasFeature('advancedAnalytics')) {
    return <UpgradePrompt 
      feature="Advanced Analytics" 
      description="Unlock powerful insights with interactive charts, trend analysis, predictive analytics, and comprehensive performance metrics for your warehouse operations."
      requiredPlan="Professional"
      currentPlan={license?.type || 'basic'}
    />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Professional badge */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your operations
          </p>
        </div>
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          <Sparkles size={16} />
          Professional Feature Active
        </span>
      </div>

      {analyticsData ? (
        <>
          <AnalyticsCharts
            statusData={analyticsData.statusData}
            requestTrends={analyticsData.requestTrends}
            topProducts={analyticsData.topProducts}
            branchPerformance={analyticsData.branchPerformance}
            monthlyData={analyticsData.monthlyData}
          />

          <div className="mt-6">
            <ProductDemandAnalytics
              productDemandData={analyticsData.productDemandData}
            />
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
        </div>
      )}
    </div>
  );
}