import { initials, formatDate } from '../utils/format.js';

export default function StatusCard({ entry }) {
  const { user, status } = entry;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
          {initials(user.name)}
        </span>
        <div>
          <p className="font-medium text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">
            {user.role === 'LEAD' ? 'Lead' : 'Member'}
          </p>
        </div>
      </div>
      {status ? (
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <p className="text-xs uppercase text-gray-400">Working on</p>
            <p className="text-gray-700 whitespace-pre-wrap">{status.workingOn}</p>
          </div>
          {status.blockers && (
            <div>
              <p className="text-xs uppercase text-gray-400">Blockers</p>
              <p className="text-red-600 whitespace-pre-wrap">{status.blockers}</p>
            </div>
          )}
          <p className="text-xs text-gray-400">{formatDate(status.date)}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-400">No status posted.</p>
      )}
    </div>
  );
}
