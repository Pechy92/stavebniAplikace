import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Chyba při přihlašování. Zkontrolujte email a heslo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full glass-card p-8 relative z-10 animate-scale-in">
        <div>
          {/* Logo with Glass Effect */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/cmpe_logo.jpg" 
                alt="CMPE" 
                className="h-24 w-24 object-cover rounded-3xl shadow-glass-lg relative z-10 transition-transform duration-300 group-hover:scale-110" 
              />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="mt-4 text-center text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            CMPE STAVBY
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
            Přihlaste se do svého účtu
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="glass-card border border-red-400/50 dark:border-red-500/50 bg-red-50/80 dark:bg-red-900/20 px-4 py-3 rounded-xl animate-scale-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-glass"
                placeholder="vas.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-glass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Přihlašování...
                </span>
              ) : (
                'Přihlásit se'
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <Link 
              to="/register" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors inline-flex items-center gap-1"
            >
              Nemáte účet? Zaregistrujte se
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
