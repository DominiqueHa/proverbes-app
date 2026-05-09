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

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM likes WHERE user_id = $1 AND comment_id = $2',
        [req.userId, id]
      );
      res.json({ liked: false });
    } else {
      await pool.query(
        'INSERT INTO likes (user_id, comment_id) VALUES ($1, $2)',
        [req.userId, id]
      );
      res.json({ liked: true });
    }
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const count = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      [id]
    );
    const userLiked = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND comment_id = $2',
      [req.userId, id]
    );
    res.json({
      count: parseInt(count.rows[0].count),
      liked: userLiked.rows.length > 0
    });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
