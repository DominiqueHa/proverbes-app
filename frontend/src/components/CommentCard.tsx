import { useState } from 'react';
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
          {error && <p style={{ color: '#ef4444', fontSize: 12 }}>{error}</p>}
          <button style={styles.replySubmit} type="submit">Envoyer</button>
        </form>
      )}
      {replies.length > 0 && (
        <div style={styles.replies}>
          {replies.map((reply) => (
            <div key={reply.id} style={styles.reply}>
              <span style={styles.pseudo}>@{reply.author_pseudo}</span>
              <span style={styles.date}>
                {new Date(reply.created_at).toLocaleString('fr-FR')}
              </span>
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
  card: { background: 'white', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  pseudo: { fontWeight: 700, color: '#4f46e5' },
  date: { color: '#999', fontSize: 12 },
  content: { fontSize: 16, lineHeight: 1.5, margin: '8px 0' },
  actions: { display: 'flex', gap: 8, marginTop: 8 },
  replyBtn: { background: 'none', border: '1px solid #4f46e5', color: '#4f46e5', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 },
  deleteBtn: { background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 },
  replyForm: { display: 'flex', gap: 8, marginTop: 12, flexDirection: 'column' },
  replyInput: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  replySubmit: { padding: '8px 16px', borderRadius: 8, background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' },
  replies: { marginTop: 12, paddingLeft: 16, borderLeft: '3px solid #e0e0ff' },
  reply: { marginBottom: 12 },
};
