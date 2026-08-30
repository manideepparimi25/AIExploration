import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskApi, statusApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([taskApi.list({ mine: '1' }), statusApi.team()])
      .then(([t, s]) => {
        if (!active) return;
        setTasks(t.tasks);
        setBoard(s.board);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const myOpen = tasks.filter((t) => t.status !== 'DONE');
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {firstName}</h1>
        <p className="text-sm text-gray-500">Here's what's happening on your team.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="My open tasks" value={loading ? '—' : myOpen.length} to="/tasks" />
        <SummaryCard label="My done tasks" value={loading ? '—' : doneCount} to="/tasks" />
        <SummaryCard label="Team members" value={loading ? '—' : board.length} to="/team" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-800">My open tasks</h2>
            <Link to="/tasks" className="text-sm text-indigo-600">
              View all
            </Link>
          </div>
          {loading ? (
            <Skeleton />
          ) : myOpen.length === 0 ? (
            <Empty label="No open tasks" />
          ) : (
            <div className="space-y-2">
              {myOpen.slice(0, 5).map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-800">Team status</h2>
            <Link to="/team" className="text-sm text-indigo-600">
              View board
            </Link>
          </div>
          {loading ? (
            <Skeleton />
          ) : (
            <div className="space-y-2">
              {board.slice(0, 5).map((e) => (
                <div
                  key={e.user.id}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {e.user.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {e.user.role === 'LEAD' ? 'Lead' : 'Member'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {e.status ? e.status.workingOn : 'No status posted'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, to }) {
  return (
    <Link
      to={to}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition block"
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
    </Link>
  );
}

function Skeleton() {
  return <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />;
}

function Empty({ label }) {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-400 text-center">
      {label}
    </div>
  );
}
