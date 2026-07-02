import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'customer') navigate('/menu');
        else if (user.role === 'kitchen') navigate('/kitchen');
        else if (user.role === 'waiter') navigate('/waiter');
        else navigate('/menu'); 
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">Welcome back</h1>
        <p className="text-stone-500 mb-6">Log in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            Log In
          </button>
        </form>

        <p className="text-stone-500 text-sm mt-4 text-center">
          No account?{' '}
          <Link to="/register" className="text-orange-600 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}