'use client';

import { useEffect, useState } from 'react';
import { getDailyAttendance } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { getTodayDate, formatTime } from '@/lib/utils';
import type { DailyAttendanceRecord } from '@/types';
import { Calendar, Image as ImageIcon } from 'lucide-react';

export default function AttendancePage() {
  const [date, setDate] = useState(getTodayDate());
  const [attendance, setAttendance] = useState<DailyAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const loadAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await getDailyAttendance(token, date);
      setAttendance(response.attendance || []);
    } catch (err) {
      console.error('Error loading attendance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      incomplete: 'bg-yellow-100 text-yellow-800',
      missing: 'bg-red-100 text-red-800',
      not_logged_in: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.not_logged_in;
  };

  const getStatusText = (status: string) => {
    const text = {
      completed: 'Completed',
      incomplete: 'Incomplete',
      missing: 'Missing Time Out',
      not_logged_in: 'Not Logged In',
    };
    return text[status as keyof typeof text] || 'Unknown';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Attendance</h1>
        <p className="mt-2 text-gray-600">View employee attendance for a specific date</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setDate(getTodayDate())}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Today
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance && attendance.length > 0 ? attendance.map((record) => (
              <tr key={record.user_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.full_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.time_in ? formatTime(record.time_in) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.time_out ? formatTime(record.time_out) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.total_hours !== null ? `${record.total_hours.toFixed(2)}h` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadge(
                      record.status
                    )}`}
                  >
                    {getStatusText(record.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {record.time_in_photo_url && (
                      <button
                        onClick={() => setSelectedPhoto(record.time_in_photo_url)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Time In Photo"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                    )}
                    {record.time_out_photo_url && (
                      <button
                        onClick={() => setSelectedPhoto(record.time_out_photo_url)}
                        className="text-green-600 hover:text-green-900"
                        title="View Time Out Photo"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {loading ? 'Loading...' : 'No attendance records for this date'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
}

function PhotoModal({ photo, onClose }: { photo: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="max-w-4xl max-h-[90vh] p-4">
        <img
          src={photo}
          alt="Attendance Photo"
          className="max-w-full max-h-full rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
