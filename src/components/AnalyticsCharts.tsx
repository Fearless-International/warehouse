'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AnalyticsCharts({
  statusData,
  requestTrends,
  topProducts,
  branchPerformance,
  monthlyData
}: any) {
  
  const statusChartData = statusData.map((item: any) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  }));

  const trendsChartData = requestTrends.map((item: any) => ({
    name: `${item._id.month}/${item._id.year}`,
    requests: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Monthly Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Requests Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Request Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Request Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Request Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendsChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Top 10 Requested Products</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={200} />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#10b981" name="Total Quantity" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Branch Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Branch Performance & Approval Rates</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Branch</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total Requests</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Approved</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Approval Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {branchPerformance.map((branch: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 font-medium">{branch.branch}</td>
                  <td className="px-6 py-4">{branch.requests}</td>
                  <td className="px-6 py-4 text-green-600">{branch.approved}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${branch.approvalRate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{branch.approvalRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}