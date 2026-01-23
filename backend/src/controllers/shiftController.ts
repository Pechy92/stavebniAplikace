import { Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middleware/auth';

export const getAllShifts = async (req: AuthRequest, res: Response) => {
  try {
    const [shifts] = await pool.query<RowDataPacket[]>(
      `SELECT 
        s.*,
        p.name as project_name,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM shifts s
      JOIN projects p ON s.project_id = p.id
      JOIN users u ON s.user_id = u.id
      ORDER BY s.date DESC, s.start_time DESC`
    );

    res.json(shifts);
  } catch (error: any) {
    console.error('Chyba při načítání směn:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const createShift = async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, user_id, date, start_time, end_time } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO shifts (project_id, user_id, date, start_time, end_time, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [project_id, user_id, date, start_time, end_time, req.user!.id]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Směna byla úspěšně vytvořena' 
    });
  } catch (error: any) {
    console.error('Chyba při vytváření směny:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const updateShift = async (req: AuthRequest, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id);
    const { project_id, user_id, date, start_time, end_time } = req.body;

    await pool.query(
      `UPDATE shifts 
       SET project_id = ?, user_id = ?, date = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [project_id, user_id, date, start_time, end_time, shiftId]
    );

    res.json({ message: 'Směna byla úspěšně aktualizována' });
  } catch (error: any) {
    console.error('Chyba při aktualizaci směny:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const deleteShift = async (req: AuthRequest, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id);

    await pool.query('DELETE FROM shifts WHERE id = ?', [shiftId]);

    res.json({ message: 'Směna byla úspěšně smazána' });
  } catch (error: any) {
    console.error('Chyba při mazání směny:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};
