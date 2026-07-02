import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/menu');
    } catch (err) {
      setError('Registration failed — email may already be in use');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">Create account</h1>
        <p className="text-stone-500 mb-6">Join us to start ordering</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name" placeholder="Full name" value={form.name} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            Register
          </button>
        </form>

        <p className="text-stone-500 text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-600 font-medium">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}