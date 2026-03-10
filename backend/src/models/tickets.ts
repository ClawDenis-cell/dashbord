import pool from '../config/database';

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  board_id: string | null;
  status: string;
  priority: string;
  column_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  project_id?: string;
  board_id?: string;
  status?: string;
  priority?: string;
  column_name?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  project_id?: string;
  board_id?: string;
  status?: string;
  priority?: string;
  column_name?: string;
}

export const TicketModel = {
  async findAll(): Promise<Ticket[]> {
    const result = await pool.query(
      'SELECT * FROM tickets ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: string): Promise<Ticket | null> {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByProjectId(projectId: string): Promise<Ticket[]> {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  },

  async findByBoardId(boardId: string): Promise<Ticket[]> {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE board_id = $1 ORDER BY created_at DESC',
      [boardId]
    );
    return result.rows;
  },

  async create(input: CreateTicketInput): Promise<Ticket> {
    const { title, description, project_id, board_id, status = 'open', priority = 'medium', column_name = 'To Do' } = input;
    const result = await pool.query(
      `INSERT INTO tickets (title, description, project_id, board_id, status, priority, column_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description || null, project_id || null, board_id || null, status, priority, column_name]
    );
    return result.rows[0];
  },

  async update(id: string, input: UpdateTicketInput): Promise<Ticket | null> {
    const { title, description, project_id, board_id, status, priority, column_name } = input;
    const result = await pool.query(
      `UPDATE tickets 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           project_id = COALESCE($3, project_id),
           board_id = COALESCE($4, board_id),
           status = COALESCE($5, status),
           priority = COALESCE($6, priority),
           column_name = COALESCE($7, column_name)
       WHERE id = $8 
       RETURNING *`,
      [title, description, project_id, board_id, status, priority, column_name, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tickets WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
};
