import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signup, login } from '../api/complaints';

export default function Signup() {
  const { loginContext } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'citizen', area: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(form);
      const data = await login(form.email, form.password);
      loginContext(data.access_token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'citizen', label: 'Citizen' },
    { value: 'municipal', label: 'Municipal' },
    { value: 'contractor', label: 'Contractor' },
  ];

  return (
    <div className="flex items-center justify-center flex-grow bg-gray-100 py-12 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 text-center">Join PaveTrack</h2>
        <p className="text-gray-500 text-center mb-6">Create an account to report and track potholes</p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
            <div className="flex gap-2">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex-1 py-2.5 rounded-full font-bold text-sm border-2 transition ${
                    form.role === r.value
                      ? 'bg-[#3b5998] border-[#3b5998] text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-[#3b5998]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Full Name" name="name" type="text" placeholder="Jane Citizen" value={form.name} onChange={handleChange} required />
          <Field label="Email Address" name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} required />
          <Field label="Password" name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} required />
          <Field label="Phone Number" name="phone" type="tel" placeholder="Optional" value={form.phone} onChange={handleChange} />
          <Field label="Area / City" name="area" type="text" placeholder="e.g. Navi Mumbai" value={form.area} onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
