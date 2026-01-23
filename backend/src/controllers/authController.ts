import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validace
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Všechna povinná pole musí být vyplněna' });
    }

    // Hash hesla
    const passwordHash = await bcrypt.hash(password, 10);

    // Vložit uživatele
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, 'worker')`,
      [email, passwordHash, firstName, lastName, phone]
    );

    res.status(201).json({ message: 'Registrace úspěšná', userId: (result as any).insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Uživatel s tímto e-mailem již existuje' });
    }
    res.status(500).json({ error: 'Chyba při registraci' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail a heslo jsou povinné' });
    }

    // Najít uživatele
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }

    // Ověřit heslo
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }

    // Vytvořit JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret
    ) as string;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při přihlašování' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ?',
      [req.user?.id]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání profilu' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone } = req.body;

    await pool.query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_by = ? 
       WHERE id = ?`,
      [firstName, lastName, phone, req.user?.id, req.user?.id]
    );

    res.json({ message: 'Profil aktualizován' });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při aktualizaci profilu' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Staré i nové heslo jsou povinné' });
    }

    // Získat aktuální heslo
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user?.id]
    );

    const user = (users as any[])[0];

    // Ověřit staré heslo
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Staré heslo je neplatné' });
    }

    // Hash nového hesla
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, updated_by = ? WHERE id = ?',
      [newPasswordHash, req.user?.id, req.user?.id]
    );

    res.json({ message: 'Heslo bylo změněno' });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při změně hesla' });
  }
};
