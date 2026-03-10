import type React from 'react';
import { motion } from 'framer-motion';
import { Todo } from '../../types';
import { useTodoStore } from '../../store';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodo, deleteTodo } = useTodoStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center justify-between p-3.5 glass-card-sm transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleTodo(todo.id, !todo.completed)}
          className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: todo.completed ? 'var(--color-accent)' : 'var(--color-border)',
            background: todo.completed ? 'var(--color-accent)' : 'transparent',
          }}
        >
          {todo.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <span
          className="text-sm transition-all duration-200"
          style={{
            color: todo.completed ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            textDecoration: todo.completed ? 'line-through' : 'none',
            opacity: todo.completed ? 0.6 : 1,
          }}
        >
          {todo.title}
        </span>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-60 hover:opacity-100 transition-opacity text-sm w-6 h-6 flex items-center justify-center rounded"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseOver={(e) => e.currentTarget.style.color = '#f87171'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
      >
        x
      </button>
    </motion.div>
  );
};
