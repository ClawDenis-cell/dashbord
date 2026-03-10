import React, { useEffect } from 'react';
import { useTodoStore } from '../../store';
import { TodoItem } from '../../components/todos/TodoItem';
import { TodoForm } from '../../components/todos/TodoForm';

export const TodosPage: React.FC = () => {
  const { todos, fetchTodos } = useTodoStore();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Todos</h2>

      <TodoForm />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Active ({activeTodos.length})
          </h3>
          <div className="space-y-2">
            {activeTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </div>

        {completedTodos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
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
