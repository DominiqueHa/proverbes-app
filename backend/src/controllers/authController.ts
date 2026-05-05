import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    res.status(400).json({ message: 'Pseudo et mot de passe requis' });
    return;
  }

  if (pseudo.length < 3 || pseudo.length > 50) {
    res.status(400).json({ message: 'Pseudo entre 3 et 50 caractères' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Mot de passe minimum 6 caractères' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (pseudo, password) VALUES ($1, $2) RETURNING id, pseudo, created_at',
      [pseudo, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, pseudo: user.pseudo },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: user.id, pseudo: user.pseudo } });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(400).json({ message: 'Ce pseudo est déjà pris' });
    } else {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    res.status(400).json({ message: 'Pseudo et mot de passe requis' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE pseudo = $1',
      [pseudo]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Pseudo ou mot de passe incorrect' });
      return;
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      res.status(401).json({ message: 'Pseudo ou mot de passe incorrect' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, pseudo: user.pseudo },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, pseudo: user.pseudo } });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
