import pool from '../config/database';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
}

export const ProjectModel = {
  async findAll(): Promise<Project[]> {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: string): Promise<Project | null> {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create(input: CreateProjectInput): Promise<Project> {
    const { name, description, color = '#3B82F6' } = input;
    const result = await pool.query(
      'INSERT INTO projects (name, description, color) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, color]
    );
    return result.rows[0];
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const { name, description, color } = input;
    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           color = COALESCE($3, color)
       WHERE id = $4 
       RETURNING *`,
      [name, description, color, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
};
