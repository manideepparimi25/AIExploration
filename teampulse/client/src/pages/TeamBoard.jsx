import { useEffect, useState } from 'react';
import { statusApi } from '../api/client.js';
import StatusCard from '../components/StatusCard.jsx';

export default function TeamBoard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    statusApi
      .team()
      .then((d) => {
        if (active) setBoard(d.board);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Team Status Board</h1>
        <p className="text-sm text-gray-500">
          Everyone's latest status, all in one place.
        </p>
      </div>
      {loading ? (
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {board.map((entry) => (
            <StatusCard key={entry.user.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
