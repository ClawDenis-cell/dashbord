export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
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

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  board_id: string | null;
  status: string;
  priority: string;
  column_name: string;
  created_at: string;
  updated_at: string;
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

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  completed?: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

export interface KanbanConfig {
  id: string;
  board_name: string;
  columns_array: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateKanbanConfigInput {
  board_name?: string;
  columns_array?: string[];
}

export interface KanbanBoard {
  id: string;
  name: string;
  project_id: string;
  columns_array: string[];
  created_at: string;
  updated_at: string;
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
