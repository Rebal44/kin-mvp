'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [view, setView] = useState<'landing' | 'signup' | 'login' | 'dashboard'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('kin_token');
    if (savedToken) {
      setToken(savedToken);
      setView('dashboard');
      loadDashboard(savedToken);
    }
  }, []);

  async function loadDashboard(authToken: string) {
    try {
      const res = await fetch(`${API_URL}/api/user/dashboard`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      localStorage.setItem('kin_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setView('dashboard');
      loadDashboard(data.token);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('kin_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setView('dashboard');
      loadDashboard(data.token);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('kin_token');
    setToken(null);
    setUser(null);
    setDashboard(null);
    setView('landing');
  }

  async function connectTelegram() {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/user/telegram-link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        window.open(data.linkUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to generate Telegram link:', err);
    }
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold mb-4">
            ⚡ <span className="text-primary">KIN</span>
          </h1>
          <p className="text-2xl text-gray-400 mb-8">
            Your personal AI agent that gets things done.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setView('signup')}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </button>
            <button
              onClick={() => setView('login')}
              className="bg-secondary hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-400">Start with 50 free credits</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">{error}</div>
            )}
            
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400">
            Already have an account?{' '}
            <button onClick={() => setView('login')} className="text-primary hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your KIN account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">{error}</div>
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400">
            Don't have an account?{' '}
            <button onClick={() => setView('signup')} className="text-primary hover:underline">
              Create one
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (view === 'dashboard' && dashboard) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">⚡ KIN</h1>
              <p className="text-gray-400">Your personal AI assistant</p>
            </div>
            <button
              onClick={logout}
              className="bg-secondary hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface border border-gray-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Credits</p>
              <p className="text-4xl font-bold text-primary">{dashboard.user?.credits || 0}</p>
            </div>
            
            <div className="bg-surface border border-gray-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Plan</p>
              <p className="text-2xl font-bold capitalize">{dashboard.user?.plan?.toLowerCase()}</p>
            </div>
            
            <div className="bg-surface border border-gray-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Tasks</p>
              <p className="text-4xl font-bold">{dashboard.taskCount || 0}</p>
            </div>
          </div>

          <div className="bg-surface border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Telegram Connection</h2>
            
            {dashboard.user?.telegramConnected ? (
              <div className="flex items-center gap-3 text-green-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Connected to Telegram</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-4">Connect your Telegram to send tasks via chat.</p>
                <button
                  onClick={connectTelegram}
                  className="bg-[#0088cc] hover:bg-[#0077b3] text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Connect Telegram
                </button>
              </div>
            )}
          </div>

          <div className="bg-surface border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
            
            {dashboard.recentTasks?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentTasks.map((task: any) => (
                  <div key={task.id} className="border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-300">{task.request}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'COMPLETED' ? 'bg-green-900/50 text-green-400' :
                        task.status === 'RUNNING' ? 'bg-blue-900/50 text-blue-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {task.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tasks yet. Connect Telegram to start!</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
