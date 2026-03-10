import pool from '../config/database';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTodoInput {
  title: string;
  completed?: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

export const TodoModel = {
  async findAll(): Promise<Todo[]> {
    const result = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: string): Promise<Todo | null> {
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByStatus(completed: boolean): Promise<Todo[]> {
    const result = await pool.query(
      'SELECT * FROM todos WHERE completed = $1 ORDER BY created_at DESC',
      [completed]
    );
    return result.rows;
  },

  async create(input: CreateTodoInput): Promise<Todo> {
    const { title, completed = false } = input;
    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title, completed]
    );
    return result.rows[0];
  },

  async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    const { title, completed } = input;
    const result = await pool.query(
      `UPDATE todos 
       SET title = COALESCE($1, title), 
           completed = COALESCE($2, completed)
       WHERE id = $3 
       RETURNING *`,
      [title, completed, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
};
