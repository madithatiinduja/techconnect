import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../constants/services.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';

export default function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState(['client']);
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    service: '',
    experience: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleRole = (role) => {
    setRoles([role]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const user = await register({
        ...form,
        role: roles
      });

      navigate(
        user.roles?.includes('admin')
          ? '/dashboard/admin'
          : user.roles?.includes('technician')
            ? '/dashboard/technician'
            : '/dashboard/client',
        { replace: true }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen min-h-[100dvh]">
      <Header />
      <main className="mx-auto w-full max-w-2xl px-3 py-8 sm:px-6 sm:py-12">
        <div className="section-card">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join TechConnect as a client or service professional!
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {['client', 'technician', 'admin'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => toggleRole(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                  roles.includes(option)
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            {roles.includes('admin') && (
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Admin username
                </span>
                <input
                  required
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="e.g., operationsadmin"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            )}

            {!roles.includes('admin') && (
              <>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Full name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Confirm password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>

            {!roles.includes('admin') && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Phone
                  </span>
                  <input
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    City
                  </span>
                  <input
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Address
                  </span>
                  <input
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </>
            )}

            {roles.includes('technician') && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Primary service
                  </span>
                  <select
                    required
                    value={form.service}
                    onChange={(e) => updateField('service', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="">Select service</option>
                    {SERVICE_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Experience
                  </span>
                  <input
                    value={form.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    placeholder="e.g., 3 years"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:col-span-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
