import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/format.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-4">
        <Link to="/" className="font-bold text-indigo-600">
          TeamPulse
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={linkClass}>
            Tasks
          </NavLink>
          <NavLink to="/status" className={linkClass}>
            My Status
          </NavLink>
          <NavLink to="/team" className={linkClass}>
            Team
          </NavLink>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <span className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                {initials(user.name)}
              </span>
              {user.name}
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
