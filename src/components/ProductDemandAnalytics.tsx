'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProductDemandAnalytics({ productDemandData }: any) {
  const [timeframe, setTimeframe] = useState('today');

  const currentData = productDemandData[timeframe] || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Product Demand Across All Branches</h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeframe === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeframe === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {currentData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No requests found for this period</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRequests" fill="#3b82f6" name="Total Requests" />
              <Bar dataKey="totalQuantity" fill="#10b981" name="Total Quantity" />
            </BarChart>
          </ResponsiveContainer>

          {/* Detailed Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total Requests</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Branches</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Avg per Request</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentData.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{item.product}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {item.totalRequests}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {item.totalQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.branches.length} branches</td>
                    <td className="px-6 py-4 text-gray-600">
                      {Math.round(item.totalQuantity / item.totalRequests)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-blue-700 font-medium">Total Products Requested</p>
              <p className="text-2xl font-bold text-blue-900">{currentData.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-green-700 font-medium">Total Quantity</p>
              <p className="text-2xl font-bold text-green-900">
                {currentData.reduce((sum: number, item: any) => sum + item.totalQuantity, 0)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm text-purple-700 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-purple-900">
                {currentData.reduce((sum: number, item: any) => sum + item.totalRequests, 0)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}