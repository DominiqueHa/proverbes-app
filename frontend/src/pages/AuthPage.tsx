import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await api.post(endpoint, { pseudo, password });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur réseau');
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.themeToggle} onClick={toggleTheme}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <div style={styles.card}>
        <h1 style={styles.title}>💬 Proverbes</h1>
        <h2 style={styles.subtitle}>
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit">
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
        <p style={styles.toggle}>
          {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
          <button style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " S'inscrire" : ' Se connecter'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    position: 'fixed',
    top: 16,
    right: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '8px 10px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  card: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: 40,
    width: 360,
    boxShadow: 'var(--shadow-card)',
  },
  title: { textAlign: 'center', fontSize: 32, marginBottom: 4, color: 'var(--text-primary)' },
  subtitle: { textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24, fontSize: 18 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 16,
    outline: 'none',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
  },
  button: {
    padding: '12px 16px',
    borderRadius: 8,
    background: 'var(--btn-primary)',
    color: 'white',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 8,
  },
  error: { color: 'var(--btn-danger)', fontSize: 14, textAlign: 'center' },
  toggle: { textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)' },
  link: {
    background: 'none',
    border: 'none',
    color: 'var(--btn-primary)',
    cursor: 'pointer',
    fontSize: 14,
  },
};
