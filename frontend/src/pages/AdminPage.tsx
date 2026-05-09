import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Users, MessageSquare, Trash2, Shield, ArrowLeft } from 'lucide-react';
import api from '../api';
import type { AdminUser, Comment } from '../types';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'users' | 'comments'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, commentsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/comments'),
      ]);
      setUsers(usersRes.data);
      setComments(commentsRes.data);
    } catch {
      alert('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, pseudo: string) => {
    if (!confirm(`Supprimer l'utilisateur @${pseudo} et tous ses commentaires ?`)) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setComments((prev) => prev.filter((c) => c.author_id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    try {
      await api.delete(`/api/admin/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Changer le rôle en "${newRole}" ?`)) return;
    try {
      const { data } = await api.patch(`/api/admin/users/${id}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: data.role } : u));
    } catch {
      alert('Erreur');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={styles.logo}>🛡️ Administration</h1>
        </div>
        <div style={styles.headerRight}>
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
        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <Users size={24} color="var(--btn-primary)" />
            <div>
              <p style={styles.statNumber}>{users.length}</p>
              <p style={styles.statLabel}>Utilisateurs</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <MessageSquare size={24} color="var(--btn-primary)" />
            <div>
              <p style={styles.statNumber}>{comments.length}</p>
              <p style={styles.statLabel}>Commentaires</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> Utilisateurs
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'comments' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('comments')}
          >
            <MessageSquare size={16} /> Commentaires
          </button>
        </div>

        {loading ? (
          <p style={styles.loading}>Chargement...</p>
        ) : activeTab === 'users' ? (
          <div style={styles.table}>
            {users.map((u) => (
              <div key={u.id} style={styles.row}>
                <div style={styles.rowInfo}>
                  <span style={styles.pseudo}>@{u.pseudo}</span>
                  <span style={{
                    ...styles.badge,
                    background: u.role === 'admin' ? '#4f46e5' : '#6b7280'
                  }}>
                    {u.role}
                  </span>
                  <span style={styles.rowMeta}>
                    {u.comments_count} commentaires •{' '}
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div style={styles.rowActions}>
                  {u.id !== user?.id && (
                    <>
                      <button
                        style={styles.roleBtn}
                        onClick={() => handleToggleRole(u.id, u.role)}
                        title={u.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteUser(u.id, u.pseudo)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.table}>
            {comments.map((c) => (
              <div key={c.id} style={styles.row}>
                <div style={styles.rowInfo}>
                  <span style={styles.pseudo}>@{c.author_pseudo}</span>
                  <span style={styles.rowMeta}>
                    {new Date(c.created_at).toLocaleString('fr-FR')}
                  </span>
                  <p style={styles.commentContent}>{c.content}</p>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteComment(c.id)}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
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
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  logo: { fontSize: 20, margin: 0, color: 'var(--text-primary)' },
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
  main: { maxWidth: 800, margin: '0 auto', padding: '24px 16px' },
  stats: { display: 'flex', gap: 16, marginBottom: 24 },
  statCard: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: 'var(--shadow)',
    flex: 1,
  },
  statNumber: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { color: 'var(--text-secondary)', fontSize: 14 },
  tabs: { display: 'flex', gap: 8, marginBottom: 16 },
  tab: {
    padding: '10px 20px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
  },
  tabActive: {
    background: 'var(--btn-primary)',
    color: 'white',
    border: '1px solid var(--btn-primary)',
  },
  table: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  rowInfo: { display: 'flex', flexDirection: 'column', gap: 4 },
  rowMeta: { color: 'var(--text-secondary)', fontSize: 12 },
  rowActions: { display: 'flex', gap: 8 },
  badge: {
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11,
    color: 'white',
    width: 'fit-content',
  },
  commentContent: {
    color: 'var(--text-primary)',
    fontSize: 14,
    marginTop: 4,
    maxWidth: 500,
  },
  roleBtn: {
    background: 'none',
    border: '1px solid var(--btn-primary)',
    color: 'var(--btn-primary)',
    borderRadius: 6,
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid var(--btn-danger)',
    color: 'var(--btn-danger)',
    borderRadius: 6,
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  loading: { textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40 },
};
