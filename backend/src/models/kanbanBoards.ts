import pool from '../config/database';

export interface KanbanBoard {
  id: string;
  name: string;
  project_id: string;
  columns_array: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateKanbanBoardInput {
  name: string;
  project_id: string;
  columns_array?: string[];
}

export interface UpdateKanbanBoardInput {
  name?: string;
  columns_array?: string[];
}

export const KanbanBoardModel = {
  async findByProjectId(projectId: string): Promise<KanbanBoard[]> {
    const result = await pool.query(
      'SELECT * FROM kanban_boards WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  },

  async findById(id: string): Promise<KanbanBoard | null> {
    const result = await pool.query(
      'SELECT * FROM kanban_boards WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByProjectAndId(projectId: string, id: string): Promise<KanbanBoard | null> {
    const result = await pool.query(
      'SELECT * FROM kanban_boards WHERE id = $1 AND project_id = $2',
      [id, projectId]
    );
    return result.rows[0] || null;
  },

  async create(input: CreateKanbanBoardInput): Promise<KanbanBoard> {
    const { name, project_id, columns_array = ['To Do', 'In Progress', 'Done'] } = input;
    const result = await pool.query(
      `INSERT INTO kanban_boards (name, project_id, columns_array) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, project_id, columns_array]
    );
    return result.rows[0];
  },

  async update(id: string, input: UpdateKanbanBoardInput): Promise<KanbanBoard | null> {
    const { name, columns_array } = input;
    const result = await pool.query(
      `UPDATE kanban_boards 
       SET name = COALESCE($1, name), 
           columns_array = COALESCE($2, columns_array)
       WHERE id = $3 
       RETURNING *`,
      [name, columns_array, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM kanban_boards WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  async countByProjectId(projectId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM kanban_boards WHERE project_id = $1',
      [projectId]
    );
    return parseInt(result.rows[0].count, 10);
  }
};