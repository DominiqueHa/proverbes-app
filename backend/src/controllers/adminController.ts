import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Récupérer tous les utilisateurs
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.pseudo, u.role, u.created_at,
        COUNT(DISTINCT c.id) as comments_count
      FROM users u
      LEFT JOIN comments c ON u.id = c.author_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (parseInt(id) === req.userId) {
    res.status(400).json({ message: 'Impossible de supprimer votre propre compte' });
    return;
  }

  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, pseudo',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    res.json({ message: `Utilisateur ${result.rows[0].pseudo} supprimé` });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un commentaire (admin)
export const adminDeleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Commentaire introuvable' });
      return;
    }

    res.json({ message: 'Commentaire supprimé' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les commentaires
export const getAllComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.content, c.parent_id, c.created_at,
        u.pseudo as author_pseudo,
        u.id as author_id
      FROM comments c
      JOIN users u ON c.author_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Promouvoir/rétrograder un utilisateur
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    res.status(400).json({ message: 'Rôle invalide' });
    return;
  }

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, pseudo, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
