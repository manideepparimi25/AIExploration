import { useEffect, useState } from 'react';
import { statusApi } from '../api/client.js';

export default function MyStatus() {
  const [form, setForm] = useState({ workingOn: '', blockers: '' });
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let active = true;
    statusApi
      .mine()
      .then((d) => {
        if (!active) return;
        setExisting(d.status);
        if (d.status) setForm({ workingOn: d.status.workingOn, blockers: d.status.blockers });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function field(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const d = await statusApi.save(form);
      setExisting(d.status);
      setMsg('Status saved.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />;

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Status</h1>
        <p className="text-sm text-gray-500">
          {existing ? "Update today's status" : "Post today's status"}
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            What are you working on?
          </label>
          <textarea
            name="workingOn"
            rows={3}
            required
            value={form.workingOn}
            onChange={field}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Blockers (optional)
          </label>
          <textarea
            name="blockers"
            rows={2}
            value={form.blockers}
            onChange={field}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {msg && <p className="text-sm text-indigo-600">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save status'}
        </button>
      </form>
    </div>
  );
}
