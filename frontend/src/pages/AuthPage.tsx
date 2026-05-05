import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

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
      <div style={styles.card}>
        <h1 style={styles.title}>💬 Proverbes v2.0</h1>
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
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#f0f2f5',
  },
  card: {
    background: 'white', borderRadius: 12,
    padding: 40, width: 360,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: { textAlign: 'center', fontSize: 32, marginBottom: 4 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24, fontSize: 18 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '12px 16px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 16, outline: 'none',
  },
  button: {
    padding: '12px 16px', borderRadius: 8,
    background: '#4f46e5', color: 'white',
    border: 'none', fontSize: 16, cursor: 'pointer',
    marginTop: 8,
  },
  error: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  toggle: { textAlign: 'center', marginTop: 16, color: '#666' },
  link: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: 14 },
};
