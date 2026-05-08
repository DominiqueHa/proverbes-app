import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Moon, Sun } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';
import CommentCard from '../components/CommentCard';
import { useTheme } from '../hooks/useTheme';

const socket = io('', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
});

export default function FeedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newText, setNewText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    api.get('/api/comments').then(({ data }) => {
      setComments(data);
      setLoading(false);
    });
    socket.on('comment_added', (comment: Comment) => {
      setComments((prev) => {
        if (prev.find((c) => c.id === comment.id)) return prev;
        return [comment, ...prev];
      });
    });
    return () => { socket.off('comment_added'); };
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setError('');
    try {
      const { data } = await api.post('/api/comments', { content: newText });
      socket.emit('new_comment', data);
      setNewText('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const handleNewComment = (comment: Comment) => {
    socket.emit('new_comment', comment);
    setComments((prev) => [comment, ...prev]);
  };

  const rootComments = comments.filter((c) => c.parent_id === null);
  const getReplies = (id: number) => comments.filter((c) => c.parent_id === id);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>💬 Proverbes</h1>
        <div style={styles.userInfo}>
          <span style={styles.pseudo}>@{user?.pseudo}</span>
          <button style={styles.themeBtn} onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/auth'); }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <form onSubmit={handlePost} style={styles.postForm}>
          <textarea
            style={styles.textarea}
            placeholder="Partage un proverbe ou une pensée... (max 500 caractères)"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div style={styles.postActions}>
            <span style={styles.charCount}>{newText.length}/500</span>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.postBtn} type="submit">Publier</button>
          </div>
        </form>

        {loading ? (
          <p style={styles.loading}>Chargement...</p>
        ) : rootComments.length === 0 ? (
          <p style={styles.empty}>Aucun proverbe pour l'instant. Sois le premier ! 🌟</p>
        ) : (
          rootComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              onNewComment={handleNewComment}
              onDelete={handleDelete}
            />
          ))
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh' },
  header: {
    background: 'var(--bg-header)',
    backdropFilter: 'blur(10px)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: 'var(--shadow)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: { fontSize: 24, margin: 0, color: 'var(--text-primary)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  pseudo: { fontWeight: 700, color: 'var(--text-pseudo)' },
  themeBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid var(--btn-danger)',
    color: 'var(--btn-danger)',
    background: 'none',
    cursor: 'pointer',
  },
  main: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  postForm: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    boxShadow: 'var(--shadow)',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 15,
    resize: 'none',
    boxSizing: 'border-box',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
  },
  postActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: { color: 'var(--text-secondary)', fontSize: 13 },
  postBtn: {
    padding: '10px 24px',
    borderRadius: 8,
    background: 'var(--btn-primary)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
  },
  error: { color: 'var(--btn-danger)', fontSize: 13 },
  loading: { textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40 },
  empty: { textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40, fontSize: 16 },
};
