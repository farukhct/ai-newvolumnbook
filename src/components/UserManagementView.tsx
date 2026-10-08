import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { toDisplayDate, formatTimestamp } from '../utils/dateUtils';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  currentAdminUsername: string;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const UserManagementView: React.FC<Props> = ({ currentAdminUsername, onNotify }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);

  // New User Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Administrator' | 'User'>('User');

  // Reset Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const refreshUsers = () => {
    setUsers(StorageService.getUsers());
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || !password) {
      onNotify('error', 'Please fill in required fields.', 'Validation Error');
      return;
    }
    try {
      await StorageService.createUser(currentAdminUsername, {
        username,
        fullName,
        email,
        password,
        role,
      });
      refreshUsers();
      setShowAddModal(false);
      setUsername('');
      setFullName('');
      setEmail('');
      setPassword('');
      onNotify('success', `User "${username}" created successfully.`, 'User Registered');
    } catch (err: any) {
      onNotify('error', err.message, 'Create User Failed');
    }
  };

  const handleToggleStatus = (u: User) => {
    if (u.username.toLowerCase() === currentAdminUsername.toLowerCase()) {
      onNotify('warning', 'You cannot deactivate your own active session account.', 'Action Prevented');
      return;
    }
    try {
      const updatedUser = StorageService.toggleUserStatus(currentAdminUsername, u.id);
      refreshUsers();
      onNotify('info', `User "${u.username}" status updated to ${updatedUser.isActive ? 'Active' : 'Disabled'}.`, 'Status Updated');
    } catch (err: any) {
      onNotify('error', err.message, 'Status Update Failed');
    }
  };

  const handleDeleteUser = (u: User) => {
    if (u.username.toLowerCase() === currentAdminUsername.toLowerCase()) {
      onNotify('warning', 'You cannot delete your current administrator session.', 'Action Prevented');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${u.username}"?`)) {
      try {
        StorageService.deleteUser(currentAdminUsername, u.id);
        refreshUsers();
        onNotify('success', `User "${u.username}" has been removed.`, 'User Deleted');
      } catch (err: any) {
        onNotify('error', err.message, 'Delete Failed');
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (newPassword !== confirmNewPassword) {
      onNotify('error', 'Passwords do not match.', 'Password Mismatch');
      return;
    }
    if (newPassword.length < 6) {
      onNotify('error', 'Password must be at least 6 characters.', 'Password Short');
      return;
    }

    try {
      await StorageService.resetPassword(currentAdminUsername, resetTargetUser.id, newPassword);
      setResetTargetUser(null);
      setNewPassword('');
      setConfirmNewPassword('');
      onNotify('success', `Password for "${resetTargetUser.username}" has been successfully updated.`, 'Password Reset');
    } catch (err: any) {
      onNotify('error', err.message, 'Password Reset Failed');
    }
  };

  return (
    <div className="space-y-5 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#006a4e]" />
            <span>User Management & Access Control</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage local operator accounts, roles, activation statuses, and offline password resets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-semibold rounded shadow transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#006a4e] text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-emerald-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{u.username}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-500">{u.email || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'Administrator'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {u.role === 'Administrator' && <Shield className="w-2.5 h-2.5 text-amber-600" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        u.isActive ? 'text-[#006a4e]' : 'text-slate-400'
                      }`}
                    >
                      {u.isActive ? <CheckCircle className="w-3.5 h-3.5 text-[#006a4e]" /> : <XCircle className="w-3.5 h-3.5" />}
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{toDisplayDate(u.createdAt.substring(0, 10))}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{formatTimestamp(u.lastLoginAt || '') || 'Never'}</td>
                  <td className="py-3 px-4 text-right pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setResetTargetUser(u)}
                        className="p-1 rounded text-amber-600 hover:text-amber-800 hover:bg-amber-100 cursor-pointer"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-300 cursor-pointer"
                        title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100 cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#006a4e]" />
                <span>Register Local User Account</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Officer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                  >
                    <option value="User">Normal User</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  placeholder="staff@gov.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#006a4e] hover:bg-[#00523c] text-white font-semibold cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-lg max-w-sm w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setResetTargetUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Setting new offline password for user: <strong className="text-slate-900">{resetTargetUser.username}</strong>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-type password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
