import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.content, c.parent_id, c.created_at,
        u.pseudo as author_pseudo,
        u.id as author_id
      FROM comments c
      JOIN users u ON c.author_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, parent_id } = req.body;

  if (!content || content.trim().length === 0) {
    res.status(400).json({ message: 'Le contenu ne peut pas être vide' });
    return;
  }

  if (content.length > 500) {
    res.status(400).json({ message: 'Maximum 500 caractères' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO comments (content, author_id, parent_id)
       VALUES ($1, $2, $3)
       RETURNING id, content, parent_id, created_at`,
      [content.trim(), req.userId, parent_id || null]
    );

    const comment = {
      ...result.rows[0],
      author_pseudo: req.pseudo,
      author_id: req.userId,
    };

    res.status(201).json(comment);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND author_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ message: 'Non autorisé ou commentaire introuvable' });
      return;
    }

    res.json({ message: 'Commentaire supprimé' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
