import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  statusLabel,
  statusClass,
  priorityLabel,
  priorityClass,
  formatDate,
} from '../utils/format.js';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    taskApi
      .get(id)
      .then((d) => {
        if (active) setTask(d.task);
      })
      .catch(() => {
        if (active) setTask(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />;
  if (!task) return <p className="text-gray-500">Task not found.</p>;

  const isLead = user?.role === 'LEAD';
  const canEdit = isLead || task.assigneeId === user?.id;

  async function changeStatus(status) {
    try {
      const d = await taskApi.update(id, { status });
      setTask(d.task);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const d = await taskApi.addComment(id, { content: comment.trim() });
      setTask((t) => ({ ...t, comments: [...(t.comments || []), d.comment] }));
      setComment('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Comment failed');
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-indigo-600"
      >
        ← Back
      </button>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-800">{task.title}</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusClass(task.status)}`}
          >
            {statusLabel(task.status)}
          </span>
        </div>
        <p className="mt-2 text-gray-600 whitespace-pre-wrap">
          {task.description || 'No description.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className={`px-2 py-0.5 rounded-full ${priorityClass(task.priority)}`}>
            {priorityLabel(task.priority)}
          </span>
          <span>Assignee: {task.assignee ? task.assignee.name : 'Unassigned'}</span>
          <span>Created by: {task.createdBy?.name}</span>
          <span>Created: {formatDate(task.createdAt)}</span>
        </div>
      </div>

      {canEdit && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-2">Status</h2>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className={`px-3 py-1 rounded-full text-sm ${
                  task.status === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Comments</h2>
        <div className="space-y-3">
          {(task.comments || []).length === 0 ? (
            <p className="text-sm text-gray-400">No comments yet.</p>
          ) : (
            task.comments.map((c) => (
              <div key={c.id} className="border-l-2 border-gray-100 pl-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.content}</p>
                <p className="text-xs text-gray-400">
                  {c.user?.name} · {formatDate(c.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={addComment} className="mt-3 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-md px-3 py-2 text-sm hover:bg-indigo-700"
          >
            Comment
          </button>
        </form>
      </div>
    </div>
  );
}
