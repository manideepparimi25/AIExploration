import { useEffect, useState } from 'react';
import { taskApi, userApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import Modal from '../components/Modal.jsx';
import { statusLabel } from '../utils/format.js';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function Tasks() {
  const { user } = useAuth();
  const isLead = user?.role === 'LEAD';
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [mine, setMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = {};
    if (mine) params.mine = '1';
    if (filter !== 'ALL') params.status = filter;
    taskApi
      .list(params)
      .then((d) => {
        if (active) setTasks(d.tasks);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mine, filter]);

  useEffect(() => {
    if (isLead) userApi.list().then((d) => setUsers(d.users)).catch(() => {});
  }, [isLead]);

  function reload() {
    const params = {};
    if (mine) params.mine = '1';
    if (filter !== 'ALL') params.status = filter;
    return taskApi.list(params).then((d) => setTasks(d.tasks));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        {isLead && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white rounded-md px-3 py-1.5 text-sm font-medium hover:bg-indigo-700"
          >
            New task
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setMine(false);
            setFilter('ALL');
          }}
          className={pill(filter === 'ALL' && !mine)}
        >
          All
        </button>
        <button
          onClick={() => setMine(true)}
          className={pill(mine)}
        >
          Assigned to me
        </button>
        <span className="mx-1 text-gray-300">|</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setMine(false);
              setFilter(s);
            }}
            className={pill(filter === s)}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
          No tasks match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      )}

      {isLead && (
        <CreateTaskModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          users={users}
          onCreated={() => {
            setShowCreate(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function pill(active) {
  return `px-3 py-1 rounded-full text-sm ${
    active
      ? 'bg-indigo-600 text-white'
      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
  }`;
}

function CreateTaskModal({ open, onClose, users, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    status: 'TODO',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function field(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await taskApi.create({
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
      });
      setForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assigneeId: '',
        status: 'TODO',
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={field}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={field}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={field}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={field}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Assignee</label>
          <select
            name="assigneeId"
            value={form.assigneeId}
            onChange={field}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
