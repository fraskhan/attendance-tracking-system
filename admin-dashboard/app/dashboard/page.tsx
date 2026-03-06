'use client';

import { useEffect, useState } from 'react';
import { getDashboardOverview } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { DashboardOverview } from '@/types';
import { Users, UserCheck, AlertCircle, Clock, Calendar, FileText } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const overview = await getDashboardOverview(token);
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      name: 'Total Active Employees',
      value: data?.total_active_employees || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Logged In Today',
      value: data?.logged_in_today || 0,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      name: 'Missing Time Outs',
      value: data?.missing_time_outs_today || 0,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Hours Today',
      value: data?.total_hours_today?.toFixed(2) || '0.00',
      icon: Clock,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome to your attendance management system</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`${metric.color} rounded-lg p-3`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href="/dashboard/employees"
            className="flex items-center justify-center rounded-lg border-2 border-gray-200 p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div>
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">Manage Employees</p>
            </div>
          </a>
          <a
            href="/dashboard/attendance"
            className="flex items-center justify-center rounded-lg border-2 border-gray-200 p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div>
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">View Attendance</p>
            </div>
          </a>
          <a
            href="/dashboard/reports"
            className="flex items-center justify-center rounded-lg border-2 border-gray-200 p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div>
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">Generate Reports</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
