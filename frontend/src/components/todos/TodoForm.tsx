import React, { useState } from 'react';
import { useTodoStore } from '../../store';
import { Button } from '../common/Button';

export const TodoForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const { createTodo } = useTodoStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await createTodo({ title });
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit">Add</Button>
    </form>
  );
};
