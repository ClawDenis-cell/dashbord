import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTodoStore } from '../store';
import { TodoItem } from '../components/todos/TodoItem';
import { TodoForm } from '../components/todos/TodoForm';

export const TodosPage = () => {
  const { todos, fetchTodos } = useTodoStore();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Todos
      </motion.h2>

      <TodoForm />

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Active ({activeTodos.length})
          </h3>
          <div className="space-y-2">
            {activeTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
            {activeTodos.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                No active todos. Add one above.
              </p>
            )}
          </div>
        </div>

        {completedTodos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Completed ({completedTodos.length})
            </h3>
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
