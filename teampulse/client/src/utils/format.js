export function statusLabel(status) {
  const map = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
  return map[status] ?? status;
}

export function priorityLabel(priority) {
  const map = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
  return map[priority] ?? priority;
}

export function statusClass(status) {
  const map = {
    TODO: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE: 'bg-green-100 text-green-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export function priorityClass(priority) {
  const map = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-red-100 text-red-700',
  };
  return map[priority] ?? 'bg-gray-100 text-gray-700';
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function initials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
