import pool from '../config/database';

export interface KanbanConfig {
  id: string;
  board_name: string;
  columns_array: string[];
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKanbanConfigInput {
  board_name?: string;
  columns_array?: string[];
  user_id?: string;
}

export interface UpdateKanbanConfigInput {
  board_name?: string;
  columns_array?: string[];
}

export const KanbanConfigModel = {
  async findByUserId(userId: string = 'default'): Promise<KanbanConfig | null> {
    const result = await pool.query(
      'SELECT * FROM kanban_config WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  },

  async findAll(): Promise<KanbanConfig[]> {
    const result = await pool.query(
      'SELECT * FROM kanban_config ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async create(input: CreateKanbanConfigInput): Promise<KanbanConfig> {
    const { board_name = 'Main Board', columns_array = ['To Do', 'In Progress', 'Done'], user_id = 'default' } = input;
    const result = await pool.query(
      `INSERT INTO kanban_config (board_name, columns_array, user_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [board_name, columns_array, user_id]
    );
    return result.rows[0];
  },

  async update(userId: string, input: UpdateKanbanConfigInput): Promise<KanbanConfig | null> {
    const { board_name, columns_array } = input;
    const result = await pool.query(
      `UPDATE kanban_config 
       SET board_name = COALESCE($1, board_name), 
           columns_array = COALESCE($2, columns_array)
       WHERE user_id = $3 
       RETURNING *`,
      [board_name, columns_array, userId]
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM kanban_config WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
};
