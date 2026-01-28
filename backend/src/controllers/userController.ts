import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY first_name, last_name';

    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání uživatelů' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, is_active FROM users WHERE id = ?',
      [id]
    );
    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání uživatele' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;

    // Validace role
    if (!['admin', 'manager', 'foreman'].includes(role)) {
      return res.status(400).json({ error: 'Neplatná role' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, first_name, last_name, phone, role, req.user?.id]
    );

    res.status(201).json({ message: 'Uživatel vytvořen', userId: (result as any).insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Uživatel s tímto e-mailem již existuje' });
    }
    res.status(500).json({ error: 'Chyba při vytváření uživatele' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, phone, role, is_active, active } = req.body;
    
    // Accept both 'active' and 'is_active' parameter names
    const activeStatus = is_active !== undefined ? is_active : active;

    await pool.query(
      `UPDATE users 
       SET email = ?, first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ?, updated_by = ?
       WHERE id = ?`,
      [email, first_name, last_name, phone, role, activeStatus, req.user?.id, id]
    );

    res.json({ message: 'Uživatel aktualizován' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Uživatel s tímto e-mailem již existuje' });
    }
    res.status(500).json({ error: 'Chyba při aktualizaci uživatele' });
  }
};

export const toggleUserActive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { active, is_active } = req.body;
    
    // Accept both 'active' and 'is_active' parameter names
    const activeStatus = is_active !== undefined ? is_active : active;

    await pool.query(
      'UPDATE users SET is_active = ?, updated_by = ? WHERE id = ?',
      [activeStatus, req.user?.id, id]
    );

    res.json({ message: 'Stav uživatele změněn' });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Chyba při změně stavu uživatele' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Nelze smazat sám sebe
    if (parseInt(id) === req.user?.id) {
      return res.status(400).json({ error: 'Nelze smazat vlastní účet' });
    }

    // Soft delete
    await pool.query('UPDATE users SET is_active = FALSE, updated_by = ? WHERE id = ?', [req.user?.id, id]);
    res.json({ message: 'Uživatel smazán' });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při mazání uživatele' });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { new_password, newPassword } = req.body;
    
    // Accept both parameter names
    const password = new_password || newPassword;

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, updated_by = ? WHERE id = ?',
      [passwordHash, req.user?.id, id]
    );

    res.json({ message: 'Heslo resetováno' });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při resetování hesla' });
  }
};
