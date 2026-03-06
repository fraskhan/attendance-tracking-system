'use client';

import { useEffect, useState } from 'react';
import { getEmployees, createEmployee, deactivateEmployee, resetEmployeePassword } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { formatDate, copyToClipboard } from '@/lib/utils';
import type { Employee, CreateEmployeeResponse } from '@/types';
import { UserPlus, UserX, KeyRound, Copy, Check } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState<CreateEmployeeResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      console.log('Loading employees...');
      const response = await getEmployees(token);
      console.log('Employees response:', response);
      setEmployees(response.employees || []);
      setError('');
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (fullName: string) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await createEmployee(token, fullName);
      setNewEmployee(response);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    
    try {
      const token = getToken();
      if (!token) return;
      
      await deactivateEmployee(token, userId);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate employee');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this employee\'s password?')) return;
    
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await resetEmployeePassword(token, userId);
      alert(`New password: ${response.new_password}\n\nPlease copy this password and share it with the employee.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="mt-2 text-gray-600">Manage your organization's employees</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <UserPlus className="h-5 w-5" />
          Add Employee
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
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.user_id} className={!employee.is_active ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{employee.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      employee.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(employee.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {employee.is_active && (
                      <>
                        <button
                          onClick={() => handleResetPassword(employee.user_id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Reset Password"
                        >
                          <KeyRound className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(employee.user_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate"
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => {
            setShowAddModal(false);
            setNewEmployee(null);
          }}
          onAdd={handleAddEmployee}
          newEmployee={newEmployee}
          onCopy={handleCopy}
          copiedField={copiedField}
        />
      )}
    </div>
  );
}

function AddEmployeeModal({
  onClose,
  onAdd,
  newEmployee,
  onCopy,
  copiedField,
}: {
  onClose: () => void;
  onAdd: (fullName: string) => void;
  newEmployee: CreateEmployeeResponse | null;
  onCopy: (text: string, field: string) => void;
  copiedField: string | null;
}) {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAdd(fullName);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {newEmployee ? 'Employee Created' : 'Add New Employee'}
        </h2>

        {!newEmployee ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter employee's full name"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 mb-3">
                Employee created successfully! Please share these credentials with the employee:
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm">
                      {newEmployee.username}
                    </code>
                    <button
                      onClick={() => onCopy(newEmployee.username, 'username')}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      {copiedField === 'username' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm">
                      {newEmployee.password}
                    </code>
                    <button
                      onClick={() => onCopy(newEmployee.password, 'password')}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      {copiedField === 'password' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                The employee will be required to change their password on first login.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
