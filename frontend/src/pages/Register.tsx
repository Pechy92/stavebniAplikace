import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při registraci');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-slide-up">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
              <span className="text-3xl">👤</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Registrace
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Vytvořte si nový účet
          </p>
        </div>
        <form className="glass-card p-8 animate-slide-up space-y-6" style={{ animationDelay: '100ms' }} onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm animate-scale-in">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Jméno <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="input-glass"
                placeholder="Zadejte vaše jméno"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Příjmení <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="input-glass"
                placeholder="Zadejte vaše příjmení"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-glass"
                placeholder="vas@email.cz"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Telefon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-glass"
                placeholder="+420 123 456 789"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Heslo <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-glass"
                placeholder="Silné heslo"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Potvrzení hesla <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-glass"
                placeholder="Zadejte heslo znovu"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registrace...
              </>
            ) : (
              <>
                ✨ Zaregistrovat se
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Link 
              to="/login" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium inline-flex items-center gap-2 transition-colors"
            >
              <span>←</span>
              Již máte účet? Přihlaste se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
