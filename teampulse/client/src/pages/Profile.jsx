import { useState } from 'react';
import { userApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveName(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const d = await userApi.updateMe({ name });
      setUser(d.user);
      setMsg('Profile updated.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await userApi.updateMe({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMsg('Password changed.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Password change failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
        <p className="text-sm text-gray-500">
          {user?.email} · {user?.role === 'LEAD' ? 'Lead' : 'Member'} · joined{' '}
          {formatDate(user?.createdAt)}
        </p>
      </div>

      <form
        onSubmit={saveName}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
      >
        <h2 className="font-semibold text-gray-800">Display name</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          Save name
        </button>
      </form>

      <form
        onSubmit={changePassword}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
      >
        <h2 className="font-semibold text-gray-800">Change password</h2>
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          Change password
        </button>
      </form>

      {msg && <p className="text-sm text-indigo-600">{msg}</p>}
    </div>
  );
}
