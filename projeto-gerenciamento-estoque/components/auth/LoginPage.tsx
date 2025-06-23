
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATARINENSE_PHARMA_HEADER_LOGO_URL, ABPLAST_HEADER_LOGO_URL } from '../../constants';

interface LoginPageProps {
  onLogin: (username: string, password_param: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const inputBaseClasses = "mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150";


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Usuário e senha são obrigatórios.');
      return;
    }
    const success = onLogin(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-sky-400 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center items-center space-x-6 mb-10"> {/* Increased mb from 8 to 10 */}
          {/* Catarinense Pharma Logo */}
          <div className="bg-blue-600 px-4 py-5 rounded-lg flex items-center justify-center shadow-md"> {/* Changed py-2 to py-5 */}
            <img
              src={CATARINENSE_PHARMA_HEADER_LOGO_URL}
              alt="Catarinense Pharma"
              className="h-12 object-contain" 
            />
          </div>
          {/* ABPlast Logo */}
          <div className="bg-blue-600 px-2 py-1 rounded-lg flex items-center justify-center shadow-md">
            <img
              src={ABPLAST_HEADER_LOGO_URL}
              alt="ABPlast"
              className="h-20 object-contain" 
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Login</h2>
        <p className="text-center text-gray-600 mb-8">Acesse o Sistema de Insumos de TI</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputBaseClasses}
              placeholder="Seu usuário"
            />
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputBaseClasses}
              placeholder="Sua senha"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
      <p className="mt-8 text-center text-sm text-white opacity-75">
        &copy; {new Date().getFullYear()} Sistema de Gerenciamento de Insumos de TI
      </p>
    </div>
  );
};

export default LoginPage;
