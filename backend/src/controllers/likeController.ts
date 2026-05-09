import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const existing = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND comment_id = $2',
      [req.userId, id]
    );

    let liked: boolean;
    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM likes WHERE user_id = $1 AND comment_id = $2',
        [req.userId, id]
      );
      liked = false;
    } else {
      await pool.query(
        'INSERT INTO likes (user_id, comment_id) VALUES ($1, $2)',
        [req.userId, id]
      );
      liked = true;
    }

    const count = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      [id]
    );

    const likesCount = parseInt(count.rows[0].count);

    // Émet l'événement via Socket.io
    req.app.get('io').emit('like_changed', {
      commentId: parseInt(id),
      likesCount,
      userId: req.userId,
      liked,
    });

    res.json({ liked, likesCount });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
