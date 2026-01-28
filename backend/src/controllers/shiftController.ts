import { Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, getShiftAssignmentTemplate } from '../services/emailService';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'shifts');

export const getAllShifts = async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        s.*, 
        DATE(s.start_datetime) as date,
        TIME_FORMAT(s.start_datetime, '%H:%i') as start_time,
        TIME_FORMAT(s.end_datetime, '%H:%i') as end_time,
        p.name as project_name,
        GROUP_CONCAT(DISTINCT CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as worker_names,
        JSON_ARRAYAGG(
          CASE WHEN u.id IS NULL THEN NULL ELSE JSON_OBJECT(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'role', u.role
          ) END
        ) as workers
      FROM shifts s
      JOIN projects p ON s.project_id = p.id
      LEFT JOIN shift_workers sw ON sw.shift_id = s.id
      LEFT JOIN users u ON sw.worker_id = u.id
      GROUP BY s.id
      ORDER BY s.start_datetime DESC`
    );

    const shifts = (rows as any[]).map((row) => {
      // workers can come as JSON string or already-parsed array depending on MySQL driver
      const rawWorkers = row.workers;
      const parsedWorkers = typeof rawWorkers === 'string'
        ? JSON.parse(rawWorkers)
        : Array.isArray(rawWorkers)
          ? rawWorkers
          : [];
      const workers = Array.isArray(parsedWorkers)
        ? parsedWorkers.filter((w) => w !== null)
        : [];
      return {
        ...row,
        workers,
        worker_names: row.worker_names || ''
      };
    });

    res.json(shifts);
  } catch (error: any) {
    console.error('Chyba při načítání směn:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const createShift = async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, user_ids, date, start_time, end_time, name, description, status } = req.body;

    console.log('📝 Creating shift:', { project_id, user_ids, date, start_time, end_time });

    if (!project_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: 'Vyberte alespoň jednoho pracovníka' });
    }

    const startDateTime = `${date} ${start_time}:00`;
    const endDateTime = `${date} ${end_time}:00`;
    const shiftName = name || `Směna ${date}`;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO shifts (name, project_id, start_datetime, end_datetime, description, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shiftName, project_id, startDateTime, endDateTime, description || null, status || 'planned', req.user!.id]
    );

    const shiftId = result.insertId;

    for (const uid of user_ids) {
      await pool.query(
        `INSERT INTO shift_workers (shift_id, worker_id) VALUES (?, ?)`,
        [shiftId, uid]
      );
    }


    // Odeslat notifikace pracovníkům a autorovi
    try {
      // Získat detaily projektu a pracovníků
      const [projectData] = await pool.query<RowDataPacket[]>(
        'SELECT name FROM projects WHERE id = ?',
        [project_id]
      );
      const projectName = (projectData[0] as any)?.name || 'Neznámý projekt';

      // Získat seznam pracovníků včetně autora
      const [workers] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT u.id, u.email, u.first_name, u.last_name 
         FROM users u 
         WHERE u.id IN (?) OR u.id = ?`,
        [user_ids, req.user!.id]
      );

      const actionUrl = `${process.env.FRONTEND_URL}/shifts/${shiftId}`;
      const formattedDate = `${date} ${start_time}`;

      // Odeslat email každému pracovníkovi a autorovi
      for (const worker of workers as any[]) {
        if (worker.email) {
          console.log(`📧 Odesílám notifikaci o směně pro: ${worker.email}`);
          await sendEmail({
            to: worker.email,
            subject: `Nová směna: ${shiftName}`,
            html: getShiftAssignmentTemplate(shiftName, projectName, formattedDate, actionUrl),
            notificationType: 'shift_assignment',
            relatedEntityType: 'shift',
            relatedEntityId: shiftId
          });
        }
      }
    } catch (emailError) {
      console.error('⚠️ Chyba při odesílání notifikací o směně:', emailError);
      // Pokračovat i když email selže
    }

    console.log('✅ Shift created successfully:', shiftId);
    res.status(201).json({ 
      id: shiftId, 
      message: 'Směna byla úspěšně vytvořena' 
    });
  } catch (error: any) {
    console.error('❌ Chyba při vytváření směny:', error);
    res.status(500).json({ message: 'Chyba serveru', details: error.message });
  }
};

export const updateShift = async (req: AuthRequest, res: Response) => {
  try {
    // Check permissions - only manager and foreman can edit
    if (req.user?.role !== 'manager' && req.user?.role !== 'foreman') {
      return res.status(403).json({ message: 'Pouze manažer a stavbyvedoucí mohou upravovat směny' });
    }

    const shiftId = parseInt(req.params.id);
    const { project_id, user_ids, date, start_time, end_time, name, description, status } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: 'Vyberte alespoň jednoho pracovníka' });
    }

    const startDateTime = `${date} ${start_time}:00`;
    const endDateTime = `${date} ${end_time}:00`;

    await pool.query(
      `UPDATE shifts 
       SET name = ?, project_id = ?, start_datetime = ?, end_datetime = ?, description = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [name || `Směna ${date}`, project_id, startDateTime, endDateTime, description || null, status || 'planned', req.user?.id || null, shiftId]
    );

    await pool.query('DELETE FROM shift_workers WHERE shift_id = ?', [shiftId]);
    for (const uid of user_ids) {
      await pool.query(
        `INSERT INTO shift_workers (shift_id, worker_id) VALUES (?, ?)`,
        [shiftId, uid]
      );
    }

    res.json({ message: 'Směna byla úspěšně aktualizována' });
  } catch (error: any) {
    console.error('Chyba při aktualizaci směny:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const deleteShift = async (req: AuthRequest, res: Response) => {
  try {
    // Check permissions - only manager and foreman can delete
    if (req.user?.role !== 'manager' && req.user?.role !== 'foreman') {
      return res.status(403).json({ message: 'Pouze manažer a stavbyvedoucí mohou mazat směny' });
    }

    const shiftId = parseInt(req.params.id);

    await pool.query('DELETE FROM shifts WHERE id = ?', [shiftId]);

    res.json({ message: 'Směna byla úspěšně smazána' });
  } catch (error: any) {
    console.error('Chyba při mazání směny:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const getShiftById = async (req: AuthRequest, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id);
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        s.*, 
        DATE(s.start_datetime) as date,
        TIME_FORMAT(s.start_datetime, '%H:%i') as start_time,
        TIME_FORMAT(s.end_datetime, '%H:%i') as end_time,
        p.name as project_name,
        GROUP_CONCAT(DISTINCT CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as worker_names,
        JSON_ARRAYAGG(
          CASE WHEN u.id IS NULL THEN NULL ELSE JSON_OBJECT(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'role', u.role
          ) END
        ) as workers
      FROM shifts s
      JOIN projects p ON s.project_id = p.id
      LEFT JOIN shift_workers sw ON sw.shift_id = s.id
      LEFT JOIN users u ON sw.worker_id = u.id
      WHERE s.id = ?
      GROUP BY s.id`,
      [shiftId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Směna nenalezena' });
    }

    const row = rows[0];
    const rawWorkers = row.workers;
    const parsedWorkers = typeof rawWorkers === 'string'
      ? JSON.parse(rawWorkers)
      : Array.isArray(rawWorkers)
        ? rawWorkers
        : [];
    const workers = Array.isArray(parsedWorkers)
      ? parsedWorkers.filter((w) => w !== null)
      : [];

    res.json({
      ...row,
      workers,
      worker_names: row.worker_names || ''
    });
  } catch (error: any) {
    console.error('Chyba při načítání detailu směny:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const uploadShiftPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Nejsou nahrány žádné fotografie' });
    }

    // Ověřit, že směna existuje
    const [shifts] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM shifts WHERE id = ?',
      [shiftId]
    );

    if (shifts.length === 0) {
      return res.status(404).json({ message: 'Směna nenalezena' });
    }

    // Vytvořit uploads složku pokud neexistuje
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      // Přesunout soubor do uploads složky
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path);

      const dbFilePath = `/uploads/shifts/${fileName}`;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO shift_photos (shift_id, file_path, file_name, file_size, worker_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [shiftId, dbFilePath, file.originalname, file.size, req.user!.id]
      );

      uploadedPhotos.push({
        id: result.insertId,
        shift_id: shiftId,
        file_path: dbFilePath,
        file_name: file.originalname,
        file_size: file.size,
        uploaded_by_name: req.user!.first_name,
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: 'Fotografie byly úspěšně nahrány',
      photos: uploadedPhotos
    });
  } catch (error: any) {
    console.error('Chyba při nahrávání fotografií:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const getShiftPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id);

    const [photos] = await pool.query<RowDataPacket[]>(
      `SELECT sp.*, CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name
       FROM shift_photos sp
       LEFT JOIN users u ON sp.worker_id = u.id
       WHERE sp.shift_id = ?
       ORDER BY sp.uploaded_at DESC`,
      [shiftId]
    );

    res.json(photos);
  } catch (error: any) {
    console.error('Chyba při načítání fotografií:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const deleteShiftPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);

    const [photos] = await pool.query<RowDataPacket[]>(
      'SELECT file_path FROM shift_photos WHERE id = ? AND shift_id = ?',
      [photoId, shiftId]
    );

    if (photos.length === 0) {
      return res.status(404).json({ message: 'Fotografie nenalezena' });
    }

    const filePath = photos[0].file_path;
    const fullPath = path.join(process.cwd(), 'uploads/shifts', path.basename(filePath));

    // Smazat soubor pokud existuje
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Smazat záznam z databáze
    await pool.query('DELETE FROM shift_photos WHERE id = ?', [photoId]);

    res.json({ message: 'Fotografia byla úspěšně smazána' });
  } catch (error: any) {
    console.error('Chyba při mazání fotografie:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const getShiftTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT st.*, u.first_name, u.last_name 
       FROM shift_tasks st
       LEFT JOIN users u ON st.assigned_worker_id = u.id
       WHERE st.shift_id = ?
       ORDER BY st.order_index, st.created_at`,
      [id]
    );

    res.json(rows);
  } catch (error: any) {
    console.error('Chyba při načítání úkolů:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const createShiftTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, assigned_worker_id, due_date, order_index } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Název úkolu je povinný' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO shift_tasks (shift_id, name, description, assigned_worker_id, due_date, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, description || null, assigned_worker_id || null, due_date || null, order_index || 0]
    );

    res.status(201).json({
      id: result.insertId,
      shift_id: id,
      name,
      description,
      assigned_worker_id,
      due_date,
      order_index,
      status: 'new',
      created_at: new Date(),
      message: 'Úkol byl úspěšně vytvořen'
    });
  } catch (error: any) {
    console.error('Chyba při vytváření úkolu:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const updateShiftTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id, taskId } = req.params;
    const { name, description, assigned_worker_id, due_date, status, order_index } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE shift_tasks 
       SET name = ?, description = ?, assigned_worker_id = ?, due_date = ?, status = ?, order_index = ?
       WHERE id = ? AND shift_id = ?`,
      [name, description || null, assigned_worker_id || null, due_date || null, status, order_index || 0, taskId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Úkol nebyl nalezen' });
    }

    res.json({ message: 'Úkol byl úspěšně aktualizován' });
  } catch (error: any) {
    console.error('Chyba při aktualizaci úkolu:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const deleteShiftTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id, taskId } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM shift_tasks WHERE id = ? AND shift_id = ?`,
      [taskId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Úkol nebyl nalezen' });
    }

    res.json({ message: 'Úkol byl úspěšně smazán' });
  } catch (error: any) {
    console.error('Chyba při mazání úkolu:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};

export const completeShiftTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id, taskId } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE shift_tasks 
       SET status = 'completed', completed_at = NOW()
       WHERE id = ? AND shift_id = ?`,
      [taskId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Úkol nebyl nalezen' });
    }

    res.json({ message: 'Úkol byl označen jako dokončený' });
  } catch (error: any) {
    console.error('Chyba při označování úkolu:', error);
    res.status(500).json({ message: 'Chyba serveru' });
  }
};
