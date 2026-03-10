import React, { useState } from 'react';
import { Todo } from '../../types';
import { useTodoStore } from '../../store';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodo, deleteTodo } = useTodoStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id, !todo.completed)}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className={todo.completed ? 'line-through text-gray-500' : ''}>
          {todo.title}
        </span>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="text-gray-400 hover:text-red-500"
      >
        ×
      </button>
    </div>
  );
};
