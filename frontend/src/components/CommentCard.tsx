import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Props {
  comment: Comment;
  replies: Comment[];
  onNewComment: (comment: Comment) => void;
  onDelete: (id: number) => void;
}

export default function CommentCard({ comment, replies, onNewComment, onDelete }: Props) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(comment.user_liked || false);
  const [likesCount, setLikesCount] = useState(Number(comment.likes_count) || 0);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const { data } = await api.post('/api/comments', {
        content: replyText,
        parent_id: comment.id,
      });
      onNewComment(data);
      setReplyText('');
      setShowReply(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/api/comments/${comment.id}/like`);
      setLiked(data.liked);
      setLikesCount((prev) => data.liked ? prev + 1 : prev - 1);
    } catch {
      alert('Erreur lors du like');
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.pseudo}>@{comment.author_pseudo}</span>
        <span style={styles.date}>
          {new Date(comment.created_at).toLocaleString('fr-FR')}
        </span>
      </div>

      <p style={styles.content}>{comment.content}</p>

      <div style={styles.actions}>
        <button style={styles.replyBtn} onClick={() => setShowReply(!showReply)}>
          💬 Répondre
        </button>
        <button
          style={{
            ...styles.likeBtn,
            color: liked ? '#ef4444' : 'var(--text-secondary)',
            borderColor: liked ? '#ef4444' : 'var(--border)',
          }}
          onClick={handleLike}
        >
          <Heart size={14} fill={liked ? '#ef4444' : 'none'} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>
        {user?.id === comment.author_id && (
          <button style={styles.deleteBtn} onClick={() => onDelete(comment.id)}>
            🗑️ Supprimer
          </button>
        )}
      </div>

      {showReply && (
        <form onSubmit={handleReply} style={styles.replyForm}>
          <input
            style={styles.replyInput}
            placeholder="Ta réponse..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            maxLength={500}
          />
          {error && <p style={{ color: 'var(--btn-danger)', fontSize: 12 }}>{error}</p>}
          <button style={styles.replySubmit} type="submit">Envoyer</button>
        </form>
      )}

      {replies.length > 0 && (
        <div style={styles.replies}>
          {replies.map((reply) => (
            <div key={reply.id} style={styles.reply}>
              <div style={styles.header}>
                <span style={styles.pseudo}>@{reply.author_pseudo}</span>
                <span style={styles.date}>
                  {new Date(reply.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
              <p style={styles.content}>{reply.content}</p>
              {user?.id === reply.author_id && (
                <button style={styles.deleteBtn} onClick={() => onDelete(reply.id)}>
                  🗑️ Supprimer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    boxShadow: 'var(--shadow)',
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  pseudo: { fontWeight: 700, color: 'var(--text-pseudo)' },
  date: { color: 'var(--text-secondary)', fontSize: 12 },
  content: { fontSize: 16, lineHeight: 1.5, margin: '8px 0', color: 'var(--text-primary)' },
  actions: { display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' },
  replyBtn: {
    background: 'none',
    border: '1px solid var(--btn-primary)',
    color: 'var(--btn-primary)',
    borderRadius: 6,
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 13,
  },
  likeBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid var(--btn-danger)',
    color: 'var(--btn-danger)',
    borderRadius: 6,
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 13,
  },
  replyForm: { display: 'flex', gap: 8, marginTop: 12, flexDirection: 'column' },
  replyInput: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 14,
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
  },
  replySubmit: {
    padding: '8px 16px',
    borderRadius: 8,
    background: 'var(--btn-primary)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  replies: { marginTop: 12, paddingLeft: 16, borderLeft: '3px solid var(--btn-primary)' },
  reply: { marginBottom: 12 },
};
