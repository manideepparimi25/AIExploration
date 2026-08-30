import { Link } from 'react-router-dom';
import {
  statusLabel,
  statusClass,
  priorityLabel,
  priorityClass,
  formatDate,
} from '../utils/format.js';

export default function TaskCard({ task }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusClass(task.status)}`}
        >
          {statusLabel(task.status)}
        </span>
      </div>
      {task.description && (
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className={`px-2 py-0.5 rounded-full ${priorityClass(task.priority)}`}>
          {priorityLabel(task.priority)}
        </span>
        <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
        <span>·</span>
        <span>{formatDate(task.createdAt)}</span>
      </div>
    </Link>
  );
}
