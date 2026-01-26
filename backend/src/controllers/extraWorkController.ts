import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, getExtraWorkStatusChangeTemplate } from '../services/emailService';

export const createExtraWork = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { project_id, name, description, start_datetime, end_datetime, material_description_text } = req.body;
    const workerId = req.user?.id;

    // Získat název projektu pro automatické generování názvu
    const [projects] = await connection.query('SELECT custom_id FROM projects WHERE id = ?', [project_id]);
    const projectCustomId = (projects as any[])[0]?.custom_id || 'VP';
    
    // Generovat custom_id
    const timestamp = Date.now().toString().slice(-6);
    const customId = `${projectCustomId}-VP-${timestamp}`;

    const [result] = await connection.query(
      `INSERT INTO extra_work 
       (custom_id, name, project_id, worker_id, created_by, description, start_datetime, end_datetime, material_description_text, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [customId, name, project_id, workerId, workerId, description, start_datetime, end_datetime, material_description_text]
    );

    const extraWorkId = (result as any).insertId;

    // Přidat fotografie pokud existují
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        // Uložit cestu bez počátečního 'uploads/' - bude se přidávat při servování
        const filePath = '/' + file.path.replace(/\\/g, '/');
        await connection.query(
          `INSERT INTO extra_work_photos (extra_work_id, file_path, file_name, file_size, mime_type, uploaded_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [extraWorkId, filePath, file.originalname, file.size, file.mimetype, workerId]
        );
      }
    }

    // Materiály z databáze nyní přidává až stavbyvedoucí, dělník píše pouze textový popis

    // Přidat do historie
    await connection.query(
      `INSERT INTO extra_work_history (extra_work_id, action, status_to, user_id)
       VALUES (?, 'created', 'draft', ?)`,
      [extraWorkId, workerId]
    );

    await connection.commit();
    res.status(201).json({ message: 'Vícepráce vytvořena', id: extraWorkId });
  } catch (error) {
    await connection.rollback();
    console.error('Chyba při vytváření vícepráce:', error);
    res.status(500).json({ message: 'Chyba při vytváření vícepráce', error: String(error) });
  } finally {
    connection.release();
  }
};

export const submitExtraWorkToForeman = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Najít stavbyvedoucího pro tuto stavbu
    const [extraWorks] = await connection.query(
      'SELECT ew.*, p.name as project_name FROM extra_work ew JOIN projects p ON ew.project_id = p.id WHERE ew.id = ?',
      [id]
    );
    const extraWork = (extraWorks as any[])[0];

    // Povolit znovuodeslání jen z draft / returned_to_worker
    if (!['draft', 'returned_to_worker'].includes(extraWork.status)) {
      return res.status(400).json({ error: 'Vícepráce nemůže být odeslána z tohoto stavu' });
    }

    const [foremen] = await connection.query(
      `SELECT u.email FROM users u 
       JOIN project_foremen pf ON u.id = pf.foreman_id 
       WHERE pf.project_id = ? LIMIT 1`,
      [extraWork.project_id]
    );

    const foreman = (foremen as any[])[0];

    // Aktualizovat status
    await connection.query(
      `UPDATE extra_work SET status = 'submitted_to_foreman', updated_by = ? WHERE id = ?`,
      [req.user?.id, id]
    );

    // Přidat do historie se správným původním stavem
    await connection.query(
      `INSERT INTO extra_work_history (extra_work_id, action, status_from, status_to, user_id)
       VALUES (?, 'submitted', ?, 'submitted_to_foreman', ?)`,
      [id, extraWork.status, req.user?.id]
    );

    await connection.commit();

    // Odeslat e-mail stavbyvedoucímu (neblokující)
    if (foreman) {
      try {
        await sendEmail({
          to: foreman.email,
          subject: `Nová vícepráce ke kontrole: ${extraWork.name || extraWork.custom_id}`,
          html: getExtraWorkStatusChangeTemplate(extraWork.name || extraWork.custom_id, 'submitted_to_foreman', `${process.env.FRONTEND_URL}/extra-work/${id}`),
          notificationType: 'extra_work_status',
          relatedEntityType: 'extra_work',
          relatedEntityId: parseInt(id)
        });
      } catch (emailError) {
        console.error('Email se nepodařilo odeslat:', emailError);
        // Pokračovat i když email selže
      }
    }

    res.json({ message: 'Vícepráce odeslána ke kontrole' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Chyba při odesílání vícepráce' });
  } finally {
    connection.release();
  }
};

export const addMaterialsToExtraWork = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { materials } = req.body; // [{ materialId, quantity }]

    // Smazat staré materiály
    await connection.query('DELETE FROM extra_work_materials WHERE extra_work_id = ?', [id]);

    // Přidat nové materiály
    for (const material of materials) {
      const [materialData] = await connection.query(
        'SELECT unit_price, unit FROM materials WHERE id = ?',
        [material.materialId]
      );
      const unitPrice = (materialData as any[])[0]?.unit_price;
      const unit = (materialData as any[])[0]?.unit || 'ks';

      await connection.query(
        `INSERT INTO extra_work_materials (extra_work_id, material_id, quantity, unit, unit_price_snapshot, added_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, material.materialId, material.quantity, unit, unitPrice, req.user?.id]
      );
    }

    await connection.commit();
    res.json({ message: 'Materiály přidány' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Chyba při přidávání materiálů' });
  } finally {
    connection.release();
  }
};

export const submitExtraWorkToManager = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [extraWorks] = await connection.query(
      'SELECT ew.*, p.name as project_name FROM extra_work ew JOIN projects p ON ew.project_id = p.id WHERE ew.id = ?',
      [id]
    );
    const extraWork = (extraWorks as any[])[0];

    // Povolit znovuodeslání z submitted_to_foreman i returned_to_foreman
    if (!['submitted_to_foreman', 'returned_to_foreman'].includes(extraWork.status)) {
      return res.status(400).json({ error: 'Vícepráce nemůže být odeslána manažerovi z tohoto stavu' });
    }

    const [managers] = await connection.query(
      `SELECT u.email FROM users u 
       JOIN project_managers pm ON u.id = pm.manager_id 
       WHERE pm.project_id = ? LIMIT 1`,
      [extraWork.project_id]
    );

    const manager = (managers as any[])[0];

    await connection.query(
      `UPDATE extra_work SET status = 'submitted_to_manager', updated_by = ? WHERE id = ?`,
      [req.user?.id, id]
    );

    await connection.query(
      `INSERT INTO extra_work_history (extra_work_id, action, status_from, status_to, user_id)
       VALUES (?, 'submitted', ?, 'submitted_to_manager', ?)`,
      [id, extraWork.status, req.user?.id]
    );

    await connection.commit();

    if (manager) {
      try {
        await sendEmail({
          to: manager.email,
          subject: `Vícepráce ke schválení: ${extraWork.name || extraWork.custom_id}`,
          html: getExtraWorkStatusChangeTemplate(extraWork.name || extraWork.custom_id, 'submitted_to_manager', `${process.env.FRONTEND_URL}/extra-work/${id}`),
          notificationType: 'extra_work_status',
          relatedEntityType: 'extra_work',
          relatedEntityId: parseInt(id)
        });
      } catch (emailError) {
        console.error('Email se nepodařilo odeslat:', emailError);
      }
    }

    res.json({ message: 'Vícepráce odeslána manažerovi' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Chyba při odesílání vícepráce' });
  } finally {
    connection.release();
  }
};

export const approveExtraWork = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [extraWorks] = await connection.query(
      'SELECT ew.*, u.email as worker_email FROM extra_work ew JOIN users u ON ew.worker_id = u.id WHERE ew.id = ?',
      [id]
    );
    const extraWork = (extraWorks as any[])[0];

    await connection.query(
      `UPDATE extra_work SET status = 'approved', updated_by = ? WHERE id = ?`,
      [req.user?.id, id]
    );

    await connection.query(
      `INSERT INTO extra_work_history (extra_work_id, action, status_from, status_to, user_id)
       VALUES (?, 'approved', 'submitted_to_manager', 'approved', ?)`,
      [id, req.user?.id]
    );

    await connection.commit();

    try {
      await sendEmail({
        to: extraWork.worker_email,
        subject: `Vícepráce schválena: ${extraWork.name || extraWork.custom_id}`,
        html: getExtraWorkStatusChangeTemplate(extraWork.name || extraWork.custom_id, 'approved', `${process.env.FRONTEND_URL}/extra-work/${id}`),
        notificationType: 'extra_work_status',
        relatedEntityType: 'extra_work',
        relatedEntityId: parseInt(id)
      });
    } catch (emailError) {
      console.error('Email se nepodařilo odeslat:', emailError);
    }

    res.json({ message: 'Vícepráce schválena' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Chyba při schvalování vícepráce' });
  } finally {
    connection.release();
  }
};

export const getExtraWorkById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [extraWorks] = await pool.query(`
      SELECT ew.*, 
             p.name as project_name,
             u.first_name as worker_first_name, u.last_name as worker_last_name,
             creator.first_name as created_by_first_name, creator.last_name as created_by_last_name
      FROM extra_work ew
      JOIN projects p ON ew.project_id = p.id
      JOIN users u ON ew.worker_id = u.id
      LEFT JOIN users creator ON ew.created_by = creator.id
      WHERE ew.id = ?
    `, [id]);

    const extraWork = (extraWorks as any[])[0];

    if (!extraWork) {
      return res.status(404).json({ error: 'Vícepráce nenalezena' });
    }

    // Načíst fotografie
    const [photos] = await pool.query(
      'SELECT * FROM extra_work_photos WHERE extra_work_id = ?',
      [id]
    );

    // Načíst materiály
    const [materials] = await pool.query(`
      SELECT ewm.*, m.name, m.unit, m.description
      FROM extra_work_materials ewm
      JOIN materials m ON ewm.material_id = m.id
      WHERE ewm.extra_work_id = ?
    `, [id]);

    // Načíst historii
    const [history] = await pool.query(`
      SELECT ewh.*, u.first_name, u.last_name
      FROM extra_work_history ewh
      LEFT JOIN users u ON ewh.user_id = u.id
      WHERE ewh.extra_work_id = ?
      ORDER BY ewh.action_datetime DESC
    `, [id]);

    // Připravit komentáře pro frontend (důvody vrácení atd.)
    const comments = (history as any[]).map((item) => ({
      author_name: item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : 'Systém',
      created_at: item.action_datetime,
      comment: item.note || item.action
    }));

    res.json({ ...extraWork, photos, materials, history, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chyba při načítání vícepráce' });
  }
};

export const getAllExtraWorks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, projectId } = req.query;
    let query = `
      SELECT ew.*, 
             p.name as project_name,
             u.first_name as worker_first_name, u.last_name as worker_last_name,
             creator.first_name as created_by_first_name, creator.last_name as created_by_last_name
      FROM extra_work ew
      JOIN projects p ON ew.project_id = p.id
      JOIN users u ON ew.worker_id = u.id
      LEFT JOIN users creator ON ew.created_by = creator.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ' AND ew.status = ?';
      params.push(status);
    }

    if (projectId) {
      query += ' AND ew.project_id = ?';
      params.push(projectId);
    }

    // Filtrovat podle role
    if (req.user?.role === 'worker') {
      query += ' AND ew.worker_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY ew.created_at DESC';

    const [extraWorks] = await pool.query(query, params);
    res.json(extraWorks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chyba při načítání víceprací' });
  }
};

export const returnExtraWorkToWorker = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { comment } = req.body;

    const [extraWorks] = await connection.query(
      'SELECT ew.*, u.email as worker_email FROM extra_work ew JOIN users u ON ew.worker_id = u.id WHERE ew.id = ?',
      [id]
    );
    const extraWork = (extraWorks as any[])[0];

    if (extraWork.status !== 'submitted_to_foreman') {
      return res.status(400).json({ error: 'Vícepráce nemůže být vrácena z tohoto stavu' });
    }

    await connection.query(
      `UPDATE extra_work SET status = 'returned_to_worker', updated_by = ? WHERE id = ?`,
      [req.user?.id, id]
    );

    await connection.query(
      `INSERT INTO extra_work_history (extra_work_id, action, status_from, status_to, user_id, note)
       VALUES (?, 'returned', 'submitted_to_foreman', 'returned_to_worker', ?, ?)`,
      [id, req.user?.id, comment || '']
    );

    // Vytvořit notifikaci
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, action_url)
       VALUES (?, ?, ?, 'warning', 'extra_work', ?, ?)`,
      [extraWork.worker_id, 'Vícepráce vrácena', `Vícepráce ${extraWork.name || extraWork.custom_id} byla vrácena stavbyvedoucím. ${comment ? 'Důvod: ' + comment : ''}`, id, `/extra-work/${id}`]
    );

    await connection.commit();

    // Email notifikace (optional - wrapped in try-catch)
    try {
      await sendEmail({
        to: extraWork.worker_email,
        subject: `Vícepráce vrácena: ${extraWork.name || extraWork.custom_id}`,
        html: `<p>Vícepráce <strong>${extraWork.name || extraWork.custom_id}</strong> byla vrácena stavbyvedoucím.</p>${comment ? `<p><strong>Důvod:</strong> ${comment}</p>` : ''}`,
        notificationType: 'extra_work_returned',
        relatedEntityType: 'extra_work',
        relatedEntityId: parseInt(id)
      });
    } catch (emailError) {
      console.error('Email se nepodařilo odeslat:', emailError);
    }

    res.json({ message: 'Vícepráce vrácena dělníkovi' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Chyba při vrácení vícepráce' });
  } finally {
    connection.release();
  }
};

export const returnExtraWorkToForeman = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { comment } = req.body;

    const [extraWorks] = await connection.query(
      `SELECT ew.*, creator.email as foreman_email, creator.id as foreman_id FROM extra_work ew 
       LEFT JOIN users creator ON ew.created_by = creator.id 
       WHERE ew.id = ? LIMIT 1`,
      [id]
    );
    const extraWork = (extraWorks as any[])[0];

    if (!extraWork) {
      return res.status(404).json({ error: 'Vícepráce nenalezena' });
    }

    if (extraWork.status !== 'submitted_to_manager') {
      return res.status(400).json({ error: 'Vícepráce nemůže být vrácena z tohoto stavu' });
    }

    await connection.query(
      `UPDATE extra_work SET status = 'returned_to_foreman', updated_by = ? WHERE id = ?`,
      [req.user?.id, id]
    );

    await connection.query(
      `INSERT INTO extra_work_history (extra_work_id, action, status_from, status_to, user_id, note)
       VALUES (?, 'returned', 'submitted_to_manager', 'returned_to_foreman', ?, ?)`,
      [id, req.user?.id, comment || '']
    );

    // Vytvořit notifikaci stavbyvedoucímu (creator)
    if (extraWork.foreman_id) {
      await connection.query(
        `INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, action_url)
         VALUES (?, ?, ?, 'warning', 'extra_work', ?, ?)`,
        [extraWork.foreman_id, 'Vícepráce vrácena', `Vícepráce ${extraWork.name || extraWork.custom_id} byla vrácena manažerem. ${comment ? 'Důvod: ' + comment : ''}`, id, `/extra-work/${id}`]
      );
    }

    await connection.commit();

    // Email notifikace (optional)
    if (extraWork.foreman_email) {
      try {
        await sendEmail({
          to: extraWork.foreman_email,
          subject: `Vícepráce vrácena: ${extraWork.name || extraWork.custom_id}`,
          html: `<p>Vícepráce <strong>${extraWork.name || extraWork.custom_id}</strong> byla vrácena manažerem.</p>${comment ? `<p><strong>Důvod:</strong> ${comment}</p>` : ''}`,
          notificationType: 'extra_work_returned',
          relatedEntityType: 'extra_work',
          relatedEntityId: parseInt(id)
        });
      } catch (emailError) {
        console.error('Email se nepodařilo odeslat:', emailError);
      }
    }

    res.json({ message: 'Vícepráce vrácena stavbyvedoucímu' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Chyba při vrácení vícepráce' });
  } finally {
    connection.release();
  }
};
