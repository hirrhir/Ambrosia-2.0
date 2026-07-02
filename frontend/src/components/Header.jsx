import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-orange-100">
      <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-stone-500 text-sm">{user?.name}</span>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-orange-600 text-sm font-medium"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}