import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllMaterials = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT id, name, description, unit_price, unit, category, sku FROM materials WHERE is_active = TRUE';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY name';

    const [materials] = await pool.query(query, params);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání materiálů' });
  }
};

export const getMaterialById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    const material = (materials as any[])[0];

    if (!material) {
      return res.status(404).json({ error: 'Materiál nenalezen' });
    }

    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání materiálu' });
  }
};

export const createMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, unitPrice, unit, category, sku } = req.body;

    const [result] = await pool.query(
      `INSERT INTO materials (name, description, unit_price, unit, category, sku, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, unitPrice, unit, category, sku, req.user?.id]
    );

    res.status(201).json({ message: 'Materiál vytvořen', materialId: (result as any).insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Materiál s tímto SKU již existuje' });
    }
    res.status(500).json({ error: 'Chyba při vytváření materiálu' });
  }
};

export const updateMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, unitPrice, unit, category, sku } = req.body;

    await pool.query(
      `UPDATE materials 
       SET name = ?, description = ?, unit_price = ?, unit = ?, category = ?, sku = ?, updated_by = ?
       WHERE id = ?`,
      [name, description, unitPrice, unit, category, sku, req.user?.id, id]
    );

    res.json({ message: 'Materiál aktualizován' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Materiál s tímto SKU již existuje' });
    }
    res.status(500).json({ error: 'Chyba při aktualizaci materiálu' });
  }
};

export const deleteMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Soft delete
    await pool.query('UPDATE materials SET is_active = FALSE WHERE id = ?', [id]);
    res.json({ message: 'Materiál smazán' });
  } catch (error) {
    res.status(500).json({ error: 'Chyba při mazání materiálu' });
  }
};
