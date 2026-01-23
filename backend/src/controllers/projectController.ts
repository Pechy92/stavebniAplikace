import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllProjects = async (req: AuthRequest, res: Response) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, 
             GROUP_CONCAT(DISTINCT CONCAT(m.first_name, ' ', m.last_name) SEPARATOR ', ') as managers,
             GROUP_CONCAT(DISTINCT CONCAT(f.first_name, ' ', f.last_name) SEPARATOR ', ') as foremen
      FROM projects p
      LEFT JOIN project_managers pm ON p.id = pm.project_id
      LEFT JOIN users m ON pm.manager_id = m.id
      LEFT JOIN project_foremen pf ON p.id = pf.project_id
      LEFT JOIN users f ON pf.foreman_id = f.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání staveb' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    const project = (projects as any[])[0];

    if (!project) {
      return res.status(404).json({ error: 'Stavba nenalezena' });
    }

    // Načíst manažery
    const [managers] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN project_managers pm ON u.id = pm.manager_id
      WHERE pm.project_id = ?
    `, [id]);

    // Načíst stavbyvedoucí
    const [foremen] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN project_foremen pf ON u.id = pf.foreman_id
      WHERE pf.project_id = ?
    `, [id]);

    res.json({ ...project, managers, foremen });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání stavby' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { name, customId, address, startDate, plannedEndDate, status, managerIds, foremanIds } = req.body;

    // Vložit projekt
    const [result] = await connection.query(
      `INSERT INTO projects (name, custom_id, address, start_date, planned_end_date, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, customId, address, startDate, plannedEndDate, status || 'preparation', req.user?.id]
    );

    const projectId = (result as any).insertId;

    // Přiřadit manažery
    if (managerIds && managerIds.length > 0) {
      for (const managerId of managerIds) {
        await connection.query(
          'INSERT INTO project_managers (project_id, manager_id) VALUES (?, ?)',
          [projectId, managerId]
        );
      }
    }

    // Přiřadit stavbyvedoucí
    if (foremanIds && foremanIds.length > 0) {
      for (const foremanId of foremanIds) {
        await connection.query(
          'INSERT INTO project_foremen (project_id, foreman_id) VALUES (?, ?)',
          [projectId, foremanId]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Stavba vytvořena', projectId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Chyba při vytváření stavby' });
  } finally {
    connection.release();
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { name, customId, address, startDate, plannedEndDate, status, managerIds, foremanIds } = req.body;

    // Aktualizovat projekt
    await connection.query(
      `UPDATE projects 
       SET name = ?, custom_id = ?, address = ?, start_date = ?, planned_end_date = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [name, customId, address, startDate, plannedEndDate, status, req.user?.id, id]
    );

    // Smazat staré přiřazení manažerů a přidat nové
    await connection.query('DELETE FROM project_managers WHERE project_id = ?', [id]);
    if (managerIds && managerIds.length > 0) {
      for (const managerId of managerIds) {
        await connection.query(
          'INSERT INTO project_managers (project_id, manager_id) VALUES (?, ?)',
          [id, managerId]
        );
      }
    }

    // Smazat staré přiřazení stavbyvedoucích a přidat nové
    await connection.query('DELETE FROM project_foremen WHERE project_id = ?', [id]);
    if (foremanIds && foremanIds.length > 0) {
      for (const foremanId of foremanIds) {
        await connection.query(
          'INSERT INTO project_foremen (project_id, foreman_id) VALUES (?, ?)',
          [id, foremanId]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Stavba aktualizována' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Chyba při aktualizaci stavby' });
  } finally {
    connection.release();
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Stavba smazána' });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při mazání stavby' });
  }
};
