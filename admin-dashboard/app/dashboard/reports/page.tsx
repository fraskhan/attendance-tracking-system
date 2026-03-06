'use client';

import { useEffect, useState } from 'react';
import { getWeeklyReport } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { getWeekStart, formatDate } from '@/lib/utils';
import type { WeeklyReport } from '@/types';
import { Calendar, Download } from 'lucide-react';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(getWeekStart());
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, [startDate]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const data = await getWeeklyReport(token, startDate);
      setReport(data);
    } catch (err) {
      console.error('Error loading report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    const headers = ['Employee', 'Total Hours', 'Days Worked', 'Missing Time Outs', 'Days Not Logged'];
    const rows = report.employees.map((emp) => [
      emp.full_name,
      emp.total_hours.toFixed(2),
      emp.days_worked,
      emp.missing_time_outs,
      emp.days_not_logged,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      'Organization Totals',
      `Total Hours,${report.organization_totals.total_hours.toFixed(2)}`,
      `Total Days Worked,${report.organization_totals.total_days_worked}`,
      `Total Missing Time Outs,${report.organization_totals.total_missing_time_outs}`,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${startDate}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
          <p className="mt-2 text-gray-600">View weekly attendance summaries</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Download className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setStartDate(getWeekStart())}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
        >
          This Week
        </button>
        {report && (
          <span className="text-sm text-gray-600">
            {formatDate(report.week_start)} - {formatDate(report.week_end)}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {report && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Worked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Missing Time Outs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Not Logged
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.employees && report.employees.length > 0 ? report.employees.map((employee) => (
                  <tr key={employee.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.total_hours.toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.days_worked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.missing_time_outs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.days_not_logged}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No employee data for this week
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Organization Totals</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {report.organization_totals.total_hours.toFixed(2)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Days Worked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {report.organization_totals.total_days_worked}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Missing Time Outs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {report.organization_totals.total_missing_time_outs}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
