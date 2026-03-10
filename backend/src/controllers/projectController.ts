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

    console.log('📥 Backend received body:', JSON.stringify(req.body, null, 2));
    const { name, custom_id, address, start_date, planned_end_date, status, manager_ids, foreman_ids } = req.body;
    console.log('📝 Extracted values:', { name, custom_id, address, start_date, planned_end_date, status });

    // Vložit projekt
    const [result] = await connection.query(
      `INSERT INTO projects (name, custom_id, address, start_date, planned_end_date, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, custom_id, address, start_date, planned_end_date, status || 'preparation', req.user?.id]
    );

    const projectId = (result as any).insertId;

    // Přiřadit manažery
    if (manager_ids && manager_ids.length > 0) {
      for (const managerId of manager_ids) {
        await connection.query(
          'INSERT INTO project_managers (project_id, manager_id) VALUES (?, ?)',
          [projectId, managerId]
        );
      }
    }

    // Přiřadit stavbyvedoucí
    if (foreman_ids && foreman_ids.length > 0) {
      for (const foremanId of foreman_ids) {
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
    console.log('📥 Backend UPDATE received body:', JSON.stringify(req.body, null, 2));
    const { name, custom_id, address, start_date, planned_end_date, status, manager_ids, foreman_ids } = req.body;
    console.log('📝 Extracted values for update:', { name, custom_id, address, start_date, planned_end_date, status });

    // Aktualizovat projekt
    await connection.query(
      `UPDATE projects 
       SET name = ?, custom_id = ?, address = ?, start_date = ?, planned_end_date = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [name, custom_id, address, start_date, planned_end_date, status, req.user?.id, id]
    );

    // Smazat staré přiřazení manažerů a přidat nové
    await connection.query('DELETE FROM project_managers WHERE project_id = ?', [id]);
    if (manager_ids && manager_ids.length > 0) {
      for (const managerId of manager_ids) {
        await connection.query(
          'INSERT INTO project_managers (project_id, manager_id) VALUES (?, ?)',
          [id, managerId]
        );
      }
    }

    // Smazat staré přiřazení stavbyvedoucích a přidat nové
    await connection.query('DELETE FROM project_foremen WHERE project_id = ?', [id]);
    if (foreman_ids && foreman_ids.length > 0) {
      for (const foremanId of foreman_ids) {
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

export const getProjectManagers = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [managers] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role
      FROM users u
      JOIN project_managers pm ON u.id = pm.manager_id
      WHERE pm.project_id = ?
    `, [id]);
    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání manažerů' });
  }
};

export const getProjectForemen = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [foremen] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role
      FROM users u
      JOIN project_foremen pf ON u.id = pf.foreman_id
      WHERE pf.project_id = ?
    `, [id]);
    res.json(foremen);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání stavbyvedoucích' });
  }
};

export const getProjectOverview = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isFinite(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'Neplatné ID projektu' });
    }

    const [projects] = await pool.query(
      'SELECT id, name, custom_id, status, start_date, planned_end_date FROM projects WHERE id = ?',
      [projectId]
    );
    const project = (projects as any[])[0];

    if (!project) {
      return res.status(404).json({ error: 'Stavba nenalezena' });
    }

    // Manažer vidí jen přiřazené projekty, admin vidí vše.
    if (req.user?.role === 'manager') {
      const [assignments] = await pool.query(
        'SELECT 1 FROM project_managers WHERE project_id = ? AND manager_id = ? LIMIT 1',
        [projectId, req.user.id]
      );

      if (!(assignments as any[])[0]) {
        return res.status(403).json({ error: 'Nemáte oprávnění k tomuto projektu' });
      }
    }

    const [shiftRows] = await pool.query(
      `SELECT 
         COUNT(*) AS total_shifts,
         COALESCE(SUM(duration_hours), 0) AS total_shift_hours,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_shifts,
         SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) AS planned_shifts,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_shifts,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_shifts
       FROM shifts
       WHERE project_id = ?`,
      [projectId]
    );

    const [extraWorkRows] = await pool.query(
      `SELECT
         COUNT(DISTINCT ew.id) AS total_extra_works,
         SUM(CASE WHEN ew.status = 'approved' THEN 1 ELSE 0 END) AS approved_extra_works,
         SUM(CASE WHEN ew.status = 'submitted_to_foreman' THEN 1 ELSE 0 END) AS waiting_foreman,
         SUM(CASE WHEN ew.status = 'submitted_to_manager' THEN 1 ELSE 0 END) AS waiting_manager,
         SUM(CASE WHEN ew.status IN ('returned_to_worker', 'returned_to_foreman') THEN 1 ELSE 0 END) AS returned_extra_works,
         COALESCE(SUM(ewm.total_price), 0) AS total_material_cost,
         COALESCE(SUM(ewm.quantity), 0) AS total_material_quantity,
         COUNT(DISTINCT ewm.material_id) AS unique_material_types
       FROM extra_work ew
       LEFT JOIN extra_work_materials ewm ON ew.id = ewm.extra_work_id
       WHERE ew.project_id = ?`,
      [projectId]
    );

    const [topMaterialsRows] = await pool.query(
      `SELECT
         m.id,
         m.name,
         m.unit,
         COALESCE(SUM(ewm.quantity), 0) AS total_quantity,
         COALESCE(SUM(ewm.total_price), 0) AS total_cost,
         COUNT(DISTINCT ew.id) AS used_in_extra_works
       FROM extra_work_materials ewm
       JOIN extra_work ew ON ew.id = ewm.extra_work_id
       JOIN materials m ON m.id = ewm.material_id
       WHERE ew.project_id = ?
       GROUP BY m.id, m.name, m.unit
       ORDER BY total_cost DESC, total_quantity DESC
       LIMIT 8`,
      [projectId]
    );

    const [shiftTrendRows] = await pool.query(
      `SELECT
         DATE_FORMAT(start_datetime, '%Y-%m') AS month_key,
         COUNT(*) AS shifts_count,
         COALESCE(SUM(duration_hours), 0) AS shift_hours
       FROM shifts
       WHERE project_id = ?
         AND start_datetime >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
       GROUP BY DATE_FORMAT(start_datetime, '%Y-%m')`,
      [projectId]
    );

    const [extraTrendRows] = await pool.query(
      `SELECT
         DATE_FORMAT(ew.created_at, '%Y-%m') AS month_key,
         COUNT(DISTINCT ew.id) AS extra_work_count,
         COALESCE(SUM(ewm.total_price), 0) AS material_cost
       FROM extra_work ew
       LEFT JOIN extra_work_materials ewm ON ew.id = ewm.extra_work_id
       WHERE ew.project_id = ?
         AND ew.created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
       GROUP BY DATE_FORMAT(ew.created_at, '%Y-%m')`,
      [projectId]
    );

    const now = new Date();
    const monthKeys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push(key);
    }

    const shiftTrendMap = new Map((shiftTrendRows as any[]).map((row) => [row.month_key, row]));
    const extraTrendMap = new Map((extraTrendRows as any[]).map((row) => [row.month_key, row]));

    const monthlyTrends = monthKeys.map((key) => {
      const shift = shiftTrendMap.get(key);
      const extra = extraTrendMap.get(key);
      const [year, month] = key.split('-');
      return {
        month_key: key,
        label: `${month}/${year}`,
        shifts_count: Number(shift?.shifts_count || 0),
        shift_hours: Number(shift?.shift_hours || 0),
        extra_work_count: Number(extra?.extra_work_count || 0),
        material_cost: Number(extra?.material_cost || 0)
      };
    });

    const shiftStats = (shiftRows as any[])[0] || {};
    const extraStats = (extraWorkRows as any[])[0] || {};
    const totalShifts = Number(shiftStats.total_shifts || 0);
    const totalExtraWorks = Number(extraStats.total_extra_works || 0);
    const totalMaterialCost = Number(extraStats.total_material_cost || 0);

    res.json({
      project,
      summary: {
        total_shifts: totalShifts,
        total_shift_hours: Number(shiftStats.total_shift_hours || 0),
        completed_shifts: Number(shiftStats.completed_shifts || 0),
        planned_shifts: Number(shiftStats.planned_shifts || 0),
        in_progress_shifts: Number(shiftStats.in_progress_shifts || 0),
        cancelled_shifts: Number(shiftStats.cancelled_shifts || 0),
        total_extra_works: totalExtraWorks,
        approved_extra_works: Number(extraStats.approved_extra_works || 0),
        waiting_foreman: Number(extraStats.waiting_foreman || 0),
        waiting_manager: Number(extraStats.waiting_manager || 0),
        returned_extra_works: Number(extraStats.returned_extra_works || 0),
        unique_material_types: Number(extraStats.unique_material_types || 0),
        total_material_quantity: Number(extraStats.total_material_quantity || 0),
        total_material_cost: totalMaterialCost,
        avg_material_cost_per_shift: totalShifts > 0 ? totalMaterialCost / totalShifts : 0,
        avg_material_cost_per_extra_work: totalExtraWorks > 0 ? totalMaterialCost / totalExtraWorks : 0
      },
      top_materials: (topMaterialsRows as any[]).map((row) => ({
        id: Number(row.id),
        name: row.name,
        unit: row.unit,
        total_quantity: Number(row.total_quantity || 0),
        total_cost: Number(row.total_cost || 0),
        used_in_extra_works: Number(row.used_in_extra_works || 0)
      })),
      monthly_trends: monthlyTrends
    });
  } catch (error) {
    console.error('Project overview error:', error);
    res.status(500).json({ error: 'Chyba při načítání přehledu projektu' });
  }
};
