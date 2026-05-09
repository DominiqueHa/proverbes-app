import { Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from './auth';

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      res.status(403).json({ message: 'Accès refusé — Admin requis' });
      return;
    }

    next();
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
